import { h, clear, copyText } from '../dom.js';
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
 * Wave 53 (Track A): Cardiovascular & Arrhythmia Emergencies, Sympathomimetic
 * Coronary Vasospasm, Sodium-Channel Wide-QRS, Torsades de Pointes, Aortic
 * Dissection & Takotsubo Cardiomyopathy Navigator (#/cardiology-care)
 *
 * Zero-PII, 100% ephemeral in-RAM clinical decision support covering:
 *  1. Cocaine & Methamphetamine ACS, Coronary Vasospasm & Unopposed Alpha-Stimulation Rule
 *  2. Cocaine, Cocaethylene & TCA Sodium-Channel Blockade (Wide-QRS Bicarbonate Protocol)
 *  3. Methadone, Loperamide & Antipsychotic QTc Prolongation & Torsades de Pointes (TdP)
 *  4. Stimulant-Induced Acute Aortic Dissection (Stanford Type A & B Anti-Impulse Rule)
 *  5. Takotsubo Stress Cardiomyopathy in Acute Opioid/Alcohol Withdrawal (LVOTO Trap)
 *  6. Methamphetamine-Associated Cardiomyopathy (MACM) & Pulmonary Arterial Hypertension (Meth-PAH)
 */

export const CARDIOLOGY_SYNDROME_PROFILES = Object.freeze({
  stimulant_acs_vasospasm: Object.freeze({
    id: 'stimulant_acs_vasospasm',
    urgency: 'EMERGENCY',
    badgeEn: 'IV BENZODIAZEPINES + NITROGLYCERIN — AVOID PURE BETA-BLOCKERS',
    badgeEs: 'BENZODIAZEPINAS IV + NITROGLICERINA — EVITAR BETABLOQUEADORES PUROS',
    titleEn: 'Cocaine & Methamphetamine ACS, Coronary Vasospasm & The Unopposed Alpha Rule',
    titleEs: 'SCA y Vasoespasmo Coronario por Cocaína/Metanfetamina y Regla de Estimulación Alfa Sin Oposición',
    summaryEn:
      'Acute myocardial ischemia or infarction triggered by cocaine, crack, or methamphetamine via intense alpha-1 epicardial coronary artery vasospasm, increased myocardial oxygen demand (HR x BP), enhanced platelet aggregation, and accelerated atherosclerosis.',
    summaryEs:
      'Isquemia o infarto agudo de miocardio desencadenado por cocaína, crack o metanfetamina mediante vasoespasmo coronario epicárdico alfa-1, aumento de demanda de oxígeno miocárdico y agregación plaquetaria.',
    pathophysiologyEn:
      'Sympathomimetics block presynaptic norepinephrine and dopamine reuptake while stimulating vascular alpha-1 adrenergic receptors. Administering a pure beta-blocker (metoprolol, propranolol, esmolol) blocks beta-2 coronary and peripheral vasodilation, leaving alpha-1 vasoconstriction completely unopposed—precipitating paradoxical worsening of coronary vasospasm, severe hypertension, and cardiac arrest.',
    pathophysiologyEs:
      'Los simpaticomiméticos bloquean la recaptación de norepinefrina y estimulan receptores alfa-1. Administrar un betabloqueador puro (metoprolol, propranolol, esmolol) bloquea la vasodilatación beta-2 y deja la vasoconstricción alfa-1 sin oposición, agravando el espasmo coronario y la crisis hipertensiva.',
    diagnosticsEn: [
      '12-Lead ECG within 10 Minutes: Evaluate for ST-segment elevation (which may resolve rapidly with nitroglycerin/benzodiazepines if pure vasospasm, or persist in thrombotic occlusion), ST depressions, and QRS/QTc intervals.',
      'High-Sensitivity Cardiac Troponin (0h / 1–2h): Distinguishes unstable angina/coronary spasm from NSTEMI/STEMI.',
      'Chest Radiograph & Bedside Echo: Rule out concurrent aortic dissection, pneumothorax/pneumomediastinum ("crack lung"), or apical Takotsubo wall-motion abnormality.'
    ],
    diagnosticsEs: [
      'ECG de 12 Derivaciones en < 10 Minutos: Evaluar elevación del segmento ST (que puede revertir con nitroglicerina/benzodiazepinas si es vasoespasmo puro, o persistir si hay trombosis), ancho del QRS y QTc.',
      'Troponina Cardíaca de Alta Sensibilidad (0h / 1–2h): Distingue vasoespasmo reversible de IAMCEST/IAMSEST.',
      'Radiografía de Tórax y Ecocardiograma POCUS: Descartar disección aórtica, neumomediastino o miocardiopatía de Takotsubo.'
    ],
    managementEn: [
      'FIRST-LINE CENTRAL SYMPATHOLYSIS (IV Benzodiazepines): Administer IV Lorazepam (2–4 mg IV) or Diazepam (5–10 mg IV) titrated to calm agitation and blunt central sympathetic outflow—often normalizes blood pressure, heart rate, and chest pain faster than antihypertensives!',
      'FIRST-LINE CORONARY VASODILATORS & ANTIPLATELET: Administer Sublingual or IV Nitroglycerin (0.4 mg SL q5min or IV infusion titrated to chest pain and BP) + Chewable Aspirin 325 mg.',
      'Second-Line Coronary Vasodilators: Non-dihydropyridine or dihydropyridine Calcium Channel Blockers (Diltiazem 10–20 mg IV, Verapamil, or Nicardipine infusion) or direct Alpha-1 Antagonist Phentolamine (1–5 mg IV bolus) for refractory coronary spasm.',
      'CARDINAL BETA-BLOCKER CONTRAINDICATION RULE: Strictly AVOID pure beta-blockers (Metoprolol, Propranolol, Esmolol) during acute cocaine/stimulant intoxication (signs of acute euphoria, tachycardia, diaphoresis, or use within 6–24 hours).',
      'Persistent ST-Elevation despite Nitroglycerin & Benzodiazepines: Activate Emergent Primary PCI (Coronary Angiography) immediately.'
    ],
    managementEs: [
      'PRIMERA LÍNEA SIMPATICOLÍTICA CENTRAL (Benzodiazepinas IV): Administrar Lorazepam IV (2–4 mg) o Diazepam IV (5–10 mg) para frenar la descarga simpática central; suele normalizar PA, FC y dolor torácico.',
      'PRIMERA LÍNEA VASODILATADORA CORONARIA: Nitroglicerina sublingual o en infusión IV + Ácido Acetilsalicílico (Aspirina) 325 mg masticable.',
      'Segunda Línea Vasodilatadora: Bloqueadores de Canales de Calcio (Diltiazem IV, Verapamilo o Nicardipino) o Fentolamina IV (1–5 mg, antagonista alfa-1 directo) en vasoespasmo refractario.',
      'REGLA CARDINAL DE CONTRAINDICACIÓN DE BETABLOQUEADORES: EVITAR estrictamente betabloqueadores puros (Metoprolol, Propranolol, Esmolol) en intoxicación aguda por cocaína/estimulantes.',
      'Elevación Persistente del ST pese a Nitroglicerina y Benzodiazepinas: Activar Angiografía Coronaria / ICP Primaria urgente.'
    ],
    harmReductionEn:
      'Warn individuals who use cocaine that combining cocaine with alcohol forms Cocaethylene in the liver—an active metabolite with an 18-to-25-fold higher risk of sudden cardiac death than cocaine alone.',
    harmReductionEs:
      'Advertir que combinar cocaína con alcohol produce Cocaetileno en el hígado, un metabolito activo que multiplica por 18 a 25 el riesgo de muerte súbita cardíaca.'
  }),

  sodium_channel_wide_qrs: Object.freeze({
    id: 'sodium_channel_wide_qrs',
    urgency: 'EMERGENCY',
    badgeEn: 'QRS > 100–120 ms — STAT IV HYPERTONIC SODIUM BICARBONATE',
    badgeEs: 'QRS > 100–120 ms — BICARBONATO DE SODIO HIPERTÓNICO IV STAT',
    titleEn: 'Cocaine, TCA, Diphenhydramine & Loperamide Sodium-Channel Blockade (Wide-QRS VT)',
    titleEs: 'Bloqueo de Canales de Sodio por Cocaína, Antidepresivos Tricíclicos, Difenhidramina y Loperamida (QRS Ancho)',
    summaryEn:
      'Life-threatening wide-complex tachycardia, Brugada-like pattern, and refractory hypotension caused by fast inward cardiac sodium-channel (NaV1.5) blockade from Cocaine, Cocaethylene, Tricyclic Antidepressants (Amitriptyline, Doxepin), Diphenhydramine, Propoxyphene, or high-dose Loperamide.',
    summaryEs:
      'Taquicardia de complejo ancho potencialmente mortal, patrón tipo Brugada e hipotensión refractaria por bloqueo de canales rápidos de sodio (NaV1.5) inducido por Cocaína, Cocaetileno, Antidepresivos Tricíclicos (Amitriptilina), Difenhidramina o megadosis de Loperamida.',
    pathophysiologyEn:
      'Vaughan-Williams Class IC-like blockade of cardiac NaV1.5 channels slows Phase 0 depolarization in His-Purkinje and ventricular myocardium. Acidosis (from seizures or hypoperfusion) increases the ionized fraction of drug bound to the sodium channel, creating a vicious cycle of QRS widening, re-entrant ventricular tachycardia, and asystole.',
    pathophysiologyEs:
      'El bloqueo tipo Clase IC de los canales NaV1.5 enlentece la fase 0 de despolarización ventricular. La acidosis incrementa la fracción ligada al canal de sodio, generando un círculo vicioso de ensanchamiento del QRS, taquicardia ventricular y asistolia.',
    diagnosticsEn: [
      '12-Lead ECG Cardinal Signs of Sodium-Channel Toxicity: (1) QRS duration > 100 ms (seizure risk) or > 160 ms (ventricular arrhythmia risk); (2) Prominent terminal R wave > 3 mm in lead aVR (or R/S ratio > 0.7 in aVR); (3) Deep slurred S wave in leads I and aVL; or (4) Brugada phenocopy (coved ST elevation in V1–V2).',
      'Arterial / Venous Blood Gas & Electrolytes: Check serum pH, Na+, K+, Mg2+, and lactate.'
    ],
    diagnosticsEs: [
      'Signos Cardinales en ECG de 12 Derivaciones: (1) Duración del QRS > 100 ms (riesgo de convulsiones) o > 160 ms (riesgo de arritmia ventricular); (2) Onda R terminal > 3 mm en aVR (o relación R/S > 0.7 en aVR); (3) Onda S empastada en DI y aVL; o (4) Fenocopia de Brugada en V1–V2.',
      'Gasometría y Electrolitos: Medir pH sérico, Na+, K+, Mg2+ y lactato.'
    ],
    managementEn: [
      'IMMEDIATE ANTIDOTE — HYPERTONIC SODIUM BICARBONATE: Administer 1–2 mEq/kg IV push (1–2 ampoules / 50–100 mL of 8.4% Sodium Bicarbonate) over 1–2 minutes. Repeat boluses every 3–5 minutes until the QRS narrows to < 100 ms and hypotension improves!',
      'Dual Mechanism of Sodium Bicarbonate: (1) Hypertonic sodium load (150+ mEq/L) overwhelms competitive NaV1.5 channel blockade by mass action; (2) Serum alkalinization (target arterial pH 7.45–7.55) promotes drug dissociation from the sodium channel. Follow boluses with an isotonic bicarbonate infusion (150 mEq NaHCO3 in 1 L D5W at 150–250 mL/hr) while monitoring K+ and ionized Ca2+.',
      'SECOND-LINE ANTIARRHYTHMIC (IV Lidocaine): If wide-complex tachycardia persists despite pH 7.50 and sodium bicarbonate, administer IV Lidocaine (1–1.5 mg/kg IV bolus, Class IB fast-on/fast-off kinetics that displace slow-dissociating toxins from NaV1.5).',
      'STRICTLY CONTRAINDICATED ANTIARRHYTHMICS: NEVER administer Class IA (Procainamide, Quinidine), Class IC (Flecainide), beta-blockers, or Amiodarone—they worsen sodium-channel blockade and QTc prolongation!',
      'Control Seizures Immediately with IV Benzodiazepines (Lorazepam/Diazepam) and Hyperventilate Intubated Patients to pH 7.50 (preventing respiratory acidosis).'
    ],
    managementEs: [
      'ANTÍDOTO INMEDIATO — BICARBONATO DE SODIO HIPERTÓNICO: Administrar 1–2 mEq/kg en bolo IV rápido (1–2 ámpulas / 50–100 mL de Bicarbonato de Sodio al 8.4%) en 1–2 minutos. ¡Repetir bolos cada 3–5 minutos hasta estrechar el QRS a < 100 ms!',
      'Doble Mecanismo del Bicarbonato: (1) La carga hipertónica de sodio vence el bloqueo del canal NaV1.5 por acción de masas; (2) La alcalinización sérica (meta pH 7.45–7.55) desliga la toxina del canal. Continuar infusión (150 mEq NaHCO3 en 1 L de glucosado al 5%) vigilando K+ y Ca2+ iónico.',
      'SEGUNDA LÍNEA ANTIARRÍTMICA (Lidocaína IV): Si persiste TV pese a bicarbonato y pH 7.50, administrar Lidocaína IV (1–1.5 mg/kg, Clase IB de cinética rápida que desplaza a la cocaína/ATC del canal).',
      'ANTIARRÍTMICOS ESTRICTAMENTE CONTRAINDICADOS: NUNCA usar Clase IA (Procainamida), Clase IC (Flecainida), betabloqueadores ni Amiodarona.',
      'Yugular Convulsiones de Inmediato con Benzodiazepinas IV para evitar acidosis láctica que agrava la cardiotoxicidad.'
    ],
    harmReductionEn:
      'Educate patients and clinicians that diphenhydramine (Benadryl) and loperamide (Imodium) in megadoses act as lethal sodium- and potassium-channel blockers—never exceed labeled OTC doses to self-treat withdrawal.',
    harmReductionEs:
      'Educar sobre el peligro letal de megadosis de difenhidramina o loperamida para autotratar la abstinencia, ya que bloquean los canales cardíacos de sodio y potasio.'
  }),

  qtc_torsades_de_pointes: Object.freeze({
    id: 'qtc_torsades_de_pointes',
    urgency: 'EMERGENCY',
    badgeEn: 'QTc > 500 ms / TORSADES — IV MAGNESIUM 2g + K+ > 4.5 + OVERDRIVE PACING',
    badgeEs: 'QTc > 500 ms / TORSADES — MAGNESIO IV 2g + K+ > 4.5 + MARCAPASOS DE SOBREESTIMULACIÓN',
    titleEn: 'Methadone, Loperamide & Antipsychotic QTc Prolongation & Torsades de Pointes (TdP)',
    titleEs: 'Prolongación del QTc y Torsades de Pointes (TdP) por Metadona, Loperamida y Antipsicóticos',
    summaryEn:
      'Acquired Long QT Syndrome (QTc > 500 ms) and polymorphic ventricular tachycardia with a twisting QRS axis (Torsades de Pointes) caused by hERG (IKr) potassium-channel blockade from high-dose Methadone, Loperamide megadosing, Haloperidol/Droperidol/Quetiapine, Ondansetron, or CYP3A4 drug interactions.',
    summaryEs:
      'Síndrome de QT Largo adquirido (QTc > 500 ms) y taquicardia ventricular polimórfica (Torsades de Pointes) por bloqueo del canal de potasio hERG (IKr) secundario a Metadona, megadosis de Loperamida, Haloperidol/Quetiapina, Ondansetrón o interacciones CYP3A4.',
    pathophysiologyEn:
      'Inhibition of the rapid delayed rectifier potassium current (IKr / hERG channel) prolongs ventricular Phase 3 repolarization and generates early afterdepolarizations (EADs). Bradycardia ("pause-dependent" long-short sequences), hypokalemia, hypomagnesemia, and CYP3A4 inhibitors (fluconazole, clarithromycin, cobicistat) precipitate R-on-T polymorphic VT.',
    pathophysiologyEs:
      'La inhibición de la corriente rectificadora rápida de potasio (IKr / hERG) prolonga la fase 3 de repolarización y genera posdespolarizaciones precoces. La bradicardia ("pausa-dependiente"), hipopotasemia, hipomagnesemia e inhibidores CYP3A4 precipitan Torsades de Pointes.',
    diagnosticsEn: [
      '12-Lead ECG & Telemetry: QTc >= 500 ms (or > 60 ms increase from baseline) confers high risk for TdP. Look for prominent U waves, T-wave alternans, ventricular bigeminy, and "short-long-short" R-R coupling preceding twisting polymorphic VT.',
      'STAT Electrolyte Panel: Serum K+, Mg2+, and ionized Ca2+ (often depleted by vomiting/diarrhea during withdrawal or alcohol use).',
      'Comprehensive Medication & CYP3A4 Audit: Review Methadone dose, antiemetics (ondansetron), antipsychotics, antidepressants (citalopram, escitalopram), and antimicrobials (fluoroquinolones, macrolides, azoles).'
    ],
    diagnosticsEs: [
      'ECG de 12 Derivaciones y Telemetría: QTc >= 500 ms (o incremento > 60 ms) conlleva alto riesgo de TdP. Buscar ondas U prominentes, alternancia de onda T y secuencias "corto-largo-corto".',
      'Panel Electrolítico STAT: K+, Mg2+ y Ca2+ iónico (frecuentemente depletados por vómitos, diarrea o consumo de alcohol).',
      'Auditoría Farmacológica y CYP3A4: Revisar dosis de Metadona, ondansetrón, antipsicóticos, citalopram/escitalopram, quinolonas, macrólidos y azoles.'
    ],
    managementEn: [
      'FIRST-LINE THERAPY FOR TORSADES DE POINTES: Administer IV Magnesium Sulfate 2 g (16 mEq) IV over 5–15 minutes immediately—EVEN IF baseline serum magnesium is normal! Repeat a second 2 g IV bolus after 15 minutes and start a continuous infusion (1–2 g/hr) if episodes recur. (Unstable/pulseless TdP requires immediate unsynchronized Defibrillation!).',
      'Aggressive Electrolyte Optimization: Replete Potassium to a high-normal target of 4.5–5.0 mEq/L and Magnesium to > 2.0–2.5 mg/dL.',
      'Overdrive Pacing for Pause-Dependent / Refractory TdP (Especially Loperamide or High-Dose Methadone): Increase heart rate to 90–110 bpm using Temporary Transvenous Overdrive Pacing or an IV Isoproterenol infusion (2–10 mcg/min)—faster heart rates shorten ventricular repolarization and abolish EADs! (Avoid Amiodarone and Sotalol, which further prolong QTc!).',
      'MOUD-Preserving QTc Reduction Strategy: Never abruptly dump a patient off MOUD into fatal relapse! For Methadone QTc > 500 ms: (1) Eliminate all non-essential QTc-prolonging drugs and CYP3A4 inhibitors; (2) Replete K+/Mg2+; (3) Reduce Methadone dose by 10–20% or split dose BID; or (4) Transition safely via micro-induction to Buprenorphine (which has a ceiling on hERG effects and does NOT cause Torsades de Pointes).'
    ],
    managementEs: [
      'PRIMERA LÍNEA EN TORSADES DE POINTES: Administrar Sulfato de Magnesio IV 2 g en 5–15 minutos de inmediato, ¡AUNQUE el magnesio sérico sea normal! Repetir un segundo bolo de 2 g si recurre. (Si no tiene pulso o está inestable, Desfibrilación eléctrica inmediata).',
      'Optimización Electrolítica: Reponer Potasio a meta de 4.5–5.0 mEq/L y Magnesio > 2.0–2.5 mg/dL.',
      'Sobreestimulación Cardíaca (Overdrive Pacing) en TdP Refractario (Loperamida / Metadona): Aumentar FC a 90–110 lpm mediante Marcapasos Transvenoso Temporal o infusión de Isoproterenol (2–10 mcg/min) para acortar el intervalo QT. (¡Evitar Amiodarona!).',
      'Estrategia de Reducción del QTc Preservando el TMO: ¡Nunca suspender abruptamente el tratamiento de adicciones! Eliminar fármacos que prolongan el QTc/inhibidores CYP3A4, corregir K+/Mg2+, reducir ligeramente la dosis de Metadona o transicionar mediante microinducción a Buprenorfina (que no causa Torsades).'
    ],
    harmReductionEn:
      'Obtain a baseline 12-lead ECG before or within 30 days of starting Methadone, repeat at 30 days and whenever the daily dose exceeds 100–120 mg/day, or if unexplained syncope/palpitations occur.',
    harmReductionEs:
      'Realizar ECG basal al iniciar Metadona, repetir a los 30 días, al superar 100–120 mg/día o ante cualquier episodio de síncope o palpitaciones.'
  }),

  stimulant_aortic_dissection: Object.freeze({
    id: 'stimulant_aortic_dissection',
    urgency: 'EMERGENCY',
    badgeEn: 'ANTI-IMPULSE RULE: CONTROL HR (< 60 bpm) BEFORE VASODILATION',
    badgeEs: 'REGLA ANTI-IMPULSO: CONTROLAR FC (< 60 lpm) ANTES DE VASODILATAR',
    titleEn: 'Cocaine & Methamphetamine Acute Aortic Dissection (Stanford Type A & Type B)',
    titleEs: 'Disección Aórtica Aguda por Cocaína y Metanfetamina (Stanford Tipo A y Tipo B)',
    summaryEn:
      'Catastrophic intimal tear and false-lumen propagation of the ascending aorta (Stanford Type A — surgical emergency) or descending thoracic aorta (Stanford Type B) triggered by extreme catecholamine blood pressure surges during crack cocaine or methamphetamine use.',
    summaryEs:
      'Desgarro intimal catastrófico de la aorta ascendente (Stanford Tipo A — emergencia quirúrgica) o aorta torácica descendente (Stanford Tipo B) desencadenado por crisis hipertensivas extremas tras fumar crack o usar metanfetamina.',
    pathophysiologyEn:
      'Chronic stimulant exposure induces cystic medial necrosis and smooth muscle apoptosis in the aortic media, while acute smoking/injection produces a sudden spike in blood pressure and left ventricular ejection velocity (dP/dt), shearing the aortic intima at the sinotubular junction or just distal to the left subclavian artery.',
    pathophysiologyEs:
      'El uso crónico de estimulantes induce necrosis quística de la media aórtica, y el pico hipertensivo agudo eleva bruscamente la fuerza de cizallamiento ventricular (dP/dt), desgarrando la íntima en la aorta ascendente o distal a la subclavia izquierda.',
    diagnosticsEn: [
      'Clinical Red Flags: Abrupt, maximal-at-onset "ripping" or "tearing" anterior chest pain or interscapular back pain, pulse deficit or systolic BP differential > 20 mmHg between right and left arms, new diastolic murmur of aortic regurgitation, syncope (pericardial tamponade), or focal stroke/paraplegia.',
      'CT Angiography (CTA) of the Chest, Abdomen & Pelvis (Gold Standard) or Transesophageal Echocardiogram (TEE) at bedside if unstable.',
      'CRITICAL DIAGNOSTIC TRAP: Never give anticoagulants (heparin) or thrombolytics (tPA) for "chest pain / stroke" until aortic dissection is excluded when tearing back pain or pulse deficits are present!'
    ],
    diagnosticsEs: [
      'Signos de Alarma: Dolor torácico o interescapular súbito de máxima intensidad desde el inicio ("desgarrante"), asimetría de pulsos o diferencia de PA sistólica > 20 mmHg entre ambos brazos, nuevo soplo diastólico de insuficiencia aórtica o déficit neurológico.',
      'Angio-TC (CTA) de Tórax, Abdomen y Pelvis (Estándar de Oro) o Ecocardiograma Transesofágico (ETE) si está inestable.',
      'TRAMPA DIAGNÓSTICA CRÍTICA: Nunca administrar heparina ni trombolíticos (tPA) ante dolor torácico desgarrante o asimetría de pulsos sin descartar disección aórtica.'
    ],
    managementEn: [
      'CARDINAL ANTI-IMPULSE SEQUENCE (Heart Rate Control FIRST, Blood Pressure SECOND): Target Heart Rate < 60 bpm AND Systolic BP 100–120 mmHg within 20 minutes.',
      'Why Rate Control Must Precede Pure Vasodilators: Administering a pure vasodilator (Hydralazine, Nitroprusside, or Nicardipine alone) without prior AV nodal/rate blockade triggers reflex sympathetic tachycardia, which increases aortic wall shear stress (dP/dt) and violently propagates the dissection tear!',
      'Preferred IV Regimen in Stimulant Aortic Dissection: Use combined Alpha/Beta-Blocker IV Labetalol (20 mg IV bolus, then 20–80 mg q10min or 1–2 mg/min infusion) OR pair a Calcium Channel Blocker (IV Diltiazem/Verapamil) or ultra-short Esmolol + IV Nicardipine/Clevidipine/Nitroprusside + IV Fentanyl/Morphine + IV Benzodiazepines (to abolish pain- and stimulant-driven catecholamine surges).',
      'STAT Cardiothoracic Surgery Activation for all Stanford Type A (ascending) dissections and complicated Type B dissections (malperfusion or rupture).'
    ],
    managementEs: [
      'SECUENCIA CARDINAL ANTI-IMPULSO (Controlar Frecuencia Cardíaca PRIMERO, Presión Arterial SEGUNDO): Meta de FC < 60 lpm Y PA Sistólica 100–120 mmHg en < 20 minutos.',
      'Por Qué el Control de FC Precede a los Vasodilatadores: Dar un vasodilatador puro (Hidralazina o Nitroprusiato solo) sin frenar antes el nodo AV desencadena taquicardia refleja, aumentando el cizallamiento aórtico (dP/dt) y extendiendo la disección.',
      'Régimen IV Preferido: Labetalol IV (bloqueador alfa/beta combinado: bolo de 20 mg, luego infusión 1–2 mg/min) O Diltiazem/Esmolol asociado a Nicardipino/Clevidipino IV + Fentanilo IV + Benzodiazepinas IV.',
      'Activación STAT de Cirugía Cardiotorácica en toda disección Stanford Tipo A (ascendente) y Tipo B complicada.'
    ],
    harmReductionEn:
      'Counsel patients with hypertension and stimulant use that sudden tearing chest or back pain is a life-threatening emergency requiring immediate 911 transport, and provide low-threshold antihypertensive care (amlodipine, carvedilol/labetalol, losartan).',
    harmReductionEs:
      'Orientar a personas con hipertensión y uso de estimulantes que cualquier dolor torácico o dorsal desgarrante súbito exige llamar al 911 de inmediato.'
  }),

  takotsubo_withdrawal_cardiomyopathy: Object.freeze({
    id: 'takotsubo_withdrawal_cardiomyopathy',
    urgency: 'EMERGENCY',
    badgeEn: 'WITHDRAWAL CATECHOLAMINE STORM — SCREEN FOR LVOT OBSTRUCTION',
    badgeEs: 'TORMENTA CATECOLAMINÉRGICA DE ABSTINENCIA — DESCARTAR OBSTRUCCIÓN DEL TSVI',
    titleEn: 'Takotsubo Stress Cardiomyopathy in Precipitated Opioid or Alcohol Withdrawal',
    titleEs: 'Miocardiopatía por Estrés de Takotsubo en Abstinencia Precipitada de Opioides o Alcohol',
    summaryEn:
      'Acute, reversible left ventricular apical ballooning and cardiogenic shock triggered by the massive endogenous catecholamine surge of precipitated opioid withdrawal (naloxone/buprenorphine), abrupt xylazine/clonidine rebound, or severe alcohol withdrawal (Delirium Tremens).',
    summaryEs:
      'Balonamiento apical agudo del ventrículo izquierdo y choque cardiogénico desencadenados por la tormenta catecolaminérgica de una abstinencia precipitada de opioides, rebote de xilacina/clonidina o Delirium Tremens.',
    pathophysiologyEn:
      'A 10-to-30-fold surge in plasma epinephrine and norepinephrine during untreated severe withdrawal switches apical beta-2 adrenergic receptors from Gs (stimulatory) to Gi (inhibitory) signaling ("stimulus trafficking"). This stuns the LV apex into akinesis while the basal segments contract hyperdynamically—creating a dynamic Left Ventricular Outflow Tract Obstruction (LVOTO) in 15–25% of patients!',
    pathophysiologyEs:
      'El aumento de 10 a 30 veces en epinefrina y norepinefrina durante la abstinencia grave aturde el ápex ventricular izquierdo (acinesia apical) mientras la base se contrae hiperdinámicamente, generando Obstrucción Dinámica del Tracto de Salida del VI (OTSVI) en el 15–25% de los casos.',
    diagnosticsEn: [
      'Bedside Transthoracic Echocardiogram (STAT): Circumferential apical (or mid-ventricular) akinesis/ballooning extending beyond a single coronary artery territory, with hypercontractile basal segments. MANDATORY: Use Continuous-Wave Doppler across the LVOT to check for dynamic LVOT Obstruction (gradient > 30 mmHg) and Systolic Anterior Motion (SAM) of the mitral valve!',
      '12-Lead ECG & Troponin: Anterior precordial ST-elevations or deep symmetric T-wave inversions with QTc prolongation and modest troponin elevation disproportionate to the large area of stunned myocardium.'
    ],
    diagnosticsEs: [
      'Ecocardiograma Transtorácico a pie de cama (STAT): Acinesia/balonamiento apical circunferencial que excede un territorio coronario único, con base hiperdinámica. OBLIGATORIO: Evaluar con Doppler el Tracto de Salida del VI para detectar Obstrucción Dinámica (OTSVI) y movimiento sistólico anterior (SAM) mitral.',
      'ECG de 12 Derivaciones y Troponina: Elevación del ST precordial o inversión profunda de ondas T con prolongación del QTc.'
    ],
    managementEn: [
      'CARDINAL LVOT OBSTRUCTION RULE (The Inotrope Trap): If dynamic LVOT Obstruction (LVOTO) is present on echocardiogram, INOTROPES (Dobutamine, Dopamine, Epinephrine, Milrinone) and NITROGLYCERIN / IABP ARE STRICTLY CONTRAINDICATED—they increase basal hypercontractility, collapse the outflow tract, and cause fatal hemodynamic crash! Treat hypotension in Takotsubo + LVOTO with cautious IV fluid boluses, short-acting Beta-Blockers (Esmolol/Metoprolol to slow HR and improve LV filling), and pure Alpha-1 Vasopressor (Phenylephrine) if needed.',
      'EXTINGUISH THE WITHDRAWAL CATECHOLAMINE STORM IMMEDIATELY: Takotsubo will not resolve while the sympathetic storm rages! (1) For precipitated opioid withdrawal: administer high-affinity MOUD rescue (additional Buprenorphine 16–32 mg SL or IV Fentanyl/Hydromorphone in ICU) + IV Dexmedetomidine/Clonidine; (2) For Alcohol/GABA withdrawal: administer symptom-triggered IV Lorazepam/Diazepam or Phenobarbital.',
      'Anticoagulation for Apical LV Thrombus: Initiate systemic anticoagulation if severe apical akinesis (LVEF < 30%) or mural thrombus is visualized.'
    ],
    managementEs: [
      'REGLA CARDINAL DE OBSTRUCCIÓN DEL TSVI (Trampa de Inotrópicos): Si existe obstrucción dinámica del TSVI (OTSVI) en el ecocardiograma, los INOTRÓPICOS (Dobutamina, Dopamina, Epinefrina, Milrinona) y la NITROGLICERINA ESTÁN ESTRICTAMENTE CONTRAINDICADOS (colapsan el tracto de salida). Tratar la hipotensión con líquidos IV prudentes, betabloqueadores de acción corta y Fenilefrina (agonista alfa-1 puro).',
      'APAGAR DE INMEDIATO LA TORMENTA DE ABSTINENCIA: (1) En abstinencia precipitada de opioides: rescate con Buprenorfina en dosis altas (16–32 mg SL) o Fentanilo/Hidromorfona IV en UCI + Dexmedetomidina/Clonidina; (2) En abstinencia de alcohol/sedantes: Lorazepam/Diazepam IV o Fenobarbital.',
      'Anticoagulación por Trombo Apical: Iniciar anticoagulación si hay acinesia apical severa (FEVI < 30%) o trombo mural.'
    ],
    harmReductionEn:
      'Recognize that severe opioid, xylazine, or alcohol withdrawal is not "merely uncomfortable"—in older adults or medically fragile patients, untreated withdrawal precipitates Takotsubo cardiomyopathy, myocardial infarction, and stroke. Treat withdrawal aggressively and early.',
    harmReductionEs:
      'Reconocer que la abstinencia grave de opioides, xilacina o alcohol no es "solo incómoda": puede precipitar miocardiopatía de Takotsubo, infarto y EVC. Tratar la abstinencia de forma temprana y efectiva.'
  }),

  methamphetamine_cardiomyopathy_pah: Object.freeze({
    id: 'methamphetamine_cardiomyopathy_pah',
    urgency: 'URGENT',
    badgeEn: '4-PILLAR GDMT + METH-PAH RIGHT HEART SCREENING',
    badgeEs: 'TERAPIA CUÁDRUPLE GDMT + TAMIZAJE DE HAP POR METANFETAMINA',
    titleEn: 'Methamphetamine-Associated Cardiomyopathy (MACM) & Pulmonary Arterial Hypertension (Meth-PAH)',
    titleEs: 'Miocardiopatía Asociada a Metanfetamina (MACM) e Hipertensión Arterial Pulmonar (HAP-Met)',
    summaryEn:
      'Chronic biventricular dilated cardiomyopathy (often LVEF < 20–25% with intracardiac thrombi) and WHO Group 1 Pulmonary Arterial Hypertension (Meth-PAH) caused by chronic methamphetamine use.',
    summaryEs:
      'Miocardiopatía dilatada biventricular crónica (a menudo con FEVI < 20–25% y trombos intracardíacos) e Hipertensión Arterial Pulmonar Grupo 1 de la OMS (HAP-Met) causadas por uso crónico de metanfetamina.',
    pathophysiologyEn:
      'Methamphetamine induces cardiomyocyte catecholamine toxicity, oxidative stress, and myocardial fibrosis (MACM), while simultaneously acting as a substrate for the pulmonary endothelial Serotonin Transporter (SERT)—triggering plexiform pulmonary arteriolar remodeling and severe right ventricular failure (WHO Group 1 Meth-PAH).',
    pathophysiologyEs:
      'La metanfetamina produce toxicidad catecolaminérgica y fibrosis miocárdica (MACM), y actúa sobre el transportador endotelial pulmonar de serotonina (SERT), provocando remodelado arteriolar pulmonar plexiforme e insuficiencia ventricular derecha (HAP Grupo 1).',
    diagnosticsEn: [
      'Transthoracic Echocardiogram with Contrast: Assess LVEF, left/right ventricular dilation, apical/mural thrombi (present in up to 30% of severe MACM!), and estimated Pulmonary Artery Systolic Pressure (PASP > 40–50 mmHg) / RV strain.',
      'BNP / NT-proBNP, 12-Lead ECG, and Right Heart Catheterization (if WHO Group 1 Meth-PAH is suspected: mPAP > 20 mmHg, PAWP <= 15 mmHg, PVR > 2 Wood units).'
    ],
    diagnosticsEs: [
      'Ecocardiograma Transtorácico con Contraste: Evaluar FEVI, dilatación biventricular, trombos murales (presentes hasta en 30% de MACM severa) y presión sistólica de arteria pulmonar (PSAP > 40–50 mmHg).',
      'BNP / NT-proBNP, ECG y Cateterismo Cardíaco Derecho si se sospecha HAP Grupo 1 por metanfetamina.'
    ],
    managementEn: [
      '4-Pillar Heart Failure Guideline-Directed Medical Therapy (GDMT): Once acute stimulant intoxication has cleared (> 24–48h), initiate (1) ARNI (Sacubitril/Valsartan) or ACEi/ARB, (2) Evidence-Based Alpha/Beta-Blocker (Carvedilol is preferred over pure beta-blockers due to combined alpha-1 blockade!), (3) Mineralocorticoid Receptor Antagonist (Spironolactone/Eplerenone), and (4) SGLT2 Inhibitor (Empagliflozin/Dapagliflozin) + Loop Diuretics for congestion.',
      'Anticoagulation for Intracardiac Thrombus: DOAC (Apixaban/Rivaroxaban) or Warfarin for >= 3–6 months if LV/RV thrombus is identified.',
      'Methamphetamine Cessation & Contingency Management: Stopping methamphetamine before extensive late gadolinium enhancement (fibrosis) occurs allows dramatic LVEF recovery (often +15% to +25% improvement!). Pair Contingency Management with pharmacotherapy (mirtazapine or bupropion + naltrexone).'
    ],
    managementEs: [
      'Terapia Médica Dirigida por Guías de 4 Pilares (GDMT): Una vez resuelta la intoxicación aguda (> 24–48 h), iniciar (1) INRA (Sacubitrilo/Valsartán) o IECA/ARA-II, (2) Alfa/Betabloqueador (Carvedilol es de elección por su bloqueo alfa-1 adicional), (3) Antagonista Mineralocorticoide (Espironolactona) y (4) Inhibidor SGLT2 (Empagliflozina/Dapagliflozina).',
      'Anticoagulación por Trombo Intracardíaco: ACO directo (Apixabán/Rivaroxabán) o Warfarina por >= 3–6 meses si hay trombo ventricular.',
      'Cese de Metanfetamina y Manejo de Contingencias: Suspender la metanfetamina antes de que exista fibrosis extensa permite recuperar la FEVI entre +15% y +25%.'
    ],
    harmReductionEn:
      'Prefer Carvedilol (combined alpha-1, beta-1, beta-2 blocker) over selective beta-blockers in patients with heart failure who remain at risk for intermittent stimulant slips, and provide portable pill organizers and low-barrier cardiology follow-up.',
    harmReductionEs:
      'Preferir Carvedilol (bloqueador alfa-1 y beta combinado) en pacientes con insuficiencia cardíaca con riesgo de recaída en estimulantes, facilitando seguimiento cardiológico sin barreras.'
  })
});

export const CARDIOLOGY_HARM_REDUCTION_RULES = Object.freeze([
  Object.freeze({
    id: 'cocaine_no_pure_betablocker_benzos_first_rule',
    titleEn: 'The Stimulant Chest Pain Benzodiazepine-First & No-Pure-Beta-Blocker Rule',
    titleEs: 'Regla de Benzodiazepinas Primero y Prohibición de Betabloqueadores Puros en Dolor Torácico por Cocaína',
    bodyEn:
      'In acute cocaine or methamphetamine chest pain and hypertension, give IV Benzodiazepines (Lorazepam/Diazepam) + Nitroglycerin + Aspirin first. Never give pure beta-blockers (Metoprolol, Propranolol, Esmolol) during acute stimulant intoxication—unopposed alpha-1 vasoconstriction worsens coronary spasm.',
    bodyEs:
      'En dolor torácico e hipertensión aguda por cocaína o metanfetamina, administrar primero Benzodiazepinas IV (Lorazepam/Diazepam) + Nitroglicerina + Aspirina. Nunca dar betabloqueadores puros (Metoprolol, Propranolol, Esmolol) en intoxicación aguda por riesgo de vasoconstricción alfa-1 sin oposición.'
  }),
  Object.freeze({
    id: 'wide_qrs_sodium_bicarbonate_rule',
    titleEn: 'The Wide-QRS (> 100–120 ms) Hypertonic Sodium Bicarbonate Rule',
    titleEs: 'Regla de Bicarbonato de Sodio Hipertónico en QRS Ancho (> 100–120 ms)',
    bodyEn:
      'Wide-complex tachycardia or QRS > 100–120 ms in cocaine, cocaethylene, TCA, diphenhydramine, or loperamide toxicity represents cardiac NaV1.5 channel blockade. Immediately administer 1–2 mEq/kg IV boluses of 8.4% Sodium Bicarbonate targeting QRS < 100 ms and pH 7.45–7.55; avoid Procainamide and Amiodarone.',
    bodyEs:
      'La taquicardia de complejo ancho o QRS > 100–120 ms por cocaína, antidepresivos tricíclicos, difenhidramina o loperamida se debe a bloqueo del canal NaV1.5. Administrar bolos IV de 1–2 mEq/kg de Bicarbonato de Sodio al 8.4% hasta lograr QRS < 100 ms y pH 7.45–7.55; evitar Procainamida y Amiodarona.'
  }),
  Object.freeze({
    id: 'qtc_torsades_magnesium_moud_preservation_rule',
    titleEn: 'The Torsades de Pointes 2g IV Magnesium & MOUD-Preserving QTc Rule',
    titleEs: 'Regla de 2g de Magnesio IV en Torsades de Pointes y Preservación del TMO',
    bodyEn:
      'For QTc > 500 ms or Torsades de Pointes (methadone, loperamide, antipsychotics), give 2 g IV Magnesium Sulfate immediately (regardless of serum Mg level), replete K+ > 4.5 mEq/L, and use overdrive pacing (HR 90–110 bpm) if refractory. Preserve MOUD by removing CYP3A4/QTc co-culprits, splitting methadone, or transitioning to Buprenorphine.',
    bodyEs:
      'Ante QTc > 500 ms o Torsades de Pointes, administrar de inmediato 2 g de Sulfato de Magnesio IV, llevar K+ > 4.5 mEq/L y usar sobreestimulación cardíaca (FC 90–110 lpm) si es refractario. Preservar el TMO retirando fármacos que prolongan el QTc o transicionando a Buprenorfina.'
  }),
  Object.freeze({
    id: 'aortic_dissection_anti_impulse_rule',
    titleEn: 'The Aortic Dissection Anti-Impulse Rule (Heart Rate < 60 bpm BEFORE Vasodilators)',
    titleEs: 'Regla Anti-Impulso en Disección Aórtica (Frecuencia Cardíaca < 60 lpm ANTES de Vasodilatar)',
    bodyEn:
      'In acute aortic dissection, always lower heart rate (< 60 bpm) with IV Labetalol, Esmolol, or Diltiazem BEFORE administering pure vasodilators (Nicardipine/Nitroprusside)—giving a vasodilator alone triggers reflex tachycardia that increases aortic shear stress (dP/dt).',
    bodyEs:
      'En disección aórtica aguda, reducir primero la frecuencia cardíaca (< 60 lpm) con Labetalol, Esmolol o Diltiazem IV ANTES de iniciar vasodilatadores puros (Nicardipino/Nitroprusiato) para evitar taquicardia refleja y aumento del cizallamiento aórtico (dP/dt).'
  }),
  Object.freeze({
    id: 'takotsubo_lvoto_no_inotropes_rule',
    titleEn: 'The Takotsubo Withdrawal Cardiomyopathy LVOT Obstruction Rule',
    titleEs: 'Regla de Obstrucción del TSVI en Miocardiopatía de Takotsubo por Abstinencia',
    bodyEn:
      'Severe precipitated opioid or alcohol withdrawal can cause Takotsubo apical ballooning with dynamic Left Ventricular Outflow Tract Obstruction (LVOTO). Never give Dobutamine, Dopamine, Epinephrine, or Nitroglycerin if LVOTO is present; treat the underlying withdrawal storm immediately.',
    bodyEs:
      'La abstinencia grave de opioides o alcohol puede causar miocardiopatía de Takotsubo con obstrucción dinámica del tracto de salida del VI (OTSVI). Nunca dar Dobutamina, Dopamina, Epinefrina ni Nitroglicerina si hay OTSVI; tratar de inmediato la abstinencia subyacente.'
  })
]);

const DEFAULT_CARDIOLOGY_STATE = Object.freeze({
  selectedSyndrome: 'stimulant_acs_vasospasm',
  stimulantChestPainHypertensionAgitation: false,
  wideQrsOver100msCocaineTcaLoperamide: false,
  qtcOver500msSyncopeMethadoneLoperamide: false,
  tearingBackPainPulseDeficitDissection: false,
  acuteWithdrawalShockApicalBallooning: false,
  chronicMethDyspneaEdemaReducedEf: false,
  clinicalNotes: ''
});

let cardiologyState = { ...DEFAULT_CARDIOLOGY_STATE };
const listeners = new Set();

export function getCardiologyState() {
  return { ...cardiologyState };
}

export function setCardiologyState(patch = {}) {
  cardiologyState = { ...cardiologyState, ...patch };
  for (const fn of listeners) {
    fn(getCardiologyState());
  }
  return getCardiologyState();
}

export function resetCardiologyState() {
  cardiologyState = { ...DEFAULT_CARDIOLOGY_STATE };
  for (const fn of listeners) {
    fn(getCardiologyState());
  }
  return getCardiologyState();
}

export function subscribeCardiologyState(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function evaluateCardiologyRisk(state = cardiologyState, langOverride = getLang()) {
  const lang = langOverride || getLang();
  const isEs = lang === 'es';
  const profile =
    CARDIOLOGY_SYNDROME_PROFILES[state.selectedSyndrome] ||
    CARDIOLOGY_SYNDROME_PROFILES.stimulant_acs_vasospasm;

  const redFlags = [];
  let urgency = profile.urgency;

  if (state.stimulantChestPainHypertensionAgitation) {
    urgency = 'EMERGENCY';
    redFlags.push(
      isEs
        ? 'DOLOR TORÁCICO / VASOESPASMO POR ESTIMULANTES: Administrar Benzodiazepinas IV (Lorazepam 2–4 mg) + Nitroglicerina SL/IV + Aspirina 325 mg. PROHIBIDO usar betabloqueadores puros (Metoprolol, Propranolol, Esmolol) por riesgo de vasoconstricción alfa-1 sin oposición.'
        : 'STIMULANT CHEST PAIN / CORONARY VASOSPASM: Administer IV Benzodiazepines (Lorazepam 2–4 mg) + SL/IV Nitroglycerin + Aspirin 325 mg. STRICTLY AVOID pure beta-blockers (Metoprolol, Propranolol, Esmolol) due to unopposed alpha-1 coronary vasoconstriction.'
    );
  }

  if (state.wideQrsOver100msCocaineTcaLoperamide) {
    urgency = 'EMERGENCY';
    redFlags.push(
      isEs
        ? 'ALERTA DE BLOQUEO DE CANALES DE SODIO (QRS > 100–120 ms por Cocaína/ATC/Difenhidramina/Loperamida): Administrar Bicarbonato de Sodio al 8.4% (1–2 mEq/kg en bolo IV rápido) repitiendo hasta QRS < 100 ms y pH 7.45–7.55. Segunda línea: Lidocaína IV. Evitar Amiodarona y Procainamida.'
        : 'SODIUM-CHANNEL BLOCKADE ALERT (QRS > 100–120 ms from Cocaine/TCA/Diphenhydramine/Loperamide): Administer 8.4% Hypertonic Sodium Bicarbonate (1–2 mEq/kg IV push) repeating until QRS < 100 ms and pH 7.45–7.55. Second-line: IV Lidocaine. Avoid Amiodarone and Procainamide.'
    );
  }

  if (state.qtcOver500msSyncopeMethadoneLoperamide) {
    urgency = 'EMERGENCY';
    redFlags.push(
      isEs
        ? 'ALERTA DE QTc > 500 ms / TORSADES DE POINTES (Metadona / Loperamida / Antipsicóticos): Administrar Sulfato de Magnesio 2 g IV STAT, reponer K+ > 4.5 mEq/L y considerar sobreestimulación cardíaca (FC 90–110 lpm). Preservar el TMO retirando inhibidores CYP3A4 o transicionando a Buprenorfina.'
        : 'QTc > 500 ms / TORSADES DE POINTES ALERT (Methadone / Loperamide / Antipsychotics): Administer IV Magnesium Sulfate 2 g STAT, replete K+ > 4.5 mEq/L, and consider overdrive pacing (HR 90–110 bpm). Preserve MOUD by stopping CYP3A4 inhibitors, splitting methadone, or transitioning to Buprenorphine.'
    );
  }

  if (state.tearingBackPainPulseDeficitDissection) {
    urgency = 'EMERGENCY';
    redFlags.push(
      isEs
        ? 'ALERTA DE DISECCIÓN AÓRTICA AGUDA: Solicitar Angio-TC de tórax/abdomen STAT. Aplicar secuencia Anti-Impulso: controlar FC < 60 lpm PRIMERO (Labetalol o Diltiazem/Esmolol IV) ANTES de dar vasodilatadores puros, con meta de PAS 100–120 mmHg.'
        : 'ACUTE AORTIC DISSECTION ALERT: Obtain STAT Chest/Abdomen CTA. Enforce the Anti-Impulse Sequence: reduce Heart Rate < 60 bpm FIRST (IV Labetalol or Diltiazem/Esmolol) BEFORE giving pure vasodilators, targeting SBP 100–120 mmHg.'
    );
  }

  if (state.acuteWithdrawalShockApicalBallooning) {
    urgency = 'EMERGENCY';
    redFlags.push(
      isEs
        ? 'MIOCARDIOPATÍA DE TAKOTSUBO POR ABSTINENCIA AGUDA: Descartar Obstrucción del Tracto de Salida del VI (OTSVI) con ecocardiograma Doppler; si hay OTSVI, EVITAR Dobutamina/Dopamina/Epinefrina y Nitroglicerina. Tratar de inmediato la tormenta de abstinencia con rescate de Buprenorfina/Fentanilo/Clonidina o Benzodiazepinas.'
        : 'TAKOTSUBO STRESS CARDIOMYOPATHY IN ACUTE WITHDRAWAL: Screen for dynamic LVOT Obstruction (LVOTO) on Doppler Echo; if LVOTO is present, STRICTLY AVOID Dobutamine/Dopamine/Epinephrine and Nitroglycerin. Extinguish the withdrawal catecholamine storm immediately with MOUD/Clonidine or Benzodiazepines.'
    );
  }

  if (state.chronicMethDyspneaEdemaReducedEf) {
    if (urgency !== 'EMERGENCY') urgency = 'URGENT';
    redFlags.push(
      isEs
        ? 'MIOCARDIOPATÍA E HIPERTENSIÓN PULMONAR POR METANFETAMINA (MACM / HAP-Met): Realizar ecocardiograma con contraste para descartar trombo mural y evaluar presión arterial pulmonar. Iniciar terapia cuádruple GDMT (prefiriendo Carvedilol como alfa/betabloqueador) y apoyo para cese de metanfetamina.'
        : 'METHAMPHETAMINE CARDIOMYOPATHY & PAH (MACM / Meth-PAH): Obtain contrast echocardiogram to rule out mural thrombus and assess pulmonary artery pressure. Initiate 4-pillar GDMT (preferring Carvedilol for combined alpha/beta blockade) and methamphetamine cessation support.'
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

export function formatCardiologySbarText(state = cardiologyState, langOverride = getLang()) {
  const lang = langOverride || getLang();
  const isEs = lang === 'es';
  const evalResult = evaluateCardiologyRisk(state, lang);

  const lines = [];
  lines.push(
    isEs
      ? '=== ENTREGA CLÍNICA SBAR: CARDIOLOGÍA DE URGENCIA, ARRITMIAS Y TOXICOLOGÍA CARDIOVASCULAR (CERO-PII) ==='
      : '=== SBAR CLINICAL HANDOFF: EMERGENCY CARDIOLOGY, ARRHYTHMIAS & CARDIOVASCULAR TOXICOLOGY (ZERO-PII) ==='
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
        ? 'ALERTAS ROJAS CARDIOVASCULARES Y DE ECG ACTIVAS:'
        : 'ACTIVE CARDIOVASCULAR & ECG RED-FLAG ALERTS:'
    );
    for (const rf of evalResult.redFlags) {
      lines.push(`  [!] ${rf}`);
    }
  }

  lines.push('');
  lines.push(
    isEs
      ? 'EVALUACIÓN, ECG Y ECOCARDIOGRAFÍA:'
      : 'ASSESSMENT, ECG & ECHOCARDIOGRAPHY WORKUP:'
  );
  for (const d of evalResult.diagnostics) {
    lines.push(`  * ${d}`);
  }

  lines.push('');
  lines.push(
    isEs
      ? 'RECOMENDACIÓN Y PROTOCOLO CARDIOVASCULAR AGUDO:'
      : 'RECOMMENDATION & ACUTE CARDIOVASCULAR PROTOCOL:'
  );
  for (const m of evalResult.management) {
    lines.push(`  * ${m}`);
  }

  lines.push('');
  lines.push(
    isEs
      ? 'REDUCCIÓN DE DAÑOS CARDIOVASCULARES Y SEGURIDAD DE TMO:'
      : 'CARDIOVASCULAR HARM REDUCTION & MOUD SAFETY:'
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

export function cardiologyCareView() {
  const lang = getLang();
  const isEs = lang === 'es';

  const root = el('section', {
    className: 'view-section cardiology-care-view',
    attrs: {
      'aria-labelledby': 'cardiology-care-heading',
      'data-view': 'cardiology-care'
    }
  });

  const header = el('header', { className: 'view-header cardiology-header' });
  const kicker = el(
    'span',
    { className: 'section-kicker' },
    t(
      'cardiology.kicker',
      isEs
        ? 'Cardiología de Urgencia, Electrofisiología y Toxicología Cardiovascular'
        : 'Emergency Cardiology, Electrophysiology & Cardiovascular Toxicology'
    )
  );
  const title = h('h1', { id: 'cardiology-care-heading', class: 'view-title' },
    t(
      'cardiology.title',
      isEs
        ? 'Navegador de Emergencias Cardiovasculares, Vasoespasmo por Cocaína, QRS Ancho, Torsades de Pointes y Takotsubo'
        : 'Cardiovascular Emergencies, Stimulant Coronary Vasospasm, Wide-QRS, Torsades de Pointes & Takotsubo Navigator'
    )
  );
  const subtitle = el(
    'p',
    { className: 'view-subtitle' },
    t(
      'cardiology.subtitle',
      isEs
        ? 'Soporte clínico cero-PII en memoria RAM para síndrome coronario por estimulantes (regla alfa sin oposición), bloqueo de canales de sodio (bicarbonato IV), prolongación del QTc/Torsades por metadona/loperamida, disección aórtica, miocardiopatía de Takotsubo por abstinencia y miocardiopatía por metanfetamina.'
        : 'Zero-PII, in-RAM clinical decision support for stimulant acute coronary syndrome (unopposed alpha rule), sodium-channel wide-QRS tachycardia (IV sodium bicarbonate), methadone/loperamide QTc prolongation and Torsades de Pointes, acute aortic dissection, withdrawal Takotsubo cardiomyopathy, and methamphetamine cardiomyopathy.'
    )
  );
  header.append(kicker, title, subtitle);
  root.appendChild(header);

  const safetyBanner = el('div', {
    className: 'clinical-alert-banner cardiology-safety-banner',
    attrs: { role: 'region', 'aria-label': isEs ? 'Seguridad Cardiovascular Crítica' : 'Critical Cardiovascular Safety' }
  });
  safetyBanner.append(
    el(
      'strong',
      {},
      isEs
        ? 'Reglas Cardinales de Supervivencia Cardiovascular: '
        : 'Cardinal Cardiovascular Survival Rules: '
    ),
    el(
      'span',
      {},
      isEs
        ? '(1) En dolor torácico por cocaína/metanfetamina, usar Benzodiazepinas IV + Nitroglicerina (EVITAR betabloqueadores puros); (2) En QRS > 100–120 ms, administrar Bicarbonato de Sodio al 8.4% IV en bolos; (3) En Torsades de Pointes / QTc > 500 ms, dar Magnesio 2 g IV + K+ > 4.5 mEq/L y preservar el TMO.'
        : '(1) In acute cocaine/methamphetamine chest pain, give IV Benzodiazepines + Nitroglycerin (AVOID pure beta-blockers); (2) In QRS > 100–120 ms, administer 8.4% IV Sodium Bicarbonate boluses; (3) In Torsades de Pointes / QTc > 500 ms, give 2 g IV Magnesium + K+ > 4.5 mEq/L while preserving MOUD.'
    )
  );
  root.appendChild(safetyBanner);

  const selectorSection = el('section', {
    className: 'cardiology-selector-section card',
    attrs: { 'aria-labelledby': 'cardiology-selector-heading' }
  });
  selectorSection.appendChild(
    el(
      'h2',
      { id: 'cardiology-selector-heading', className: 'card-title' },
      t(
        'cardiology.selectorTitle',
        isEs
          ? '1. Seleccione el Síndrome Cardiovascular o Electrofisiológico Primario'
          : '1. Select Primary Cardiovascular or Electrophysiologic Syndrome'
      )
    )
  );

  const syndromeGrid = el('div', {
    className: 'cardiology-syndrome-grid',
    attrs: { role: 'group', 'aria-label': isEs ? 'Selector de síndrome cardiológico' : 'Cardiology syndrome selector' }
  });

  const detailContainer = el('div', {
    className: 'cardiology-detail-container',
    attrs: { 'aria-live': 'polite' }
  });

  const sbarPre = el('pre', {
    className: 'sbar-output-pre cardiology-sbar-pre',
    attrs: { tabindex: '0', 'aria-label': isEs ? 'Entrega clínica SBAR de cardiología' : 'Cardiology SBAR clinical handoff' }
  });

  function renderSyndromeButtons() {
    clear(syndromeGrid);
    const current = getCardiologyState();
    for (const profile of Object.values(CARDIOLOGY_SYNDROME_PROFILES)) {
      const isSelected = current.selectedSyndrome === profile.id;
      const btn = makeButton(
        isEs ? profile.titleEs : profile.titleEn,
        () => {
          setCardiologyState({ selectedSyndrome: profile.id });
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
    className: 'cardiology-flags-section card',
    attrs: { 'aria-labelledby': 'cardiology-flags-heading' }
  });
  flagsSection.appendChild(
    el(
      'h2',
      { id: 'cardiology-flags-heading', className: 'card-title' },
      t(
        'cardiology.flagsTitle',
        isEs
          ? '2. Verificador de Signos de Alarma de ECG, Arritmias e Inestabilidad Hemodinámica'
          : '2. ECG, Arrhythmia & Hemodynamic Red-Flag Triage Checker'
      )
    )
  );

  const flagDefinitions = [
    {
      key: 'stimulantChestPainHypertensionAgitation',
      labelEn:
        'Acute chest pain, diaphoresis, tachycardia, and hypertension after Cocaine, Crack, or Methamphetamine use (Coronary Vasospasm / ACS)',
      labelEs:
        'Dolor torácico agudo, diaforesis, taquicardia e hipertensión tras uso de Cocaína, Crack o Metanfetamina (Vasoespasmo Coronario / SCA)'
    },
    {
      key: 'wideQrsOver100msCocaineTcaLoperamide',
      labelEn:
        'Wide QRS (> 100–120 ms), terminal R in aVR > 3 mm, or wide-complex tachycardia from Cocaine, TCAs, Diphenhydramine, or Loperamide (NaV1.5 Blockade)',
      labelEs:
        'QRS ancho (> 100–120 ms), onda R terminal en aVR > 3 mm o TV de complejo ancho por Cocaína, ATC, Difenhidramina o Loperamida (Bloqueo NaV1.5)'
    },
    {
      key: 'qtcOver500msSyncopeMethadoneLoperamide',
      labelEn:
        'QTc >= 500 ms, syncope, or polymorphic VT (Torsades de Pointes) with Methadone, Loperamide megadosing, Ondansetron, or Antipsychotics',
      labelEs:
        'QTc >= 500 ms, síncope o TV polimórfica (Torsades de Pointes) con Metadona, megadosis de Loperamida, Ondansetrón o Antipsicóticos'
    },
    {
      key: 'tearingBackPainPulseDeficitDissection',
      labelEn:
        'Sudden maximal "ripping/tearing" chest or interscapular back pain with arm BP differential > 20 mmHg or pulse deficit (Acute Aortic Dissection)',
      labelEs:
        'Dolor torácico o interescapular "desgarrante" súbito con diferencia de PA > 20 mmHg entre brazos o déficit de pulso (Disección Aórtica Aguda)'
    },
    {
      key: 'acuteWithdrawalShockApicalBallooning',
      labelEn:
        'Acute pulmonary edema, hypotension, or apical ballooning during precipitated Opioid Withdrawal, Xylazine rebound, or Delirium Tremens (Takotsubo)',
      labelEs:
        'Edema pulmonar agudo, hipotensión o balonamiento apical durante Abstinencia Precipitada de Opioides, rebote de Xilacina o Delirium Tremens (Takotsubo)'
    },
    {
      key: 'chronicMethDyspneaEdemaReducedEf',
      labelEn:
        'Progressive dyspnea, orthopnea, lower-extremity edema, or LVEF < 35% / right heart strain with chronic Methamphetamine use (MACM / Meth-PAH)',
      labelEs:
        'Disnea progresiva, ortopnea, edema de miembros inferiores o FEVI < 35% / sobrecarga derecha con uso crónico de Metanfetamina (MACM / HAP-Met)'
    }
  ];

  const flagsList = el('div', { className: 'cardiology-flags-list' });
  const checkboxRefs = new Map();

  for (const def of flagDefinitions) {
    const row = el('label', { className: 'checkbox-row cardiology-flag-row' });
    const cb = el('input', {
      attrs: {
        type: 'checkbox',
        'data-flag-key': def.key
      }
    });
    cb.checked = Boolean(cardiologyState[def.key]);
    cb.addEventListener('change', () => {
      setCardiologyState({ [def.key]: cb.checked });
      renderDetailAndSbar();
    });
    checkboxRefs.set(def.key, cb);
    row.append(cb, el('span', {}, isEs ? def.labelEs : def.labelEn));
    flagsList.appendChild(row);
  }
  flagsSection.appendChild(flagsList);

  function renderDetailAndSbar() {
    clear(detailContainer);
    const evalResult = evaluateCardiologyRisk(getCardiologyState());

    const card = el('article', {
      className: `card cardiology-profile-card urgency-${evalResult.urgency.toLowerCase()}`
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
        className: 'cardiology-redflag-box',
        attrs: { role: 'alert' }
      });
      alertBox.appendChild(
        el(
          'h4',
          {},
          isEs
            ? 'Alertas Cardiovasculares y Electrofisiológicas Inmediatas Activadas'
            : 'Immediate Cardiovascular & Electrophysiologic Red-Flag Alerts Activated'
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
      el('h4', {}, isEs ? 'Fisiopatología y Electrofisiología' : 'Pathophysiology & Electrophysiology'),
      el('p', {}, evalResult.pathophysiology)
    );
    card.appendChild(pathoSection);

    const diagSection = el('div', { className: 'profile-subsection' });
    diagSection.appendChild(
      el('h4', {}, isEs ? 'Evaluación de ECG, Biomarcadores y Ecocardiografía' : 'ECG, Biomarker & Echocardiographic Workup')
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
          ? 'Protocolo de Manejo Cardiovascular Agudo y Antídotos'
          : 'Acute Cardiovascular & Antidote Management Protocol'
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
          ? 'Reducción de Daños Cardiovasculares y Preservación del TMO'
          : 'Cardiovascular Harm Reduction & MOUD Preservation'
      ),
      el('p', {}, evalResult.harmReduction)
    );
    card.appendChild(hrSection);

    detailContainer.appendChild(card);
    sbarPre.textContent = formatCardiologySbarText(getCardiologyState());
  }

  selectorSection.appendChild(syndromeGrid);
  root.appendChild(selectorSection);
  root.appendChild(flagsSection);
  root.appendChild(detailContainer);

  const rulesSection = el('section', {
    className: 'cardiology-rules-section card',
    attrs: { 'aria-labelledby': 'cardiology-rules-heading' }
  });
  rulesSection.appendChild(
    el(
      'h2',
      { id: 'cardiology-rules-heading', className: 'card-title' },
      t(
        'cardiology.rulesTitle',
        isEs
          ? '3. Reglas Cardinales de Cardiología Aguda y Toxicología'
          : '3. Cardinal Rules of Acute Cardiology & Cardiovascular Toxicology'
      )
    )
  );
  const rulesGrid = el('div', { className: 'cardiology-rules-grid' });
  for (const rule of CARDIOLOGY_HARM_REDUCTION_RULES) {
    const rCard = el('article', { className: 'cardiology-rule-card' });
    rCard.append(
      el('h3', { className: 'rule-title' }, isEs ? rule.titleEs : rule.titleEn),
      el('p', { className: 'rule-body' }, isEs ? rule.bodyEs : rule.bodyEn)
    );
    rulesGrid.appendChild(rCard);
  }
  rulesSection.appendChild(rulesGrid);
  root.appendChild(rulesSection);

  const sbarSection = el('section', {
    className: 'cardiology-sbar-section card',
    attrs: { 'aria-labelledby': 'cardiology-sbar-heading' }
  });
  sbarSection.appendChild(
    el(
      'h2',
      { id: 'cardiology-sbar-heading', className: 'card-title' },
      t(
        'cardiology.sbarTitle',
        isEs
          ? '4. Generador de Entrega Clínica SBAR (Cero-PII en RAM)'
          : '4. Zero-PII SBAR Clinical Handoff Generator (In-RAM)'
      )
    )
  );

  const notesLabel = el(
    'label',
    { className: 'field-label', attrs: { for: 'cardiology-clinical-notes' } },
    isEs
      ? 'Notas clínicas contextuales (solo en RAM, sin datos identificables):'
      : 'Contextual clinical notes (in-RAM only, zero identifiable data):'
  );
  const notesInput = el('textarea', {
    id: 'cardiology-clinical-notes',
    className: 'form-textarea cardiology-notes-input',
    attrs: {
      rows: '2',
      placeholder: isEs
        ? 'Ej. PA 195/115, FC 128 lpm, QRS 134 ms o QTc 535 ms, K+ 3.4 mEq/L...'
        : 'e.g., BP 195/115, HR 128 bpm, QRS 134 ms or QTc 535 ms, K+ 3.4 mEq/L...'
    }
  });
  notesInput.value = cardiologyState.clinicalNotes;
  notesInput.addEventListener('input', () => {
    setCardiologyState({ clinicalNotes: notesInput.value });
    sbarPre.textContent = formatCardiologySbarText(getCardiologyState());
  });

  const copyStatus = el('span', {
    className: 'copy-status-msg',
    attrs: { role: 'status', 'aria-live': 'polite' }
  });

  const copyBtn = makeButton(
    isEs ? 'Copiar SBAR al Portapapeles' : 'Copy SBAR to Clipboard',
    async () => {
      const txt = formatCardiologySbarText(getCardiologyState());
      const ok = await copyText(txt, {
        trigger: copyBtn,
        copiedLabel: isEs ? '¡Copiado!' : 'Copied!',
        failedLabel: isEs ? 'No se pudo copiar — seleccione el texto manualmente' : 'Copy failed — select text manually',
      });
      copyStatus.textContent = ok
        ? (isEs ? '¡Copiado al portapapeles!' : 'Copied to clipboard!')
        : (isEs ? 'No se pudo acceder al portapapeles. Copie el texto manualmente.' : 'Could not access clipboard. Select the text to copy manually.');
    },
    { className: 'button primary copy-sbar-btn' }
  );

  const resetBtn = makeButton(
    isEs ? 'Reiniciar Formulario (RAM)' : 'Reset Triage State (RAM)',
    () => {
      resetCardiologyState();
      notesInput.value = '';
      copyStatus.textContent = '';
      for (const [k, cb] of checkboxRefs.entries()) {
        cb.checked = Boolean(cardiologyState[k]);
      }
      renderSyndromeButtons();
      renderDetailAndSbar();
    },
    { className: 'button secondary reset-cardiology-btn' }
  );

  const actionsRow = el('div', { className: 'sbar-actions-row' });
  actionsRow.append(copyBtn, resetBtn, copyStatus);

  sbarSection.append(notesLabel, notesInput, actionsRow, sbarPre);
  root.appendChild(sbarSection);

  const linksSection = el('nav', {
    className: 'cardiology-links-section card',
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
      isEs ? 'Endocarditis Infecciosa y Protocolo POET (#/endocarditis-care)' : 'Infective Endocarditis & POET (#/endocarditis-care)',
      '#/endocarditis-care',
      { className: 'button secondary' }
    ),
    makeLinkButton(
      isEs ? 'Atención a Estimulantes (#/stimulant-care)' : 'Stimulant Care (#/stimulant-care)',
      '#/stimulant-care',
      { className: 'button secondary' }
    ),
    makeLinkButton(
      isEs ? 'Acceso a Metadona y Seguridad QTc (#/methadone-access)' : 'Methadone Access & QTc Safety (#/methadone-access)',
      '#/methadone-access',
      { className: 'button secondary' }
    ),
    makeLinkButton(
      isEs ? 'Oncología, Cuidados Paliativos y Drepanocitosis (#/oncology-palliative)' : 'Oncology, Palliative Care & Sickle Cell (#/oncology-palliative)',
      '#/oncology-palliative',
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
