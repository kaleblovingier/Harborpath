// public/js/views/giCare.js
// HarborPath - Gastrointestinal & Mesenteric Emergencies, Acute Pancreatitis, Cocaine Ischemic Colitis, OIC & Boerhaave Navigator
// Clinical Consensus: American College of Gastroenterology (ACG) Guidelines on Acute Pancreatitis & Colon Ischemia,
// NEJM WATERFALL Trial (2022) Moderate Goal-Directed Lactated Ringer's Resuscitation in Acute Pancreatitis,
// American Gastroenterological Association (AGA) Guidelines on Opioid-Induced Constipation (OIC) & PAMORAs,
// Rome IV Criteria for Narcotic Bowel Syndrome (NBS) & Centrally Mediated Abdominal Pain,
// World Society of Emergency Surgery (WSES) Guidelines on Boerhaave Esophageal Perforation & Internal Drug Packet Concealment.
// Privacy Invariant: 100% ephemeral in-RAM state, zero device storage, zero PII.

import { h, clear, icon, copyText, syncTablists, wireTablistKeyboard } from '../dom.js';
import { getLang } from '../i18n.js';

// ============================================================================
// CLINICAL TAXONOMY: SUBSTANCE-INDUCED GASTROINTESTINAL & MESENTERIC PATHOLOGY
// ============================================================================

export const GI_SYNDROME_PROFILES = Object.freeze({
  acutePancreatitis: Object.freeze({
    id: 'acute_pancreatitis',
    nameEn: 'Alcohol- & Hypertriglyceridemia-Induced Acute Pancreatitis (Atlanta Criteria & WATERFALL Protocol)',
    nameEs: 'Pancreatitis Aguda por Alcohol e Hipertrigliceridemia (Criterios de Atlanta y Protocolo WATERFALL)',
    pathophysiologyEn: 'Chronic or binge ethanol consumption increases pancreatic acinar zymogen synthesis, sensitizes acinar cells to cholecystokinin (CCK), increases pancreatic ductal permeability, and induces Sphincter of Oddi spasm. This triggers premature intrapancreatic activation of trypsinogen into active trypsin, resulting in fulminant pancreatic autodigestion, retroperitoneal fat necrosis, and systemic inflammatory response syndrome (SIRS). Concurrent alcohol-induced severe hypertriglyceridemia (> 1,000 mg/dL) releases toxic free fatty acids via pancreatic lipase, causing direct acinar capillary injury.',
    pathophysiologyEs: 'El consumo intensivo de alcohol aumenta la síntesis de cimógenos acinares, sensibiliza las células a la colecistoquinina (CCK) y provoca espasmo del esfínter de Oddi, desencadenando la activación prematura de tripsinógeno a tripsina y la autodigestión pancreática. La hipertrigliceridemia grave (> 1.000 mg/dL) libera ácidos grasos libres tóxicos que lesionan los capilares pancreáticos.',
    clinicalPresentationEn: 'REVISED ATLANTA CLASSIFICATION (Requires >= 2 of 3): 1) Acute, persistent, severe epigastric pain radiating straight through to the back; 2) Serum Lipase >= 3x upper limit of normal (Lipase is strictly preferred over amylase due to superior sensitivity/specificity in alcoholic pancreatitis and a longer 8–14 day diagnostic window); 3) Characteristic contrast CT/MRI findings. WATERFALL TRIAL PARADIGM SHIFT (NEJM 2022): Moderate goal-directed Lactated Ringer’s resuscitation (1.5 mL/kg/h after a 10 mL/kg bolus only if hypovolemic) is strictly superior to aggressive fluid resuscitation (20 mL/kg bolus + 3 mL/kg/h), which triples fluid overload and pulmonary edema without reducing necrosis! Lactated Ringer’s is preferred over Normal Saline (avoids hyperchloremic acidosis that activates trypsinogen). EARLY ENTERAL NUTRITION: Initiate oral/enteral feeding within 24–48 hours as tolerated rather than prolonged NPO ("pancreatic rest") to preserve gut mucosal integrity and prevent bacterial translocation.',
    clinicalPresentationEs: 'CLASIFICACIÓN DE ATLANTA REVISADA (>= 2 de 3): 1) Dolor epigástrico agudo e intenso irradiado en cinturón hacia la espalda; 2) Lipasa sérica >= 3 veces el límite normal (la lipasa es muy superior a la amilasa); 3) Hallazgos típicos en TC/RM. CAMBIO DE PARADIGMA ENSAYO WATERFALL (NEJM 2022): La fluidoterapia moderada con Ringer Lactato (1,5 mL/kg/h tras bolo de 10 mL/kg si hay hipovolemia) es superior a la hidratación agresiva (3 mL/kg/h), que triplica el edema pulmonar sin mejorar la necrosis. Se prefiere Ringer Lactato sobre Suero Fisiológico (evita la acidosis hiperclorémica). NUTRICIÓN ENTERAL PRECOZ: Iniciar dieta oral/enteral en 24–48 h para proteger la mucosa intestinal y evitar translocación bacteriana.',
  }),

  mesentericIschemia: Object.freeze({
    id: 'mesenteric_ischemia',
    nameEn: 'Cocaine & Methamphetamine Mesenteric Ischemia (NOMI) & Ischemic Colitis',
    nameEs: 'Isquemia Mesentérica No Oclusiva (IMNO) y Colitis Isquémica por Cocaína y Metanfetamina',
    pathophysiologyEn: 'Cocaine, methamphetamine, and synthetic cathinones block presynaptic norepinephrine reuptake and strongly stimulate splanchnic alpha-1 adrenergic receptors, inducing profound Non-Occlusive Mesenteric Ischemia (NOMI) of the superior and inferior mesenteric arteries alongside microvascular platelet thrombosis. Colonic "watershed" territories—specifically the Splenic Flexure (Griffiths’ point) and the Rectosigmoid Junction (Sudeck’s point)—suffer rapid mucosal sloughing, ischemic ulceration, and transmural gangrenous necrosis.',
    pathophysiologyEs: 'La cocaína y la metanfetamina estimulan intensamente los receptores alfa-1 adrenérgicos esplácnicos, provocando vasoconstricción mesentérica severa (IMNO) de las arterias mesentéricas superior e inferior y trombosis microvascular. Las zonas divisorias del colon—el ángulo esplénico (punto de Griffiths) y la unión rectosigmoidea (punto de Sudeck)—sufren necrosis mucosa y gangrena transmural.',
    clinicalPresentationEn: 'CLASSICAL CLINICAL HALLMARK: Sudden, agonizing abdominal "Pain Out of Proportion to Physical Examination" (excruciating visceral pain despite an initially soft, non-peritonitic abdomen) within hours of stimulant use, followed by urgent bloody diarrhea (hematochezia or maroon stools), fever, leukocytosis, and rising lactic acidosis. DIAGNOSTIC & SURGICAL MANDATE: Obtain emergent CT Mesenteric Angiography (CTA Abdomen/Pelvis) immediately (plain radiographs miss early ischemia; "thumbprinting" and pneumatosis intestinalis are late ominous signs). Rebound tenderness, board-like rigidity, or free air (pneumoperitoneum) indicate transmural bowel infarction and mandate emergent exploratory laparotomy and bowel resection.',
    clinicalPresentationEs: 'SIGNO CLÍNICO CLÁSICO: Dolor abdominal agonizante "desproporcionado a la exploración física" (dolor extremo con abdomen inicialmente blando) tras consumir estimulantes, seguido de diarrea sanguinolenta (hematoquecia), fiebre, leucocitosis y acidosis láctica. MANDATO DIAGNÓSTICO Y QUIRÚRGICO: Solicitar Angio-TC Mesentérica (CTA abdomen/pelvis) urgente (las radiografías simples no detectan isquemia precoz; la neumatosis intestinal es tardía). La irritación peritoneal o el neumoperitoneo indican infarto transmural y exigen laparotomía exploradora de urgencia.',
  }),

  oicPamora: Object.freeze({
    id: 'oic_pamora',
    nameEn: 'Opioid-Induced Constipation (OIC), PAMORAs & Stercoral Perforation',
    nameEs: 'Estreñimiento Inducido por Opioides (EIO), Fármacos PAMORA y Perforación Estercorácea',
    pathophysiologyEn: 'Exogenous opioids (methadone, buprenorphine, fentanyl, morphine, oxycodone) bind peripheral mu-opioid receptors in the myenteric and submucosal plexuses of the enteric nervous system. This blocks acetylcholine release, abolishes propulsive longitudinal peristalsis, increases non-propulsive segmental contraction and sphincter tone (pyloric, ileocecal, and internal anal sphincters), and inhibits cystic fibrosis transmembrane conductance regulator (CFTR) chloride and water secretion. CARDINAL PHYSIOLOGIC RULE: Unlike central respiratory or analgesic tolerance, the human enteric nervous system NEVER develops tolerance to opioid-induced constipation!',
    pathophysiologyEs: 'Los opioides se unen a los receptores mu periféricos en los plexos mientérico y submucoso del intestino, bloqueando la liberación de acetilcolina, aboliendo el peristaltismo propulsivo y frenando la secreción de agua. REGLA FISIOLÓGICA CARDINAL: ¡A diferencia de la tolerancia analgésica o respiratoria, el intestino humano NUNCA desarrolla tolerancia al estreñimiento por opioides!',
    clinicalPresentationEn: 'THE DOCUSATE (COLACE) INEFFICACY TRAP: Stool softeners alone (docusate sodium) are clinically ineffective in OIC ("all mush and no push") because the primary defect is absent peristaltic propulsion. First-line prophylaxis from Day 1 of opioid therapy requires a stimulant laxative (Senna 8.6–17.2 mg or Bisacodyl) PLUS an osmotic laxative (Polyethylene Glycol / PEG 3350). TARGETED PAMORAs (Methylnaltrexone [Relistor], Naloxegol [Movantik], Naldemedine [Symproic]): Peripherally Acting Mu-Opioid Receptor Antagonists selectively block gut mu-receptors WITHOUT crossing the blood-brain barrier (preserving central pain control and MOUD stability without precipitating central withdrawal). STRICT CONTRAINDICATION: PAMORAs and stimulant laxatives are ABSOLUTELY CONTRAINDICATED in suspected mechanical bowel obstruction or hard fecaloma impaction due to catastrophic risk of stercoral colonic perforation!',
    clinicalPresentationEs: 'LA TRAMPA DE LA INEFICACIA DEL DOCUSATO: Los ablandadores fecales solos (docusato) son ineficaces en el EIO ("todo blando pero sin empuje") porque falta el peristaltismo. La profilaxis desde el Día 1 exige un laxante estimulante (Senósidos o Bisacodilo) MÁS un laxante osmótico (Polietilenglicol / Macrogol PEG 3350). FÁRMACOS PAMORA (Metilnaltrexona, Naloxegol, Naldemedina): Antagonistas mu periféricos que revierten el bloqueo intestinal SIN cruzar la barrera hematoencefálica (sin provocar síndrome de abstinencia central). CONTRAINDICACIÓN ESTRICTA: ¡Los PAMORA están ABSOLUTAMENTE CONTRAINDICADOS si se sospecha obstrucción intestinal mecánica o impactación fecal grave por riesgo de perforación estercorácea mortal!',
  }),

  narcoticBowel: Object.freeze({
    id: 'narcotic_bowel',
    nameEn: 'Narcotic Bowel Syndrome (NBS) / Opioid-Induced Visceral Hyperalgesia',
    nameEs: 'Síndrome del Intestino Narcótico (SIN) / Hiperalgesia Visceral Inducida por Opioides',
    pathophysiologyEn: 'Chronic or escalating opioid administration induces paradoxical amplification of visceral pain signaling mediated by spinal dorsal horn glial cell activation (Toll-like receptor 4 [TLR4] neuroinflammation), upregulation of spinal dynorphin, descending facilitation from the rostral ventromedial medulla, and bimodal excitatory Gs-coupled mu-receptor signaling in dorsal root ganglia neurons.',
    pathophysiologyEs: 'El uso crónico o en dosis crecientes de opioides provoca una amplificación paradójica del dolor visceral mediada por la activación de la microglía en el asta dorsal medular (neuroinflamación vía TLR4), aumento de dinorfina espinal y señalización excitatoria bimodal en los ganglios de la raíz dorsal.',
    clinicalPresentationEn: 'ROME IV DIAGNOSTIC CRITERIA & THE ESCALATION TRAP: Chronic or frequently recurring colicky abdominal pain that worsens or incompletely resolves despite continuous or escalating doses of opioids ("soar and crash" pain cycle: brief analgesia followed by rebound hyperalgesia, bloating, nausea, and intermittent ileus). Clinicians frequently misinterpret NBS as worsening structural abdominal pathology and increase the opioid dose, trapping the patient in a vicious cycle. MANAGEMENT: Cease opioid dose escalation; implement structured multidisciplinary opioid tapering or stable buprenorphine rotation paired with central visceral neuromodulators: Tricyclic Antidepressants (Amitriptyline, Nortriptyline), SNRIs (Duloxetine), or alpha-2 adrenergic agonists (Clonidine).',
    clinicalPresentationEs: 'CRITERIOS DE ROMA IV Y LA TRAMPA DE ESCALADA: Dolor abdominal crónico o recurrente que empeora paradójicamente a pesar de mantener o aumentar las dosis de opioides. Los médicos suelen confundirlo con dolor visceral mal controlado y suben la dosis de opioides, agravando la hiperalgesia. MANEJO: Detener la escalada de opioides; realizar reducción estructurada o rotación a buprenorfina combinada con neuromoduladores centrales: Antidepresivos Tricíclicos (Amitriptilina, Nortriptilina), IRSN (Duloxetina) o agonistas alfa-2 (Clonidina).',
  }),

  boerhaaveMalloryWeiss: Object.freeze({
    id: 'boerhaave_mallory_weiss',
    nameEn: 'Boerhaave Syndrome (Transmural Esophageal Rupture) vs. Mallory-Weiss Tear',
    nameEs: 'Síndrome de Boerhaave (Rotura Esofágica Transmural) vs. Desgarro de Mallory-Weiss',
    pathophysiologyEn: 'Precipitated by violent, intractable retching and vomiting during severe alcohol withdrawal, Cannabinoid Hyperemesis Syndrome (CHS / "scromiting"), or acute opioid withdrawal against a unrelaxed cricopharyngeus muscle. A Mallory-Weiss tear is a partial-thickness longitudinal mucosal laceration at the gastroesophageal junction causing self-limited upper GI bleeding. Boerhaave syndrome is a catastrophic full-thickness transmural barogenic rupture of the distal left posterolateral esophagus (2–3 cm above the GE junction), ejecting gastric acid, enzymes, and bacteria directly into the mediastinum and left pleural space.',
    pathophysiologyEs: 'Desencadenado por arcadas y vómitos violentos e incoercibles durante la abstinencia alcohólica, el Síndrome de Hiperémesis Cannabinoide (SHC) o la abstinencia de opioides. El desgarro de Mallory-Weiss es una laceración mucosa superficial en la unión gastroesofágica. El Síndrome de Boerhaave es una rotura transmural completa del esófago distal posterolateral izquierdo, vertiendo ácido gástrico y bacterias al mediastino y espacio pleural.',
    clinicalPresentationEn: 'MACKLER TRIAD & HAMMAN SIGN: Boerhaave syndrome presents with 1) Violent retching/vomiting, 2) Sudden excruciating retrosternal chest and epigastric pain radiating to the back or left shoulder, and 3) Subcutaneous emphysema (palpable crepitus in the neck or suprasternal notch), accompanied by Hamman sign (mediastinal crunching sound synchronized with the heartbeat), tachypnea, and septic shock. CARDINAL CONTRAST RULE: Perform emergent CT Esophagram using WATER-SOLUBLE CONTRAST (Gastrografin) first! NEVER administer Barium sulfate initially in suspected esophageal perforation, as barium extravasation into the mediastinum causes lethal granulomatous mediastinitis! Mandates NPO, IV proton pump inhibitors, broad-spectrum IV antibiotics, and cardiothoracic surgical repair within 24 hours.',
    clinicalPresentationEs: 'TRÍADA DE MACKLER Y SIGNO DE HAMMAN: El síndrome de Boerhaave cursa con 1) Vómitos violentos, 2) Dolor torácico retroesternal y epigástrico lancinante súbito, y 3) Enfisema subcutáneo (crepitación palpable en cuello o tórax), junto con el signo de Hamman (crujido mediastínico sincrónico con el latido cardíaco) y sepsis. REGLA CARDINAL DEL CONTRASTE: ¡Realizar Esofagograma-TC urgente con CONTRASTE HIDROSOLUBLE (Gastrografin) primero! ¡NUNCA administrar sulfato de bario ante sospecha de perforación esofágica, ya que el bario en el mediastino produce mediastinitis granulomatosa mortal! Requiere dieta absoluta, antibióticos IV y cirugía torácica urgente.',
  }),

  bodyPacking: Object.freeze({
    id: 'body_packing',
    nameEn: 'Body Packing & Body Stuffing (Internal Concealment of Illicit Drug Packets)',
    nameEs: 'Body Packing y Body Stuffing (Ocultación Interna de Paquetes de Droga)',
    pathophysiologyEn: 'Body packers ("couriers/mules") systematically swallow 50 to > 100 machine-wrapped latex, cellophane, or foil packets of high-purity cocaine, heroin, fentanyl, or methamphetamine (each packet holding multiple fatal doses). Body stuffers impulsively swallow loosely wrapped baggies or paper bindles to evade arrest; although total drug mass is lower, poor wrapping creates an immediate risk of mucosal leakage.',
    pathophysiologyEs: 'Los "body packers" ("muleros") ingieren de 50 a más de 100 paquetes herméticos de látex con dosis letales de cocaína, heroína o fentanilo de alta pureza. Los "body stuffers" tragan apresuradamente bolsitas mal cerradas para evitar una detención policial, con alto riesgo de filtración inmediata.',
    clinicalPresentationEn: 'CONSERVATIVE MANAGEMENT & ENDOSCOPIC PROHIBITION: Asymptomatic packers are monitored in an ICU/monitored setting and treated with Whole Bowel Irrigation (WBI) using Polyethylene Glycol (PEG) electrolyte solution at 1–2 L/h orally or via nasogastric tube until rectal effluent is clear and low-dose non-contrast CT Abdomen/Pelvis confirms complete clearance. Never use liquid paraffin or mineral oil laxatives (which dissolve latex!). STRICT ENDOSCOPIC PROHIBITION: NEVER attempt endoscopic snare or forceps retrieval of drug packets (high risk of puncturing packets!). CARDINAL SURGICAL RULE: Any sign of Cocaine or Methamphetamine Packet Rupture ("Body Packer Syndrome"—hypertensive crisis, seizures, hyperthermia, arrhythmias) or mechanical bowel obstruction is an ABSOLUTE SURGICAL EMERGENCY requiring immediate exploratory laparotomy (because cocaine has no specific pharmacological antidote, whereas opioid packet rupture is temporized with high-dose continuous IV naloxone infusion while preparing for surgery).',
    clinicalPresentationEs: 'MANEJO CONSERVADOR Y PROHIBICIÓN ENDOSCÓPICA: Los pacientes asintomáticos se tratan en observación intensiva con Irrigación Intestinal Total (IIT) mediante solución de Polietilenglicol (PEG) a 1–2 L/h hasta evacuar todos los paquetes verificados por TC abdominopélvica. Prohibido usar laxantes de parafina o aceites minerales (degradan el látex). PROHIBICIÓN ENDOSCÓPICA ESTRICTA: ¡NUNCA intentar extraer paquetes con pinzas o asas endoscópicas por riesgo de romperlos! REGLA QUIRÚRGICA CARDINAL: ¡Cualquier signo de rotura de paquetes de cocaína ("Síndrome del Body Packer": crisis hipertensiva, convulsiones, hipertermia) u obstrucción mecánica es una EMERGENCIA QUIRÚRGICA ABSOLUTA que exige laparotomía inmediata, ya que la cocaína carece de antídoto específico!',
  }),
});

// ============================================================================
// HARM REDUCTION DIRECTIVES & FIELD GASTROINTESTINAL PRESERVATION
// ============================================================================

export const GI_HARM_REDUCTION_RULES = Object.freeze([
  {
    ruleNum: 1,
    titleEn: 'Opioid Bowel Regimen: Skip Docusate Alone ("All Mush, No Push") — Pair Senna + PEG 3350',
    titleEs: 'Régimen Intestinal en Opioides: Evitar Docusato Solo — Combinar Senósidos + PEG 3350',
    detailEn: 'The human gut never develops tolerance to opioid constipation. Stool softeners like docusate (Colace) alone fail because opioids paralyze gut peristalsis. Start a stimulant laxative (Senna) plus an osmotic laxative (Polyethylene Glycol / Miralax) from Day 1 of opioid or methadone therapy.',
    detailEs: 'El intestino humano nunca desarrolla tolerancia al estreñimiento por opioides. El docusato solo fracasa porque los opioides paralizan el movimiento intestinal. Inicie un laxante estimulante (Senósidos) junto con un osmótico (Polietilenglicol / Macrogol) desde el primer día.',
  },
  {
    ruleNum: 2,
    titleEn: 'PAMORA Obstruction Alert: Never Use Methylnaltrexone if Bowel Obstruction is Suspected',
    titleEs: 'Alerta con Fármacos PAMORA: Nunca Usar Metilnaltrexona si se Sospecha Obstrucción Intestinal',
    detailEn: 'Peripherally acting opioid antagonists (Methylnaltrexone, Naloxegol, Naldemedine) relieve opioid constipation without causing brain withdrawal. However, they are strictly contraindicated if a patient has a mechanical bowel blockage or hard fecal impaction, as sudden gut contractions can cause fatal bowel perforation.',
    detailEs: 'Los antagonistas periféricos (Metilnaltrexona, Naloxegol) alivian el estreñimiento por opioides sin causar abstinencia cerebral, pero están estrictamente contraindicados si existe obstrucción intestinal mecánica o impactación fecal dura, ya que pueden provocar una perforación intestinal mortal.',
  },
  {
    ruleNum: 3,
    titleEn: 'Agonizing Abdominal Pain After Cocaine/Meth: Seek Immediate CTA for Mesenteric Ischemia',
    titleEs: 'Dolor Abdominal Agonizante tras Cocaína/Metanfetamina: Solicitar Angio-TC por Isquemia Mesentérica',
    detailEn: 'Stimulants clamp down blood vessels feeding the intestines. Severe abdominal pain "out of proportion" to touch—especially followed by bloody or maroon stool—is a life-threatening mesenteric infarction until proven otherwise. Demand an emergency CT angiogram (CTA) of the abdomen.',
    detailEs: 'Los estimulantes cierran las arterias que irrigan el intestino. Un dolor abdominal atroz o "desproporcionado"—especialmente seguido de heces con sangre—es un infarto mesentérico potencialmente mortal. Acuda a urgencias para una Angio-TC abdominal inmediata.',
  },
  {
    ruleNum: 4,
    titleEn: 'Violent Vomiting & Neck Crepitus (Boerhaave Alert): Demand Water-Soluble Contrast, NEVER Barium',
    titleEs: 'Vómitos Violentos y Crepitación en Cuello (Alerta Boerhaave): Contraste Hidrosoluble, NUNCA Bario',
    detailEn: 'Severe retching from alcohol withdrawal, cannabinoid hyperemesis, or opioid withdrawal can tear a full-thickness hole in the esophagus (Boerhaave syndrome), causing excruciating chest pain and air bubbles under the neck skin. Clinicians must use water-soluble contrast (Gastrografin) for imaging—never barium.',
    detailEs: 'Las arcadas violentas por abstinencia o hiperémesis cannabinoide pueden perforar el esófago (Síndrome de Boerhaave), causando dolor torácico extremo y burbujas de aire bajo la piel del cuello. Debe usarse contraste hidrosoluble (Gastrografin) en el estudio—nunca bario.',
  },
  {
    ruleNum: 5,
    titleEn: 'Acute Pancreatitis Fluid Rule (WATERFALL): Moderate Lactated Ringer’s & Early Feeding Beat Overload',
    titleEs: 'Regla de Fluidos en Pancreatitis (WATERFALL): Ringer Lactato Moderado Supera a la Sobrecarga',
    detailEn: 'In acute pancreatitis (severe upper belly pain radiating to the back), the landmark WATERFALL trial proved that moderate IV Lactated Ringer’s hydration and early oral feeding within 24–48 hours prevent lung flooding and gut infection far better than old aggressive fluid-overload and starvation protocols.',
    detailEs: 'En la pancreatitis aguda (dolor epigástrico irradiado a la espalda), el ensayo WATERFALL demostró que la hidratación moderada con Ringer Lactato y la alimentación precoz en 24–48 h previenen el edema pulmonar y la infección pancreática mucho mejor que la sobrecarga hídrica agresiva.',
  },
  {
    ruleNum: 6,
    titleEn: 'Swallowed Drug Packets: Whole Bowel Irrigation YES, Endoscopic Snaring NO — Surgery for Cocaine Leak',
    titleEs: 'Paquetes de Droga Ingeridos: Irrigación con PEG SÍ, Endoscopia NO — Cirugía si Filtra Cocaína',
    detailEn: 'If someone swallows drug packets (body packing/stuffing), never induce vomiting, never give oil-based laxatives (which dissolve latex), and never try to pull packets out with an endoscopic snare. Use Polyethylene Glycol (PEG) bowel irrigation, and go straight to emergency surgery if a cocaine packet leaks.',
    detailEs: 'Si alguien traga paquetes de droga, nunca provoque el vómito, nunca dé laxantes aceitosos (disuelven el látex) y nunca intente extraerlos con pinzas endoscópicas. Use irrigación con Polietilenglicol (PEG) y realice cirugía inmediata ante cualquier signo de filtración de cocaína.',
  },
]);

// ============================================================================
// IN-RAM EPHEMERAL STATE MANAGEMENT (ZERO PERSISTENT STORAGE)
// ============================================================================

let giState = {
  activeTab: 'syndromes', // 'syndromes' | 'evaluator' | 'rules' | 'sbar'
  boerhaaveVomitingCrepitus: false, // Violent vomiting + retrosternal chest pain + subcutaneous neck crepitus
  cocainePacketRuptureObstruction: false, // Swallowed drug packets + sympathomimetic toxicity or bowel obstruction
  stimulantPainOutOfProportionBloodyStool: false, // Post-cocaine/meth agonizing abdominal pain + hematochezia
  opioidFecalImpactionPeritonitis: false, // Severe opioid constipation + rigid abdomen, rebound, fever (Stercoral perforation)
  epigastricPainBackRadiationPancreatitis: false, // Severe epigastric pain radiating to back + alcohol/hypertriglyceridemia
  asymptomaticBodyPackingStuffing: false, // Swallowed drug packets without acute toxicity or obstruction
  opioidConstipationRefractoryLaxatives: false, // Persistent OIC refractory to senna + PEG 3350 without obstruction
  escalatingOpioidParadoxicalAbdominalPain: false, // Paradoxical worsening of abdominal pain with escalating opioids (NBS)
  sbarCopied: false,
};

const listeners = new Set();

export function getGiState() {
  return { ...giState };
}

export function setGiState(patch) {
  giState = { ...giState, ...patch };
  listeners.forEach((fn) => {
    try {
      fn(giState);
    } catch (e) {
      console.error('giCare state listener error:', e);
    }
  });
}

export function resetGiState() {
  giState = {
    activeTab: 'syndromes',
    boerhaaveVomitingCrepitus: false,
    cocainePacketRuptureObstruction: false,
    stimulantPainOutOfProportionBloodyStool: false,
    opioidFecalImpactionPeritonitis: false,
    epigastricPainBackRadiationPancreatitis: false,
    asymptomaticBodyPackingStuffing: false,
    opioidConstipationRefractoryLaxatives: false,
    escalatingOpioidParadoxicalAbdominalPain: false,
    sbarCopied: false,
  };
  listeners.forEach((fn) => {
    try {
      fn(giState);
    } catch (e) {
      console.error('giCare reset listener error:', e);
    }
  });
}

export function subscribeGiState(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// ============================================================================
// CLINICAL DECISION SUPPORT ALGORITHM: GASTROINTESTINAL RISK EVALUATION
// ============================================================================

export function evaluateGiRisk(state) {
  const flags = [];
  let urgency = 'precautionary'; // 'emergency_911' | 'urgent_eval' | 'specialty_consult' | 'precautionary'

  // Tier 1: Immediate Surgical & Resuscitation GI Emergencies (Call 911 / Emergent Surgery)
  if (state.boerhaaveVomitingCrepitus) {
    urgency = 'emergency_911';
    flags.push({
      priority: 1,
      titleEn: 'Suspected Boerhaave Syndrome (Transmural Esophageal Rupture): Mackler Triad Alert',
      titleEs: 'Sospecha de Síndrome de Boerhaave (Rotura Esofágica Transmural): Alerta Tríada de Mackler',
      descEn: 'Violent vomiting followed by excruciating retrosternal chest/epigastric pain and subcutaneous neck crepitus. Life-threatening mediastinitis risk. Keep strictly NPO, start broad-spectrum IV antibiotics and IV PPI, obtain emergent CT Esophagram with WATER-SOLUBLE contrast (Gastrografin—NEVER Barium!), and consult Cardiothoracic Surgery immediately.',
      descEs: 'Vómitos violentos seguidos de dolor retroesternal lancinante y crepitación subcutánea cervical. Alto riesgo de mediastinitis mortal. Mantener dieta absoluta (NPO), iniciar antibióticos IV de amplio espectro, solicitar Esofagograma-TC con contraste HIDROSOLUBLE (Gastrografin—¡NUNCA Bario!) y avisar a Cirugía Torácica de inmediato.',
    });
  }

  if (state.cocainePacketRuptureObstruction) {
    urgency = 'emergency_911';
    flags.push({
      priority: 1,
      titleEn: 'Body Packer Syndrome / Ruptured Drug Packet or Mechanical Obstruction: Emergent Laparotomy',
      titleEs: 'Síndrome del Body Packer / Rotura de Paquete o Obstrucción: Laparotomía de Emergencia',
      descEn: 'Internal drug packet concealment complicated by acute sympathomimetic toxicity (cocaine/amphetamine leakage) or mechanical bowel obstruction. Because cocaine has NO pharmacological antidote, packet leakage is an absolute surgical emergency mandating immediate exploratory laparotomy, benzodiazepines, and active cooling. NEVER attempt endoscopic snare retrieval.',
      descEs: 'Ocultación interna de paquetes de droga complicada con toxicidad simpaticomimética aguda (filtración de cocaína/anfetamina) u obstrucción mecánica. Al no existir antídoto para la cocaína, la filtración exige laparotomía exploradora inmediata, benzodiacepinas y enfriamiento activo. ¡NUNCA intentar extracción endoscópica!',
    });
  }

  if (state.stimulantPainOutOfProportionBloodyStool) {
    urgency = 'emergency_911';
    flags.push({
      priority: 1,
      titleEn: 'Suspected Stimulant-Induced Mesenteric Ischemia (NOMI) / Gangrenous Ischemic Colitis',
      titleEs: 'Sospecha de Isquemia Mesentérica por Estimulantes (IMNO) / Colitis Isquémica Gangrenosa',
      descEn: 'Agonizing abdominal "pain out of proportion to physical exam" and hematochezia following cocaine or methamphetamine use. High risk of transmural infarction at watershed zones (splenic flexure / rectosigmoid). Order stat CT Mesenteric Angiography (CTA Abdomen/Pelvis), serum lactate, aggressive IV crystalloids, broad-spectrum antibiotics, and emergent General Surgery evaluation.',
      descEs: 'Dolor abdominal agonizante "desproporcionado a la exploración" y hematoquecia tras uso de cocaína o metanfetamina. Alto riesgo de infarto transmural en ángulo esplénico o unión rectosigmoidea. Solicitar Angio-TC Mesentérica urgente, lactato sérico, fluidoterapia IV, antibióticos y valoración por Cirugía General.',
    });
  }

  if (state.opioidFecalImpactionPeritonitis) {
    urgency = 'emergency_911';
    flags.push({
      priority: 2,
      titleEn: 'Suspected Stercoral Colonic Perforation / Acute Mechanical Bowel Obstruction',
      titleEs: 'Sospecha de Perforación Colónica Estercorácea / Obstrucción Intestinal Mecánica Aguda',
      descEn: 'Severe opioid-induced fecal impaction presenting with peritoneal signs (board-like abdominal rigidity, rebound tenderness, fever, or sepsis). STRICT CONTRAINDICATION: Do NOT administer PAMORAs (methylnaltrexone/naloxegol), stimulant laxatives, or enemas! Obtain stat upright chest/abdominal radiograph and CT Abdomen/Pelvis, and consult Emergency Surgery.',
      descEs: 'Impactación fecal grave por opioides con signos peritoneales (rigidez abdominal, rebote, fiebre o sepsis). CONTRAINDICACIÓN ESTRICTA: ¡NO administrar fármacos PAMORA (metilnaltrexona/naloxegol), laxantes estimulantes ni enemas! Solicitar TC abdominopélvica urgente y consulta quirúrgica inmediata.',
    });
  }

  // Tier 2: Urgent Hospital Evaluation & Targeted Protocol
  if (state.epigastricPainBackRadiationPancreatitis) {
    if (urgency !== 'emergency_911') urgency = 'urgent_eval';
    flags.push({
      priority: 3,
      titleEn: 'Suspected Acute Pancreatitis: Atlanta Workup & WATERFALL Moderate LR Resuscitation',
      titleEs: 'Sospecha de Pancreatitis Aguda: Estudio de Atlanta y Fluidoterapia Moderada WATERFALL',
      descEn: 'Persistent severe epigastric pain radiating to the back. Order stat serum Lipase (superior to amylase), comprehensive metabolic panel, triglycerides, and RUQ ultrasound. Follow NEJM WATERFALL protocol: administer moderate goal-directed Lactated Ringer’s (1.5 mL/kg/h; avoid aggressive 3 mL/kg/h fluid overload!) and initiate early oral/enteral nutrition within 24–48 hours as tolerated.',
      descEs: 'Dolor epigástrico severo irradiado a la espalda. Solicitar Lipasa sérica urgente (superior a amilasa), perfil hepático, triglicéridos y ecografía abdominal. Seguir protocolo WATERFALL: hidratación moderada con Ringer Lactato (1,5 mL/kg/h; ¡evitar sobrecarga hídrica de 3 mL/kg/h!) e iniciar nutrición oral/enteral precoz en 24–48 h.',
    });
  }

  if (state.asymptomaticBodyPackingStuffing) {
    if (urgency !== 'emergency_911') urgency = 'urgent_eval';
    flags.push({
      priority: 3,
      titleEn: 'Asymptomatic Internal Drug Packet Concealment: Whole Bowel Irrigation (WBI) Protocol',
      titleEs: 'Ocultación Interna Asintomática de Paquetes de Droga: Irrigación Intestinal Total (IIT)',
      descEn: 'Patient has ingested wrapped drug packets without acute rupture signs. Admit to monitored care, perform low-dose non-contrast CT Abdomen/Pelvis, and administer Whole Bowel Irrigation with Polyethylene Glycol (PEG) electrolyte solution at 1–2 L/h until rectal effluent is clear and repeat CT confirms zero packets. NEVER use paraffin/oil laxatives and NEVER attempt endoscopic snare removal.',
      descEs: 'Ingesta de paquetes de droga sin signos de rotura aguda. Ingresar en unidad monitorizada, realizar TC abdominopélvica de baja dosis e iniciar Irrigación Intestinal Total con solución de Polietilenglicol (PEG) a 1–2 L/h hasta evacuación completa confirmada por TC. Prohibido usar aceites minerales o extracción con pinzas endoscópicas.',
    });
  }

  // Tier 3: Specialty Gastroenterology / Addiction Medicine Consult
  if (state.opioidConstipationRefractoryLaxatives) {
    if (urgency === 'precautionary') urgency = 'specialty_consult';
    flags.push({
      priority: 4,
      titleEn: 'Laxative-Refractory Opioid-Induced Constipation (OIC): PAMORA Initiation Candidate',
      titleEs: 'Estreñimiento Inducido por Opioides (EIO) Refractario: Candidato a Terapia PAMORA',
      descEn: 'Persistent OIC despite scheduled stimulant (Senna/Bisacodyl) + osmotic (PEG 3350) laxatives, with mechanical bowel obstruction clinically excluded. Discontinue ineffective docusate monotherapy. Initiate a targeted Peripherally Acting Mu-Opioid Receptor Antagonist (PAMORA: Naloxegol 25 mg PO daily, Naldemedine 0.2 mg PO daily, or Methylnaltrexone subQ) to restore gut motility without precipitating central opioid withdrawal.',
      descEs: 'EIO persistente pese a laxantes estimulantes (Senósidos) + osmóticos (PEG 3350), habiendo descartado obstrucción mecánica. Suspender docusato ineficaz. Iniciar un Antagonista Mu Periférico (PAMORA: Naloxegol 25 mg/día, Naldemedina 0,2 mg/día o Metilnaltrexona SC) para restaurar la motilidad sin provocar abstinencia central.',
    });
  }

  if (state.escalatingOpioidParadoxicalAbdominalPain) {
    if (urgency === 'precautionary') urgency = 'specialty_consult';
    flags.push({
      priority: 4,
      titleEn: 'Suspected Narcotic Bowel Syndrome (NBS) / Opioid Visceral Hyperalgesia',
      titleEs: 'Sospecha de Síndrome del Intestino Narcótico (SIN) / Hiperalgesia Visceral por Opioides',
      descEn: 'Paradoxical worsening of chronic colicky abdominal pain despite continuous or escalating opioid doses (Rome IV criteria). Stop escalating opioid analgesics. Implement a supportive multidisciplinary taper or transition to buprenorphine maintenance while introducing central visceral neuromodulators (Amitriptyline, Nortriptyline, Duloxetine, or Clonidine).',
      descEs: 'Empeoramiento paradójico del dolor abdominal crónico a pesar de aumentar las dosis de opioides (Criterios de Roma IV). Evitar nuevas subidas de opioides. Planificar reducción gradual o transición a buprenorfina asociando neuromoduladores viscerales centrales (Amitriptilina, Nortriptilina, Duloxetina o Clonidina).',
    });
  }

  if (flags.length === 0) {
    flags.push({
      priority: 5,
      titleEn: 'Baseline Gastrointestinal Preservation & Bowel Safety Directives',
      titleEs: 'Directivas Básicas de Protección Gastrointestinal y Seguridad Intestinal',
      descEn: 'No acute surgical abdominal or mesenteric emergencies identified. Maintain prophylactic Senna + PEG 3350 whenever taking opioids or methadone, avoid NSAIDs and excessive alcohol to protect gastric mucosa, and seek immediate medical care for any severe epigastric pain or hematochezia.',
      descEs: 'Sin emergencias quirúrgicas abdominales o mesentéricas agudas identificadas. Mantener profilaxis con Senósidos + PEG 3350 durante cualquier tratamiento con opioides o metadona, evitar AINEs para proteger la mucosa gástrica y consultar de inmediato ante dolor epigástrico intenso o sangrado digestivo.',
    });
  }

  flags.sort((a, b) => a.priority - b.priority);

  return {
    urgency,
    flags,
  };
}

// ============================================================================
// ZERO-PII SBAR CLINICAL HANDOFF NOTE GENERATOR
// ============================================================================

export function formatGiSbarText(state, lang = 'en') {
  const isEs = lang === 'es';
  const evalResult = evaluateGiRisk(state);

  const lines = [];
  lines.push(isEs ? '=== INFORME DE TRASPASO CLÍNICO SBAR - EMERGENCIAS GASTROINTESTINALES (HARBORPATH) ===' : '=== SBAR CLINICAL HANDOFF NOTE - GASTROINTESTINAL & MESENTERIC CARE (HARBORPATH) ===');
  lines.push(isEs ? `Fecha/Hora: ${new Date().toISOString()}` : `Timestamp: ${new Date().toISOString()}`);
  lines.push(isEs ? 'Privacidad: Sin datos de identificación (Zero-PII) - Evaluado en memoria RAM' : 'Privacy: Zero-PII In-RAM Ephemeral Assessment');
  lines.push('');

  // Situation
  lines.push(isEs ? '[S - SITUACIÓN]' : '[S - SITUATION]');
  const urgencyLabel = isEs
    ? (evalResult.urgency === 'emergency_911' ? 'EMERGENCIA QUIRÚRGICA / MÉDICA CRÍTICA (911 / CIRUGÍA INMEDIATA)' : evalResult.urgency === 'urgent_eval' ? 'EVALUACIÓN HOSPITALARIA URGENTE / PROTOCOLO ACTIVO' : 'CONSULTA DE ESPECIALIDAD / PRECAUCIÓN')
    : (evalResult.urgency === 'emergency_911' ? 'CRITICAL SURGICAL / MEDICAL EMERGENCY (911 / STAT SURGERY)' : evalResult.urgency === 'urgent_eval' ? 'URGENT HOSPITAL EVALUATION / PROTOCOL INDICATED' : 'SPECIALTY CONSULT / PRECAUTIONARY');
  lines.push(isEs ? `Nivel de Agudeza: ${urgencyLabel}` : `Acuity Level: ${urgencyLabel}`);
  lines.push('');

  // Background
  lines.push(isEs ? '[B - ANTECEDENTES Y FACTORES CLÍNICOS]' : '[B - CLINICAL BACKGROUND & IDENTIFIED FACTORS]');
  const activeFactors = [];
  if (state.boerhaaveVomitingCrepitus) activeFactors.push(isEs ? 'Vómitos violentos + dolor retroesternal + crepitación subcutánea cervical (Sospecha de Boerhaave)' : 'Violent vomiting + retrosternal chest pain + subcutaneous neck crepitus (Suspected Boerhaave)');
  if (state.cocainePacketRuptureObstruction) activeFactors.push(isEs ? 'Paquetes de droga ingeridos + toxicidad simpaticomimética o signos de obstrucción (Body Packer)' : 'Swallowed drug packets + sympathomimetic toxicity or bowel obstruction (Body Packer Syndrome)');
  if (state.stimulantPainOutOfProportionBloodyStool) activeFactors.push(isEs ? 'Dolor abdominal agonizante desproporcionado tras estimulantes + hematoquecia (Isquemia Mesentérica)' : 'Agonizing pain out of proportion post-stimulants + hematochezia (Mesenteric Ischemia)');
  if (state.opioidFecalImpactionPeritonitis) activeFactors.push(isEs ? 'Impactación fecal por opioides + abdomen rígido / peritonitis (Perforación Estercorácea)' : 'Opioid fecal impaction + rigid abdomen / peritonitis (Stercoral Perforation)');
  if (state.epigastricPainBackRadiationPancreatitis) activeFactors.push(isEs ? 'Dolor epigástrico severo irradiado a la espalda + alcohol/triglicéridos (Pancreatitis Aguda)' : 'Severe epigastric pain radiating to back + alcohol/hypertriglyceridemia (Acute Pancreatitis)');
  if (state.asymptomaticBodyPackingStuffing) activeFactors.push(isEs ? 'Ocultación interna de paquetes de droga asintomática (Body Packing / Stuffing)' : 'Asymptomatic internal drug packet concealment (Body Packing / Stuffing)');
  if (state.opioidConstipationRefractoryLaxatives) activeFactors.push(isEs ? 'Estreñimiento inducido por opioides (EIO) refractario a senósidos + PEG 3350 sin obstrucción' : 'Opioid-induced constipation (OIC) refractory to senna + PEG 3350 without obstruction');
  if (state.escalatingOpioidParadoxicalAbdominalPain) activeFactors.push(isEs ? 'Dolor abdominal paradójico que empeora con dosis crecientes de opioides (Síndrome del Intestino Narcótico)' : 'Paradoxical abdominal pain worsening with escalating opioids (Narcotic Bowel Syndrome)');

  if (activeFactors.length === 0) {
    lines.push(isEs ? 'Ningún factor de riesgo gastrointestinal agudo seleccionado.' : 'No acute gastrointestinal risk factors selected.');
  } else {
    activeFactors.forEach((f) => lines.push(`• ${f}`));
  }
  lines.push('');

  // Assessment
  lines.push(isEs ? '[A - EVALUACIÓN Y DIRECTIVAS CLÍNICAS]' : '[A - CLINICAL ASSESSMENT & IDENTIFIED DIRECTIVES]');
  evalResult.flags.forEach((flag, idx) => {
    lines.push(`${idx + 1}. ${isEs ? flag.titleEs : flag.titleEn}`);
    lines.push(`   ${isEs ? flag.descEs : flag.descEn}`);
  });
  lines.push('');

  // Recommendation
  lines.push(isEs ? '[R - RECOMENDACIONES CLÍNICAS Y MANEJO]' : '[R - RECOMMENDATIONS & MANAGEMENT]');
  if (evalResult.urgency === 'emergency_911') {
    lines.push(isEs
      ? '1. Activar código quirúrgico / UCI 911 de inmediato.\n2. En sospecha de Boerhaave: NPO, antibióticos IV, Esofagograma-TC con contraste HIDROSOLUBLE (Gastrografin—NUNCA Bario).\n3. En isquemia mesentérica por cocaína/metanfetamina: Angio-TC abdominal urgente, lactato y valoración quirúrgica.\n4. En filtración de paquetes de cocaína: Laparotomía exploradora inmediata; prohibida la extracción endoscópica.\n5. En peritonitis / obstrucción por opioides: Contraindicados los PAMORA y enemas; TC urgente.'
      : '1. Activate emergency surgical / ICU resuscitation code immediately.\n2. If Boerhaave suspected: NPO, broad-spectrum IV antibiotics, CT Esophagram with WATER-SOLUBLE contrast (Gastrografin—NEVER Barium).\n3. If stimulant mesenteric ischemia suspected: Stat CTA Abdomen/Pelvis, serum lactate, and Surgical consult.\n4. If cocaine packet leakage suspected: Immediate exploratory laparotomy; never attempt endoscopic snare removal.\n5. If stercoral peritonitis / bowel obstruction suspected: Strictly hold PAMORAs and stimulant laxatives; stat CT.');
  } else if (evalResult.urgency === 'urgent_eval') {
    lines.push(isEs
      ? '1. Trasladar a urgencias para Lipasa sérica, lactato, ionograma y TC abdominopélvica.\n2. En Pancreatitis Aguda (protocolo WATERFALL): Fluidoterapia moderada con Ringer Lactato (1,5 mL/kg/h) evitando sobrecarga hídrica, e iniciar nutrición oral/enteral precoz en 24–48 h.\n3. En Body Packing asintomático: Irrigación Intestinal Total con Polietilenglicol (PEG 1–2 L/h); evitar laxantes aceitosos.'
      : '1. Transfer to ED for stat serum Lipase, lactate, metabolic panel, and CT Abdomen/Pelvis.\n2. In Acute Pancreatitis (WATERFALL protocol): Moderate goal-directed Lactated Ringer’s (1.5 mL/kg/h) avoiding fluid overload, and start early enteral feeding within 24–48h.\n3. In asymptomatic Body Packing: Whole Bowel Irrigation with Polyethylene Glycol (PEG 1–2 L/h); avoid oil-based laxatives.');
  } else {
    lines.push(isEs
      ? '1. Profilaxis del estreñimiento por opioides desde el Día 1: Senósidos + Polietilenglicol (PEG 3350); suspender docusato en monoterapia.\n2. Valorar fármacos PAMORA (Naloxegol, Naldemedina, Metilnaltrexona) en EIO refractario tras descartar obstrucción mecánica.\n3. En Síndrome del Intestino Narcótico: evitar subir dosis de opioides e introducir neuromoduladores viscerales (Amitriptilina, Duloxetina).'
      : '1. Prophylactic OIC bowel regimen from Day 1: Senna + Polyethylene Glycol (PEG 3350); discontinue ineffective docusate monotherapy.\n2. Consider targeted PAMORAs (Naloxegol, Naldemedine, Methylnaltrexone) in laxative-refractory OIC after ruling out bowel obstruction.\n3. In Narcotic Bowel Syndrome: avoid opioid escalation and initiate visceral neuromodulators (Amitriptyline, Duloxetine).');
  }

  lines.push('');
  lines.push(isEs
    ? 'Aviso legal: HarborPath es una herramienta informativa de apoyo a la decisión clínica. No sustituye el juicio médico o quirúrgico directo.'
    : 'Notice: HarborPath is an educational clinical decision support platform. Does not substitute professional medical or surgical judgment.');

  return lines.join('\n');
}

// ============================================================================
// DOM VIEW RENDERING ENGINE (ZERO INNERHTML / 100% EPHEMERAL)
// ============================================================================

export function giCareView() {
  const container = h('div', { class: 'gi-care-view' });

  function render() {
    clear(container);
    const state = getGiState();
    const isEs = getLang() === 'es';

    // Header Section
    const header = h('header', { class: 'gi-header' }, [
      h('div', { class: 'gi-title-badge' }, [
        icon('activity', { class: 'gi-badge-icon' }),
        h('span', {}, isEs ? 'Soporte de Decisión Gastrointestinal y Mesentérica' : 'Gastrointestinal & Mesenteric Decision Support'),
      ]),
      h('h1', { class: 'gi-title' }, isEs ? 'Emergencias Gastrointestinales, Pancreatitis Aguda, Colitis Isquémica y EIO' : 'GI & Mesenteric Emergencies, Acute Pancreatitis, Ischemic Colitis & OIC'),
      h('p', { class: 'gi-subtitle' }, isEs
        ? 'Guía clínica basada en la evidencia (ACG, AGA, WATERFALL y WSES) para pancreatitis aguda, isquemia mesentérica por cocaína, estreñimiento por opioides (PAMORA), síndrome de Boerhaave y body packing.'
        : 'Evidence-based clinical decision support (ACG, AGA, WATERFALL & WSES) for acute pancreatitis, cocaine mesenteric ischemia, opioid-induced constipation (PAMORAs), Boerhaave esophageal rupture, and body packing.'),
    ]);
    container.appendChild(header);

    // Primary Tab Navigation
    const tabs = [
      { id: 'syndromes', labelEn: 'GI & Mesenteric Syndromes', labelEs: 'Síndromes Digestivos y Mesentéricos', iconName: 'activity' },
      { id: 'evaluator', labelEn: 'Clinical Triage & Risk Evaluator', labelEs: 'Triaje Clínico & Evaluador', iconName: 'clipboard' },
      { id: 'rules', labelEn: 'Field GI Safety Rules', labelEs: 'Reglas Digestivas de Campo', iconName: 'shield' },
      { id: 'sbar', labelEn: 'Clinical SBAR Note', labelEs: 'Nota Clínica SBAR', iconName: 'file-text' },
    ];

    const tabNav = h('nav', { class: 'gi-tab-nav', role: 'tablist', 'aria-label': 'GI Care Sections' },
      tabs.map((tab) => {
        const isActive = state.activeTab === tab.id;
        const btn = h('button', {
          type: 'button',
          role: 'tab',
          class: `gi-tab-btn ${isActive ? 'active' : ''}`,
          'aria-selected': isActive ? 'true' : 'false',
          'aria-controls': 'gi-tab-panel',
          id: `tab-btn-${tab.id}`,
          tabindex: isActive ? '0' : '-1',
        }, [
          icon(tab.iconName, { class: 'gi-tab-icon' }),
          h('span', {}, isEs ? tab.labelEs : tab.labelEn),
        ]);
        btn.addEventListener('click', () => setGiState({ activeTab: tab.id }));
        return btn;
      })
    );
    container.appendChild(tabNav);
    syncTablists(container);

    // Tab Panel Container
    const panel = h('section', {
      class: 'gi-tab-panel',
      role: 'tabpanel',
      id: 'gi-tab-panel',
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
    const footer = h('footer', { class: 'gi-footer-notice' }, [
      icon('info', { class: 'gi-footer-icon' }),
      h('p', {}, isEs
        ? 'Aviso Clínico: HarborPath proporciona pautas basadas en consensos de ACG, AGA, NEJM WATERFALL y WSES. No sustituye la Angio-TC abdominal, determinación de lipasa, endoscopia o valoración quirúrgica de urgencia.'
        : 'Clinical Notice: HarborPath provides evidence-based guidelines from ACG, AGA, NEJM WATERFALL, and WSES. It does not replace abdominal CT angiography, serum lipase testing, endoscopy, or emergent surgical evaluation.'),
    ]);
    container.appendChild(footer);
  }

  // Panel 1: Syndromes
  function renderSyndromesPanel(panel, isEs) {
    const intro = h('div', { class: 'gi-panel-intro' }, [
      h('h2', {}, isEs ? 'Taxonomía de Emergencias Gastrointestinales y Mesentéricas Inducidas por Sustancias' : 'Substance-Induced Gastrointestinal & Mesenteric Syndromes Taxonomy'),
      h('p', {}, isEs
        ? 'Fisiopatología y directivas quirúrgicas y médicas para pancreatitis aguda, isquemia mesentérica, estreñimiento por opioides, intestino narcótico, rotura de Boerhaave y body packing.'
        : 'Pathophysiology and medical/surgical directives for acute pancreatitis, mesenteric ischemia, opioid constipation, narcotic bowel syndrome, Boerhaave rupture, and body packing.'),
    ]);
    panel.appendChild(intro);

    const list = h('div', { class: 'gi-syndromes-list' },
      Object.values(GI_SYNDROME_PROFILES).map((syndrome) => {
        return h('article', { class: 'gi-syndrome-card' }, [
          h('h3', { class: 'gi-syndrome-title' }, isEs ? syndrome.nameEs : syndrome.nameEn),
          h('div', { class: 'gi-section' }, [
            h('strong', {}, isEs ? 'Mecanismo Fisiopatológico:' : 'Pathophysiologic Mechanism:'),
            h('p', {}, isEs ? syndrome.pathophysiologyEs : syndrome.pathophysiologyEn),
          ]),
          h('div', { class: 'gi-section' }, [
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
    const intro = h('div', { class: 'gi-panel-intro' }, [
      h('h2', {}, isEs ? 'Evaluador de Riesgo Gastrointestinal y Triaje Quirúrgico/Médico' : 'Gastrointestinal Risk Evaluator & Surgical/Medical Triage'),
      h('p', {}, isEs
        ? 'Marque los hallazgos clínicos abdominales y antecedentes para obtener la estratificación de agudeza y las directivas diagnósticas y terapéuticas.'
        : 'Select observed abdominal signs and clinical factors to receive real-time acuity stratification and diagnostic/therapeutic directives.'),
    ]);
    panel.appendChild(intro);

    const checklistItems = [
      { key: 'boerhaaveVomitingCrepitus', labelEn: 'Violent vomiting/retching + sudden excruciating chest/epigastric pain + neck subcutaneous crepitus (Boerhaave)', labelEs: 'Vómitos violentos + dolor retroesternal lancinante súbito + crepitación subcutánea en cuello (Boerhaave)' },
      { key: 'cocainePacketRuptureObstruction', labelEn: 'Swallowed drug packets + tachycardia/hypertension/seizures or bowel obstruction (Body Packer Syndrome)', labelEs: 'Paquetes de droga ingeridos + taquicardia/hipertensión/convulsiones u obstrucción (Síndrome Body Packer)' },
      { key: 'stimulantPainOutOfProportionBloodyStool', labelEn: 'Agonizing abdominal "pain out of proportion to exam" + bloody stool post-cocaine/meth (Mesenteric Ischemia)', labelEs: 'Dolor abdominal agonizante "desproporcionado" + sangre en heces tras cocaína/metanfetamina (Isquemia Mesentérica)' },
      { key: 'opioidFecalImpactionPeritonitis', labelEn: 'Severe opioid fecal impaction + rigid board-like abdomen, rebound tenderness, or fever (Stercoral Perforation)', labelEs: 'Impactación fecal grave por opioides + abdomen en tabla, rebote o fiebre (Perforación Estercorácea)' },
      { key: 'epigastricPainBackRadiationPancreatitis', labelEn: 'Persistent severe epigastric pain radiating straight to the back + alcohol use (Acute Pancreatitis)', labelEs: 'Dolor epigástrico severo persistente irradiado a la espalda + consumo de alcohol (Pancreatitis Aguda)' },
      { key: 'asymptomaticBodyPackingStuffing', labelEn: 'Swallowed wrapped drug packets without acute toxicity or bowel obstruction (Asymptomatic Body Packing)', labelEs: 'Paquetes de droga ingeridos sin toxicidad aguda ni obstrucción intestinal (Body Packing Asintomático)' },
      { key: 'opioidConstipationRefractoryLaxatives', labelEn: 'Chronic opioid constipation refractory to Senna + PEG 3350 with no bowel obstruction (PAMORA Candidate)', labelEs: 'Estreñimiento por opioides refractario a Senósidos + PEG 3350 sin obstrucción (Candidato a PAMORA)' },
      { key: 'escalatingOpioidParadoxicalAbdominalPain', labelEn: 'Paradoxical worsening of chronic abdominal pain despite escalating opioid doses (Narcotic Bowel Syndrome)', labelEs: 'Empeoramiento paradójico del dolor abdominal crónico al subir dosis de opioides (Intestino Narcótico)' },
    ];

    const checklistForm = h('div', { class: 'gi-evaluator-checklist' },
      checklistItems.map((item) => {
        const isChecked = !!state[item.key];
        const label = h('label', { class: `gi-check-item ${isChecked ? 'selected' : ''}` }, [
          h('input', {
            type: 'checkbox',
            checked: isChecked,
            class: 'gi-checkbox',
          }),
          h('span', { class: 'gi-check-label' }, isEs ? item.labelEs : item.labelEn),
        ]);
        const input = label.querySelector('input');
        input.addEventListener('change', (e) => {
          setGiState({ [item.key]: e.target.checked });
        });
        return label;
      })
    );
    panel.appendChild(checklistForm);

    // Reset Button
    const resetBar = h('div', { class: 'gi-evaluator-actions' }, [
      h('button', {
        type: 'button',
        class: 'gi-reset-btn',
      }, [
        icon('rotate-ccw', { class: 'gi-btn-icon' }),
        h('span', {}, isEs ? 'Restablecer Evaluación' : 'Reset Assessment'),
      ]),
    ]);
    resetBar.querySelector('button').addEventListener('click', () => resetGiState());
    panel.appendChild(resetBar);

    // Results Box
    const evalResult = evaluateGiRisk(state);
    const resultsContainer = h('div', { class: `gi-eval-results acuity-${evalResult.urgency}` }, [
      h('div', { class: 'gi-eval-urgency-badge' }, [
        icon(evalResult.urgency === 'emergency_911' ? 'alert-octagon' : evalResult.urgency === 'urgent_eval' ? 'alert-triangle' : 'info', { class: 'gi-urgency-icon' }),
        h('span', { class: 'gi-urgency-text' },
          evalResult.urgency === 'emergency_911'
            ? (isEs ? 'EMERGENCIA QUIRÚRGICA / MÉDICA CRÍTICA (LLAMAR AL 911 / CIRUGÍA INMEDIATA)' : 'CRITICAL SURGICAL / MEDICAL EMERGENCY (CALL 911 / STAT SURGERY)')
            : evalResult.urgency === 'urgent_eval'
            ? (isEs ? 'EVALUACIÓN HOSPITALARIA URGENTE & PROTOCOLO INDICADO' : 'URGENT HOSPITAL EVALUATION & PROTOCOL REQUIRED')
            : evalResult.urgency === 'specialty_consult'
            ? (isEs ? 'INTERCONSULTA CON GASTROENTEROLOGÍA & AJUSTE TERAPÉUTICO' : 'SPECIALTY GASTROENTEROLOGY CONSULTATION & REGIMEN ADJUSTMENT')
            : (isEs ? 'DIRECTIVAS PREVENTIVAS DE SALUD GASTROINTESTINAL' : 'PRECAUTIONARY GASTROINTESTINAL DIRECTIVES')
        ),
      ]),
      h('div', { class: 'gi-eval-flags-list' },
        evalResult.flags.map((flag) => {
          return h('div', { class: 'gi-flag-item' }, [
            h('h4', { class: 'gi-flag-title' }, isEs ? flag.titleEs : flag.titleEn),
            h('p', { class: 'gi-flag-desc' }, isEs ? flag.descEs : flag.descEn),
          ]);
        })
      ),
    ]);
    panel.appendChild(resultsContainer);
  }

  // Panel 3: Rules
  function renderRulesPanel(panel, isEs) {
    const intro = h('div', { class: 'gi-panel-intro' }, [
      h('h2', {}, isEs ? 'Directivas de Seguridad Digestiva y Reducción de Daños de Campo' : 'Field Gastrointestinal Safety & Harm Reduction Directives'),
      h('p', {}, isEs
        ? 'Seis reglas clínicas fundamentales para prevenir perforación intestinal, infarto mesentérico, mediastinitis por bario, edema pulmonar en pancreatitis y muerte por body packing.'
        : 'Six essential clinical directives to prevent bowel perforation, mesenteric infarction, barium mediastinitis, pancreatitis fluid overload, and body packing fatalities.'),
    ]);
    panel.appendChild(intro);

    const rulesList = h('div', { class: 'gi-directives-grid' },
      GI_HARM_REDUCTION_RULES.map((rule) => {
        return h('article', { class: 'gi-directive-card' }, [
          h('div', { class: 'gi-directive-num' }, `0${rule.ruleNum}`),
          h('h3', { class: 'gi-directive-title' }, isEs ? rule.titleEs : rule.titleEn),
          h('p', { class: 'gi-directive-text' }, isEs ? rule.detailEs : rule.detailEn),
        ]);
      })
    );
    panel.appendChild(rulesList);
  }

  // Panel 4: SBAR Note
  function renderSbarPanel(panel, state, isEs) {
    const intro = h('div', { class: 'gi-panel-intro' }, [
      h('h2', {}, isEs ? 'Generador de Traspaso Clínico SBAR (Zero-PII)' : 'Zero-PII SBAR Clinical Handoff Note Generator'),
      h('p', {}, isEs
        ? 'Genere una nota clínica estructurada en formato SBAR (Situación, Antecedentes, Evaluación, Recomendación) para Cirugía General, Gastroenterología, Urgencias y UCI. 100% en memoria RAM.'
        : 'Generate a structured SBAR clinical handoff note (Situation, Background, Assessment, Recommendation) for General Surgery, Gastroenterology, Emergency Medicine, and ICU. Stored 100% in ephemeral RAM.'),
    ]);
    panel.appendChild(intro);

    const sbarText = formatGiSbarText(state, isEs ? 'es' : 'en');

    const copyBtn = h('button', {
      type: 'button',
      class: 'gi-copy-btn',
    }, [
      icon('copy', { class: 'gi-btn-icon' }),
      h('span', {}, isEs ? 'Copiar Informe SBAR' : 'Copy SBAR Note'),
    ]);

    copyBtn.addEventListener('click', async () => {
      await copyText(sbarText, {
        trigger: copyBtn,
        copiedLabel: isEs ? '¡Copiado al Portapapeles!' : 'Copied to Clipboard!',
        announceSuccess: isEs ? 'Informe SBAR copiado al portapapeles.' : 'SBAR note copied to clipboard.',
      });
    });

    const actionContainer = h('div', { class: 'gi-sbar-actions' }, [copyBtn]);
    panel.appendChild(actionContainer);

    const sbarBox = h('pre', { class: 'gi-sbar-output', 'aria-label': 'SBAR Clinical Output' }, sbarText);
    panel.appendChild(sbarBox);
  }

  render();
  wireTablistKeyboard(container);
  const unsubscribe = subscribeGiState(render);

  return container;
}
