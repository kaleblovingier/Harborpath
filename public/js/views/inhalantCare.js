// public/js/views/inhalantCare.js
// HarborPath - Inhalant, Solvent & Nitrous Oxide Harm Reduction, Neurotoxicity & Volatile Substance Triage
// Clinical Consensus: American College of Medical Toxicology (ACMT) Volatile Substance Guidance,
// UK National Poisons Information Service (NPIS) Nitrous Oxide Neuropathy Guidelines,
// Association of Anaesthetists Safety Guidelines on Recreational Nitrous Oxide & Subacute Combined Degeneration,
// CDC Clinical Guidance on Inhalant-Induced Sudden Sniffing Death Syndrome (SSDS) & Alkyl Nitrite Methemoglobinemia.
// Privacy Invariant: 100% ephemeral in-RAM state, zero device storage, zero PII.

import { h, clear, icon } from '../dom.js';
import { t } from '../i18n.js';

// ============================================================================
// CLINICAL TAXONOMY: SUBSTANCE PHARMACOLOGY & TOXICODYNAMICS
// ============================================================================

export const INHALANT_COMPOUND_PROFILES = Object.freeze({
  nitrousOxide: Object.freeze({
    id: 'nitrous_oxide',
    nameEn: 'Nitrous Oxide (N₂O / "Whippets", Tanks, Cylinders, "Galaxy Gas")',
    nameEs: 'Óxido Nitroso (N₂O / «Whippets», Tanques, Cilindros, «Galaxy Gas»)',
    pharmacologyEn: 'NMDA receptor antagonist, weak GABA-A modulator, and endogenous opioid releaser. Non-competitive inhibitor of cobalamin (Vitamin B12): irreversibly oxidizes the active cobalt core from Co+ to inactive Co3+, permanently inactivating Methionine Synthase. This halts the conversion of homocysteine to methionine, disrupting myelin basic protein synthesis and DNA methylation.',
    pharmacologyEs: 'Antagonista del receptor NMDA y modulador de GABA-A. Oxida de forma irreversible el núcleo de cobalto de la Vitamina B12 (de Co+ a Co3+ inactivo), destruyendo la enzima metionina sintasa. Esto detiene la síntesis de mielina y provoca desmielinización progresiva de la médula espinal.',
    acuteHazardsEn: 'Subacute Combined Degeneration (SCD) of the spinal cord, peripheral sensorimotor neuropathy, sensory ataxia, loss of proprioception, foot drop, cryo-thermal freeze burns to lips and vocal cords from pressurized gas, and pulmonary barotrauma / pneumothorax.',
    acuteHazardsEs: 'Degeneración Combinada Subaguda (DCS) de la médula espinal, neuropatía periférica, ataxia sensitiva, pérdida de propiocepción, quemaduras por congelación criogénica en labios y laringe, y barotrauma / neumotórax por gas presurizado.',
    diagnosticParadoxEn: 'CRITICAL LAB TRAP: Standard serum Vitamin B12 levels are frequently NORMAL or falsely elevated because standard immunoassays detect inactive oxidized cobalamin. Diagnosis requires measuring serum Methylmalonic Acid (MMA) and Homocysteine, which will be markedly elevated.',
    diagnosticParadoxEs: 'TRAMPA DIAGNÓSTICA CRÍTICA: Los niveles séricos estándar de Vitamina B12 suelen ser NORMALES o falsamente altos porque los ensayos detectan la B12 oxidada e inactiva. El diagnóstico exige medir Ácido Metilmalónico (MMA) y Homocisteína séricos, que estarán muy elevados.',
    antidoteEn: 'High-dose intramuscular Hydroxocobalamin (1,000 mcg IM daily or alternate days for 1–2 weeks, followed by weekly maintenance) + absolute cessation of N₂O. Oral cyanocobalamin is clinically ineffective during active inactivation.',
    antidoteEs: 'Hidroxocobalamina intramuscular a altas dosis (1.000 mcg IM diaria o en días alternos durante 1-2 semanas) y cese absoluto del N₂O. La cianocobalamina oral es ineficaz debido a la inactivación de la enzima.',
  }),

  volatileHydrocarbons: Object.freeze({
    id: 'volatile_hydrocarbons',
    nameEn: 'Volatile Hydrocarbons, Aerosols & Dusters (Butane, Propane, Difluoroethane [DFE], Toluene)',
    nameEs: 'Hidrocarburos Volátiles, Aerosoles y Dusters (Butano, Difluoroetano [DFE], Tolueno)',
    pharmacologyEn: 'Lipophilic solvents rapidly cross the blood-brain barrier causing central nervous system depression, membrane fluidity disruption, and GABA-A enhancement. Crucially, halogenated hydrocarbons and butane sensitize myocardial beta-adrenergic receptors to endogenous catecholamines (epinephrine).',
    pharmacologyEs: 'Solventes altamente lipofílicos que deprimen el SNC. Los hidrocarburos halogenados y el butano sensibilizan los receptores beta-adrenérgicos del miocardio a las catecolaminas endógenas (adrenalina).',
    acuteHazardsEn: 'SUDDEN SNIFFING DEATH SYNDROME (SSDS): An unexpected fright, sudden exercise, or police chase triggers an endogenous surge of epinephrine, resulting in instantaneous fatal Ventricular Fibrillation (V-Fib) or asystole in young, healthy individuals. Toluene causes severe Distal Renal Tubular Acidosis (Type 1 RTA) with profound hypokalemia and flaccid quadriparesis.',
    acuteHazardsEs: 'SÍNDROME DE MUERTE SÚBITA POR INHALACIÓN (SSDS): Un susto repentino, sobresalto o esfuerzo físico desencadena una descarga de adrenalina que provoca fibrilación ventricular (FV) mortal instantánea. El tolueno produce acidosis tubular renal distal grave (ATR Tipo 1) con hipopotasemia extrema y parálisis flácida.',
    diagnosticParadoxEn: 'ACLS RESUSCITATION MODIFICATION: Epinephrine and isoproterenol are RELATIVELY CONTRAINDICATED in cardiac arrest caused by volatile hydrocarbon inhalation because exogenous catecholamines exacerbate myocardial sensitization and refractory ventricular fibrillation. Short-acting beta-blockers (esmolol) or lidocaine are preferred.',
    diagnosticParadoxEs: 'MODIFICACIÓN DE REANIMACIÓN ACLS: La adrenalina e isoproterenol están RELATIVAMENTE CONTRAINDICADOS en paradas por hidrocarburos volátiles, ya que empeoran la sensibilización miocárdica y la FV refractaria. Se prefieren betabloqueantes de acción ultracorta (esmolol) o lidocaína.',
    antidoteEn: 'Supportive airway control, 100% high-flow oxygen, aggressive electrolyte repletion (potassium and bicarbonate for toluene RTA), avoidance of catecholamine stress, and external defibrillation.',
    antidoteEs: 'Control de vía aérea, oxígeno al 100%, reposición agresiva de potasio y bicarbonato en ATR por tolueno, evitar sustos o catecolaminas y desfibrilación precoz.',
  }),

  alkylNitrites: Object.freeze({
    id: 'alkyl_nitrites',
    nameEn: 'Alkyl Nitrites ("Poppers" / Isobutyl, Isopentyl, Amyl Nitrite)',
    nameEs: 'Nitritos de Alquilo («Poppers» / Nitrito de Isobutilo, Isopentilo, Amilo)',
    pharmacologyEn: 'Release exogenous nitric oxide (NO) in vascular smooth muscle, stimulating guanylyl cyclase to increase cyclic GMP (cGMP), producing rapid, profound peripheral vasodilation, smooth muscle relaxation, and warm cutaneous flushing. In erythrocytes, nitrites oxidize ferrous iron (Fe²⁺) in hemoglobin to ferric iron (Fe³⁺), forming Methemoglobin.',
    pharmacologyEs: 'Liberan óxido nítrico (NO) produciendo relajación del músculo liso vascular mediante cGMP. En los glóbulos rojos, los nitritos oxidan el hierro ferroso (Fe²⁺) de la hemoglobina a hierro férrico (Fe³⁺), produciendo Metahemoglobina, incapaz de transportar oxígeno.',
    acuteHazardsEn: 'METHEMOGLOBINEMIA: Functional tissue hypoxia; blood turns dark "chocolate brown" and does not redden when exposed to room air. Pulse oximetry reads a false plateau of ~85% regardless of true oxygenation. POPPER MACULOPATHY: Chemical foveal phototoxicity causing central scotoma and permanent vision loss. LETHAL PDE-5 SYNERGY: Co-use with sildenafil (Viagra) or tadalafil (Cialis) causes catastrophic, uncorrectable vasodilatory shock and death.',
    acuteHazardsEs: 'METAHEMOGLOBINEMIA: Hipoxia tisular grave; la sangre adquiere un color «marrón chocolate» oscuro. El pulsioxímetro se clava en ~85% sin reflejar la hipoxia real. MACULOPATÍA POR POPPERS: Daño foveal que provoca pérdida permanente de visión central. SINERGIA MORTAL CON PDE-5: Combinado con Viagra/Cialis provoca shock vasodilatador fulminante.',
    diagnosticParadoxEn: 'PULSE OXIMETRY ARTIFACT: Pulse oximeters measure absorbance at 660 nm and 940 nm. Methemoglobin absorbs equally at both wavelengths, forcing the calculated SpO₂ ratio to 1.0, which corresponds to an artificial plateau of approximately 85%. Arterial Blood Gas (ABG) with Co-Oximetry is mandatory.',
    diagnosticParadoxEs: 'ARTEFACTO DE PULSIOXIMETRÍA: El pulsioxímetro se bloquea en una lectura fija de ~85% debido a la absorción espectral de la metahemoglobina. Es imprescindible realizar una gasometría arterial con Co-Oximetría para medir la fracción real de metahemoglobina.',
    antidoteEn: 'Methylene Blue (1 to 2 mg/kg IV over 5 minutes; reduces Fe³⁺ back to Fe²⁺ via NADPH-methemoglobin reductase). STRICT CONTRAINDICATION: Methylene Blue is contraindicated in Glucose-6-Phosphate Dehydrogenase (G6PD) deficiency due to risk of fatal acute hemolytic anemia (use high-dose IV Vitamin C / ascorbic acid instead).',
    antidoteEs: 'Azul de Metileno (1 a 2 mg/kg IV en 5 min). CONTRAINDICACIÓN ESTRICTA: El azul de metileno está contraindicado en déficit de G6PD por riesgo de hemólisis mortal (en su lugar, usar ácido ascórbico / vitamina C IV a altas dosis).',
  }),
});

// ============================================================================
// CLINICAL DIFFERENTIAL ENGINES & TOXICOLOGICAL CONDITIONS
// ============================================================================

export const INHALANT_CLINICAL_DIFFERENTIALS = Object.freeze({
  scd: Object.freeze({
    id: 'scd',
    titleEn: 'Subacute Combined Degeneration of Spinal Cord & N₂O Neuropathy',
    titleEs: 'Degeneración Combinada Subaguda y Neuropatía por N₂O',
    severity: 'urgent_neurology',
    classicTriadEn: 'Bilateral "glove-and-stocking" paresthesias (pins and needles), sensory ataxia (unsteady stumbling gait), and positive Lhermitte’s sign (electric shock shooting down spine upon neck flexion).',
    classicTriadEs: 'Parestesias bilaterales en «guante y calcetín», marcha atáxica inestable y signo de Lhermitte positivo (descarga eléctrica por la columna al flexionar el cuello).',
    underlyingPathologyEn: 'Myelin vacuolation and axonal loss in the posterior (dorsal) and lateral columns of the cervical and thoracic spinal cord due to B12 methionine synthase shutdown.',
    underlyingPathologyEs: 'Vacuolización de mielina y pérdida axonal en cordones posteriores y laterales de la médula espinal por bloqueo de metionina sintasa dependiente de B12.',
    actionEn: 'Immediate cessation of all N₂O use. High-dose Intramuscular Hydroxocobalamin 1,000 mcg IM daily for 7 days, then weekly. Urgent neurology consultation and spinal MRI. Warning: Do NOT give oral cyanocobalamin or high-dose folic acid alone (folic acid alone can precipitate or worsen subacute combined degeneration).',
    actionEs: 'Cese inmediato de N₂O. Hidroxocobalamina intramuscular 1.000 mcg IM diaria durante 7 días, luego semanal. RMN medular y consulta urgente de neurología. NUNCA administrar ácido fólico solo sin B12 (empeora la degeneración medular).',
  }),

  ssds: Object.freeze({
    id: 'ssds',
    titleEn: 'Sudden Sniffing Death Syndrome (SSDS) & Catecholamine Sensitization',
    titleEs: 'Síndrome de Muerte Súbita por Inhalación (SSDS) y Sensibilización Miocárdica',
    severity: 'emergency_911',
    classicTriadEn: 'Sudden collapse, loss of consciousness, pulseless electrical activity (PEA) or Ventricular Fibrillation immediately following inhalant use (butane, computer dusters, fluorocarbons), especially during panic, agitation, or physical exertion.',
    classicTriadEs: 'Colapso súbito, pérdida de consciencia y fibrilación ventricular o parada cardíaca inmediata tras inhalar (butano, dusters, propelentes), especialmente ante sustos, agitación o esfuerzo.',
    underlyingPathologyEn: 'Halogenated hydrocarbons alter myocardial pacemaker cell refractory periods and sensitize myocytes to endogenous epinephrine, converting physiological sympathetic activation into malignant ventricular tachyarrhythmias.',
    underlyingPathologyEs: 'Los hidrocarburos halogenados sensibilizan las células miocárdicas a la adrenalina endógena, transformando una respuesta simpática normal en arritmias ventriculares letales.',
    actionEn: 'CRITICAL FIRST RESPONDER DIRECTIVE: NEVER chase, yell at, startle, or physically restrain someone actively inhaling hydrocarbons. Approach calmly in a quiet environment. If collapsed: Call 911 immediately, start high-quality CPR, deploy AED, and alert paramedics to avoid epinephrine in resuscitation.',
    actionEs: 'REGLA CRÍTICA DE PRIMEROS AUXILIOS: NUNCA persiga, grite, asuste ni reduzca violentamente a quien esté inhalando hidrocarburos. Acérquese con calma. Si colapsa: llame al 911, inicie RCP, use desfibrilador y avise al personal médico de evitar la adrenalina.',
  }),

  methemoglobinemia: Object.freeze({
    id: 'methemoglobinemia',
    titleEn: 'Acquired Methemoglobinemia & "Chocolate Brown" Blood Syndrome',
    titleEs: 'Metahemoglobinemia Adquirida y Sangre «Marrón Chocolate»',
    severity: 'emergency_hospital',
    classicTriadEn: 'Cyanosis (slate-gray or blue skin, lips, nailbeds) refractory to 100% supplemental oxygen, persistent pulse oximeter saturation reading of ~85%, and blood that appears dark chocolate brown upon venipuncture and fails to turn scarlet when exposed to air.',
    classicTriadEs: 'Cianosis (piel y labios azulados o grisáceos) que no mejora con oxígeno al 100%, pulsioxímetro clavado en ~85% y sangre de color marrón chocolate que no enrojece al aire.',
    underlyingPathologyEn: 'Oxidation of hemoglobin iron to Fe³⁺ prevents oxygen unloading to tissues and left-shifts the oxygen-dissociation curve, causing profound cellular hypoxia and metabolic lactic acidosis.',
    underlyingPathologyEs: 'La oxidación del hierro a Fe³⁺ impide la cesión de oxígeno a los tejidos, provocando hipoxia celular profunda y acidosis láctica.',
    actionEn: 'Emergency Department transfer. Perform arterial blood gas with Co-Oximetry (methemoglobin fraction > 20% or symptoms require treatment). Administer Methylene Blue 1–2 mg/kg IV over 5 minutes. If G6PD deficiency is present, administer high-dose IV ascorbic acid (Vitamin C).',
    actionEs: 'Traslado urgente a urgencias. Gasometría con co-oximetría obligatoria. Si la fracción de MetHb es > 20% o hay síntomas: Azul de Metileno 1-2 mg/kg IV. Si hay déficit de G6PD, administrar ácido ascórbico IV.',
  }),

  distalRta: Object.freeze({
    id: 'distal_rta',
    titleEn: 'Toluene-Induced Distal Renal Tubular Acidosis (Type 1 RTA) & Quadriparesis',
    titleEs: 'Acidosis Tubular Renal Distal (Tipo 1) y Cuadriparesia por Tolueno',
    severity: 'emergency_hospital',
    classicTriadEn: 'Profound muscle weakness progressing to flaccid quadriparesis (inability to lift arms or walk), severe hypokalemia (serum K⁺ often < 2.0 mEq/L), and non-anion gap metabolic acidosis with paradoxical alkaline urine (pH > 5.5).',
    classicTriadEs: 'Debilidad muscular severa que progresa a parálisis flácida de cuatro extremidades, hipopotasemia extrema (K⁺ < 2.0 mEq/L) y acidosis metabólica con orina alcalina paradójica (pH > 5.5).',
    underlyingPathologyEn: 'Toluene metabolites (hippurate and benzoic acid) cause distal renal tubular hydrogen-ion secretion failure and urinary potassium wasting, triggering life-threatening hypokalemia, rhabdomyolysis, and respiratory failure.',
    underlyingPathologyEs: 'Los metabolitos del tolueno destruyen la excreción tubular de protones y provocan fuga renal masiva de potasio, desencadenando parálisis hipopotasémica y rabdomiólisis.',
    actionEn: 'Emergency hospital admission. Continuous cardiac telemetry (risk of U-waves and torsades de pointes). Aggressive intravenous potassium chloride repletion alongside potassium-sparing alkalinization (potassium citrate/bicarbonate). Absolute cessation of toluene sniffing.',
    actionEs: 'Ingreso hospitalario urgente con monitorización cardíaca (riesgo de torsades de pointes). Reposición intravenosa urgente de cloruro potásico y bicarbonato. Cese absoluto de inhalación de tolueno.',
  }),

  popperMaculopathy: Object.freeze({
    id: 'popper_maculopathy',
    titleEn: 'Popper-Associated Foveal Phototoxicity & Central Maculopathy',
    titleEs: 'Maculopatía Foveal y Pérdida Visual Central por Poppers',
    severity: 'urgent_ophthalmology',
    classicTriadEn: 'Bilateral central visual blur, central blind spot (scotoma), photopsia (flashing lights), and impaired color vision appearing hours to days after inhaling alkyl nitrites (especially isopropyl or isobutyl nitrite).',
    classicTriadEs: 'Visión borrosa central bilateral, mancha ciega en el centro del campo visual (escotoma), destellos y alteración de los colores tras inhalar poppers.',
    underlyingPathologyEn: 'Nitric oxide free radicals induce selective photodamage and disruption of the foveal photoreceptor outer segment ellipsoid zone, visible on Optical Coherence Tomography (OCT) as a distinctive yellow foveal spot.',
    underlyingPathologyEs: 'Los radicales libres de óxido nítrico causan fototoxicidad selectiva en los fotorreceptores de la fóvea macular, visible en OCT como un punto foveal amarillento.',
    actionEn: 'IMMEDIATE DISCONTINUATION of all alkyl nitrite poppers. Urgent ophthalmology referral for high-resolution spectral-domain OCT. Reassure that partial or complete visual recovery occurs over months if poppers are permanently discontinued.',
    actionEs: 'ABANDONO INMEDIATO de todos los poppers. Consulta oftalmológica urgente para tomografía de coherencia óptica (OCT). La recuperación visual puede ser parcial o completa tras meses de cese estricto.',
  }),

  pde5Synergy: Object.freeze({
    id: 'pde5_synergy',
    titleEn: 'Lethal PDE-5 Inhibitor + Alkyl Nitrite Refractory Vasodilatory Shock',
    titleEs: 'Sinergia Mortal: Inhibidores de PDE-5 + Poppers y Shock Vasodilatador',
    severity: 'emergency_911',
    classicTriadEn: 'Profound hypotension (systolic BP < 70 mmHg), syncope, severe dizziness, chest pain, and warm shock occurring when poppers are inhaled alongside erectile dysfunction medications (sildenafil/Viagra, tadalafil/Cialis, vardenafil/Levitra).',
    classicTriadEs: 'Hipotensión extrema (PAS < 70 mmHg), síncope, mareo intenso, dolor torácico y shock caliente al combinar poppers con fármacos para la erección (Viagra/Cialis/Levitra).',
    underlyingPathologyEn: 'Nitrites donate nitric oxide to generate cGMP, while PDE-5 inhibitors prevent cGMP degradation. Unchecked intracellular cGMP causes catastrophic vascular smooth muscle relaxation and total loss of systemic vascular resistance.',
    underlyingPathologyEs: 'Los nitritos disparan la síntesis de cGMP y los inhibidores de PDE-5 impiden su degradación. La acumulación masiva de cGMP destruye la resistencia vascular periférica provocando colapso circulatorio total.',
    actionEn: 'CALL 911 IMMEDIATELY. Place patient supine with legs elevated (Trendelenburg position). Administer rapid IV crystalloid fluid boluses. Refractory hypotension requires direct-acting alpha-1 agonists (norepinephrine or phenylephrine infusion); nitroglycerin and nitrates are strictly contraindicated.',
    actionEs: 'LLAME AL 911 DE INMEDIATO. Coloque a la persona tumbada con las piernas elevadas. Infusión rápida de sueros intravenosos. Requiere noradrenalina o fenilefrina en UCI; los nitratos están absolutamente prohibidos.',
  }),
});

// ============================================================================
// HARM REDUCTION STANDARDS & SAFER USE DIRECTIVES
// ============================================================================

export const INHALANT_HARM_REDUCTION_RULES = Object.freeze([
  {
    ruleNum: 1,
    titleEn: 'ALWAYS Use Balloons for Nitrous Oxide: Never Inhale from Dispensers or Tanks',
    titleEs: 'Use SIEMPRE Globos para Óxido Nitroso: Nunca Inhale Directo de Tanques',
    detailEn: 'Compressed gas releases at temperatures as low as -40°C to -60°C. Inhaling directly from a culinary dispenser, cracker, or pressurized tank causes instant cryogenic freeze burns and necrosis to lips, tongue, vocal cords, and trachea, alongside barotrauma and tension pneumothorax.',
    detailEs: 'El gas sale a temperaturas de -40°C a -60°C. Inhalar directo de la boquilla o tanque produce congelación criogénica instantánea y necrosis de labios, cuerdas vocales y tráquea, además de neumotórax por presión.',
  },
  {
    ruleNum: 2,
    titleEn: 'NEVER Use Masks, Bags, or Straps Over the Face or Head',
    titleEs: 'NUNCA Use Mascarillas, Bolsas o Ataduras en la Cabeza',
    detailEn: 'Fastening a plastic bag over the head or strapping a breathing mask to inhale gas guarantees hypoxic unconsciousness. Once unconscious, the person cannot remove the mask, resulting in irreversible anoxic brain injury and suffocating death within 3 to 5 minutes.',
    detailEs: 'Ponerse una bolsa en la cabeza o una mascarilla atada provoca pérdida de consciencia anóxica. Al desmayarse, la persona no puede quitársela, muriendo asfixiada por falta de oxígeno en menos de 5 minutos.',
  },
  {
    ruleNum: 3,
    titleEn: 'NEVER Combine Poppers (Alkyl Nitrites) with Erectile Dysfunction Drugs (Viagra/Cialis)',
    titleEs: 'NUNCA Combine Poppers con Fármacos para la Disfunción Eréctil (Viagra/Cialis)',
    detailEn: 'Combining alkyl nitrites with PDE-5 inhibitors (sildenafil, tadalafil, vardenafil) is a lethal pharmacological interaction. It prevents cGMP breakdown, dropping blood pressure to unrecordable levels and causing fatal cardiac arrest and ischemic stroke.',
    detailEs: 'La combinación de poppers con inhibidores de PDE-5 (Viagra, Cialis) es potencialmente mortal. Desencadena un colapso cardiovascular súbito con parada cardíaca o ictus isquémico por caída irreversible de la tensión.',
  },
  {
    ruleNum: 4,
    titleEn: 'NEVER Chase, Startle, or Physically Restrain Someone Inhaling Solvents or Dusters',
    titleEs: 'NUNCA Asuste, Persiga ni Reduzca a Alguien Inhalando Disolventes o Dusters',
    detailEn: 'Hydrocarbon inhalants sensitize heart muscle cells to adrenaline. A sudden adrenaline spike triggered by running away, being startled, or fighting against physical restraints causes instant Ventricular Fibrillation and Sudden Sniffing Death Syndrome (SSDS).',
    detailEs: 'Los disolventes sensibilizan el corazón a la adrenalina. Un susto, una persecución o un forcejeo violento provocan una descarga de adrenalina que desencadena fibrilación ventricular y muerte súbita instantánea.',
  },
  {
    ruleNum: 5,
    titleEn: 'B12 Replacement Protocol: High-Dose Intramuscular Hydroxocobalamin Only',
    titleEs: 'Protocolo de B12: Exclusivamente Hidroxocobalamina Intramuscular a Altas Dosis',
    detailEn: 'Oral vitamin B12 supplements and multivitamins are completely ineffective for reversing nitrous oxide neuropathy. Treatment requires high-dose intramuscular Hydroxocobalamin (1,000 mcg IM) to bypass defective absorption and rebuild myelin.',
    detailEs: 'Los suplementos orales de B12 son ineficaces para revertir la neuropatía por óxido nitroso. Se requiere hidroxocobalamina intramuscular (1.000 mcg IM) para reconstruir la mielina y frenar la parálisis.',
  },
]);

// ============================================================================
// IN-RAM EPHEMERAL STATE MANAGEMENT (ZERO STORAGE PRIVACY)
// ============================================================================

const initialInhalantState = () => ({
  activeTab: 'triage', // 'triage' | 'substances' | 'differentials' | 'harmReduction'
  viewMode: 'community', // 'community' | 'clinical'
  selectedSubstance: 'nitrous_oxide',
  hasNumbnessTinglingAtaxia: false,
  hasCyanosisChocolateBlood: false,
  hasPalpitationsChestPainAgitation: false,
  hasSevereWeaknessParalysis: false,
  hasCentralVisionLossScotoma: false,
  coIngestedPde5Inhibitor: false,
  usingMaskOrBagOverHead: false,
});

let currentInhalantState = initialInhalantState();
const stateSubscribers = new Set();

export function getInhalantState() {
  return { ...currentInhalantState };
}

export function setInhalantState(patch) {
  currentInhalantState = { ...currentInhalantState, ...patch };
  for (const fn of stateSubscribers) {
    try {
      fn(currentInhalantState);
    } catch {
      // ignore subscriber exceptions
    }
  }
}

export function resetInhalantState() {
  currentInhalantState = initialInhalantState();
  for (const fn of stateSubscribers) {
    try {
      fn(currentInhalantState);
    } catch {
      // ignore subscriber exceptions
    }
  }
}

export function subscribeInhalantState(fn) {
  stateSubscribers.add(fn);
  return () => stateSubscribers.delete(fn);
}

// ============================================================================
// CLINICAL EVALUATION ENGINE
// ============================================================================

export function evaluateInhalantRisk(state) {
  const {
    hasNumbnessTinglingAtaxia,
    hasCyanosisChocolateBlood,
    hasPalpitationsChestPainAgitation,
    hasSevereWeaknessParalysis,
    hasCentralVisionLossScotoma,
    coIngestedPde5Inhibitor,
    usingMaskOrBagOverHead,
  } = state;

  // 1. Critical Lethal Interaction: PDE-5 Inhibitor + Poppers
  if (coIngestedPde5Inhibitor) {
    return {
      tier: 'emergency_pde5_shock',
      titleEn: 'CRITICAL CARDIOVASCULAR EMERGENCY: PDE-5 Inhibitor + Alkyl Nitrite Shock',
      titleEs: 'EMERGENCIA CARDIOVASCULAR CRÍTICA: Shock por Inhibidor PDE-5 + Poppers',
      isEmergency: true,
      actionEn: 'CALL 911 IMMEDIATELY. Combining poppers with Viagra, Cialis, or Levitra causes catastrophic, uncontrollable vasodilatory shock and fatal circulatory collapse. Lie the person down with legs elevated (Trendelenburg position). Paramedics must administer aggressive IV fluids and direct alpha-1 vasopressors (norepinephrine). All nitrates are strictly contraindicated.',
      actionEs: 'LLAME AL 911 DE INMEDIATO. Combinar poppers con Viagra o Cialis causa shock vasodilatador fulminante. Tumbe a la persona con las piernas elevadas. Requiere fluidos IV intensivos y vasopresores alfa-1 en UCI.',
      interventionEn: 'Emergency Department resuscitation, invasive arterial line monitoring, central venous access, alpha-1 vasopressor support, trendelenburg positioning.',
      interventionEs: 'Reanimación en urgencias, monitorización arterial invasiva, vasopresores alfa-1 y fluidoterapia.',
    };
  }

  // 2. Critical Hypoxic Asphyxiation Hazard: Mask or Bag Over Head
  if (usingMaskOrBagOverHead) {
    return {
      tier: 'high_hazard_asphyxiation',
      titleEn: 'EXTREME SUFFOCATION HAZARD: Mask or Bag Fastened Over Face',
      titleEs: 'PELIGRO EXTREMO DE ASFIXIA: Mascarilla o Bolsa Sujeta a la Cara',
      isEmergency: true,
      actionEn: 'REMOVE BAG OR MASK IMMEDIATELY. Fastening a bag or mask over the head while inhaling nitrous oxide or solvents causes rapid anoxic loss of consciousness. The unconscious person cannot remove the apparatus, resulting in brain death from suffocation within 3 to 5 minutes. Administer fresh air or 100% oxygen immediately.',
      actionEs: '¡RETIRE LA BOLSA O MASCARILLA DE INMEDIATO! Sujetar una bolsa o máscara provoca desmayo anóxico instantáneo; al perder el conocimiento la persona se asfixia en 3 a 5 minutos. Administre aire fresco u oxígeno.',
      interventionEn: 'Immediate airway clearance, high-flow normobaric oxygen, cervical spine evaluation if fall occurred.',
      interventionEs: 'Retirada de la máscara, oxígeno normobárico a alto flujo y valoración de la vía aérea.',
    };
  }

  // 3. Critical Methemoglobinemia ("Chocolate Blood" & Cyanosis)
  if (hasCyanosisChocolateBlood) {
    return {
      tier: 'emergency_methemoglobinemia',
      titleEn: 'CRITICAL TOXICOLOGICAL EMERGENCY: Suspected Methemoglobinemia',
      titleEs: 'EMERGENCIA TOXICOLÓGICA CRÍTICA: Sospecha de Metahemoglobinemia',
      isEmergency: true,
      actionEn: 'EMERGENCY ROOM TRANSPORT REQUIRED. Cyanosis unresponsive to oxygen, a pulse oximeter stuck at ~85%, and dark chocolate-brown blood indicate severe Methemoglobinemia from alkyl nitrites. Call 911. Hospital treatment requires Co-Oximetry and intravenous Methylene Blue (1–2 mg/kg IV). Warning: screen for G6PD deficiency before Methylene Blue.',
      actionEs: 'TRASLADO URGENTE A URGENCIAS. Cianosis que no cede con oxígeno, pulsioxímetro clavado en ~85% y sangre color marrón chocolate alertan de metahemoglobinemia por poppers. Tratamiento con Azul de Metileno IV (descartar déficit de G6PD).',
      interventionEn: 'Emergency ABG with Co-Oximetry, IV Methylene Blue 1–2 mg/kg over 5 minutes (or IV ascorbic acid if G6PD deficient), continuous cardiac telemetry.',
      interventionEs: 'Gasometría arterial con Co-Oximetría, Azul de Metileno IV y monitorización continua.',
    };
  }

  // 4. Critical Cardiac Sensitization / SSDS Hazard
  if (hasPalpitationsChestPainAgitation) {
    return {
      tier: 'emergency_ssds_cardiac',
      titleEn: 'CARDIAC EMERGENCY ALERT: Suspected Hydrocarbon Myocardial Sensitization / SSDS Risk',
      titleEs: 'ALERTA DE EMERGENCIA CARDÍACA: Sensibilización Miocárdica / Riesgo de Muerte Súbita (SSDS)',
      isEmergency: true,
      actionEn: 'DO NOT SCARE, CHASE, OR AGITATE THE PERSON. Hydrocarbon vapors sensitize the heart to adrenaline; an adrenaline surge can trigger instantaneous fatal Ventricular Fibrillation (Sudden Sniffing Death Syndrome). Keep the environment calm, quiet, and seated. Call 911 for severe chest pain, racing heart, or fainting. Paramedics: avoid epinephrine.',
      actionEs: 'NO ASUSTE, PERSIGA NI FORCEJEE CON LA PERSONA. Los hidrocarburos sensibilizan el miocardio a la adrenalina; una descarga simpática desencadena fibrilación ventricular mortal (SSDS). Mantenga un entorno tranquilo y llame al 911.',
      interventionEn: 'Calm de-escalation, 12-lead ECG, continuous cardiac telemetry, avoidance of exogenous catecholamines, ACLS readiness with defibrillator.',
      interventionEs: 'Desescalada tranquila, ECG de 12 derivaciones, telemetría cardíaca y desfibrilador preparado.',
    };
  }

  // 5. Severe Toluene Hypokalemia & Quadriparesis
  if (hasSevereWeaknessParalysis) {
    return {
      tier: 'emergency_hypokalemic_paralysis',
      titleEn: 'CRITICAL METABOLIC EMERGENCY: Suspected Toluene-Induced Distal RTA & Hypokalemic Quadriparesis',
      titleEs: 'EMERGENCIA METABÓLICA CRÍTICA: Sospecha de Acidosis Tubular Renal y Parálisis Hipopotasémica por Tolueno',
      isEmergency: true,
      actionEn: 'EMERGENCY HOSPITAL TRANSPORT REQUIRED. Rapidly ascending muscle weakness or flaccid paralysis following glue, paint, or solvent sniffing indicates Toluene Distal Renal Tubular Acidosis (Type 1 RTA) with profound hypokalemia (K⁺ < 2.0 mEq/L). Risk of fatal cardiac arrest and respiratory failure. Immediate IV potassium chloride and bicarbonate required.',
      actionEs: 'INGRESO HOSPITALARIO URGENTE. La debilidad o parálisis tras inhalar disolventes/tolueno alerta de acidosis tubular renal con hipopotasemia extrema (K⁺ < 2.0 mEq/L). Riesgo de parada cardíaca; requiere reposición urgente de potasio IV.',
      interventionEn: 'Stat serum electrolytes (K⁺, Mg²⁺, HCO₃⁻), continuous cardiac telemetry for U-waves, aggressive IV KCl infusion, urinary alkalinization.',
      interventionEs: 'Analítica urgente de iones, telemetría para vigilar arritmias por hipopotasemia y cloruro potásico IV.',
    };
  }

  // 6. Subacute Combined Degeneration / Nitrous Neuropathy
  if (hasNumbnessTinglingAtaxia) {
    return {
      tier: 'emergency_scd_neurologic',
      titleEn: 'URGENT NEUROLOGICAL ALERT: Suspected Subacute Combined Degeneration (N₂O Spinal Cord Neuropathy)',
      titleEs: 'ALERTA NEUROLÓGICA URGENTE: Sospecha de Degeneración Combinada Subaguda por Óxido Nitroso',
      isEmergency: true,
      actionEn: 'STOP NITROUS OXIDE IMMEDIATELY. Numbness in hands/feet, pins-and-needles, stumbling balance (ataxia), or electric shocks in the spine (Lhermitte’s sign) indicate spinal cord demyelination from N₂O-induced Vitamin B12 inactivation. Standard B12 blood tests will look deceptively normal; test Methylmalonic Acid (MMA) and Homocysteine. Treatment requires high-dose Intramuscular Hydroxocobalamin (1,000 mcg IM).',
      actionEs: 'DETENGA EL ÓXIDO NITROSO DE INMEDIATO. El entumecimiento, hormigueo, marcha inestable y descargas eléctricas medulares alertan de desmielinización por inactivación de B12. La analítica habitual de B12 suele dar falsos normales; solicite MMA y Homocisteína. Requiere Hidroxocobalamina IM a altas dosis.',
      interventionEn: 'High-dose IM Hydroxocobalamin 1,000 mcg daily x 7 days, serum MMA/homocysteine, urgent neurology consult, cervical/thoracic spinal MRI.',
      interventionEs: 'Hidroxocobalamina intramuscular 1.000 mcg/día x 7 días, niveles de MMA/homocisteína, RMN medular y neurología.',
    };
  }

  // 7. Central Vision Loss / Popper Maculopathy
  if (hasCentralVisionLossScotoma) {
    return {
      tier: 'urgent_popper_maculopathy',
      titleEn: 'URGENT OPHTHALMIC ALERT: Suspected Popper-Induced Foveal Maculopathy',
      titleEs: 'ALERTA OFTALMOLÓGICA URGENTE: Sospecha de Maculopatía Foveal por Poppers',
      isEmergency: false,
      actionEn: 'STOP USING POPPERS IMMEDIATELY. A central blind spot (scotoma) or blurred vision after sniffing alkyl nitrites indicates chemical foveal photoreceptor damage. Continued use causes irreversible blindness. Schedule an urgent ophthalmology evaluation with high-definition Spectral Domain Optical Coherence Tomography (SD-OCT). Vision may gradually improve after permanent cessation.',
      actionEs: 'DEJE DE USAR POPPERS DE INMEDIATO. La visión borrosa central o una mancha ciega (escotoma) alertan de daño foveal por poppers. Su uso continuado causa ceguera irreversible. Requiere evaluación oftalmológica urgente con OCT macular.',
      interventionEn: 'Permanent alkyl nitrite cessation, Spectral Domain OCT macular imaging, visual field testing, retinal specialist evaluation.',
      interventionEs: 'Cese permanente de poppers, OCT macular de alta resolución y revisión por retinólogo.',
    };
  }

  // 8. Standard Inhalant Harm Reduction Guidance
  return {
    tier: 'standard_inhalant_guidance',
    titleEn: 'Standard Inhalant & Nitrous Oxide Harm Reduction Guidance',
    titleEs: 'Pautas Estándar de Reducción de Daños para Inhalantes y Óxido Nitroso',
    isEmergency: false,
    actionEn: 'No acute emergency flags detected. Harm reduction standards: Always dispense N₂O into balloons (never inhale directly from tanks to prevent freezing vocal cords), never fasten masks or bags over the face, never combine poppers with erectile dysfunction meds (Viagra/Cialis), and avoid hydrocarbon solvents which carry Sudden Sniffing Death risks.',
    actionEs: 'No se detectan alertas críticas agudas. Pautas de reducción de daños: use siempre globos para N₂O (nunca inhale de tanques directo), jamás use máscaras ni bolsas atadas, nunca mezcle poppers con Viagra/Cialis y evite solventes que conllevan riesgo de muerte súbita.',
    interventionEn: 'Harm reduction education, provision of balloon supplies, vitamin B12 education, non-judgmental community outreach.',
    interventionEs: 'Educación en reducción de daños, suministro de globos, información sobre B12 y apoyo comunitario no punitivo.',
  };
}

// ============================================================================
// ZERO-PII SBAR HANDOFF NOTE GENERATOR
// ============================================================================

export function buildInhalantSbarText(state, evaluation, lang = 'en') {
  const isEs = lang === 'es';
  const now = new Date().toISOString();
  const sub = INHALANT_COMPOUND_PROFILES[state.selectedSubstance] || INHALANT_COMPOUND_PROFILES.nitrousOxide;

  if (isEs) {
    return [
      '====================================================================',
      'INFORME CLÍNICO SBAR: EVALUACIÓN DE INHALANTES, N₂O Y TOXICOLOGÍA',
      'Plataforma Clínica HarborPath - Estándar Estricto Cero PII',
      `Fecha y Hora: ${now}`,
      '====================================================================',
      '',
      'S (SITUACIÓN):',
      `Evaluación toxicológica/neurológica por uso de: ${sub.nameEs}.`,
      `Estado clínico evaluado: ${evaluation.titleEs}.`,
      `Nivel de urgencia médica: ${evaluation.isEmergency ? 'EMERGENCIA MÉDICA / TOXICOLÓGICA' : 'REDUCCIÓN DE DAÑOS Y PREVENCIÓN'}.`,
      '',
      'B (ANTECEDENTES / FACTORES TOXICOLÓGICOS):',
      `- Sustancia reportada: ${sub.nameEs}.`,
      `- Entumecimiento, ataxia o Lhermitte (Sospecha DCS por N₂O): ${state.hasNumbnessTinglingAtaxia ? 'SÍ (EVALUAR DCS / B12)' : 'No'}.`,
      `- Cianosis o sangre marrón (Sospecha Metahemoglobinemia): ${state.hasCyanosisChocolateBlood ? 'SÍ (GASOMETRÍA CON CO-OXIMETRÍA)' : 'No'}.`,
      `- Palpitaciones o dolor torácico (Sensibilización / SSDS): ${state.hasPalpitationsChestPainAgitation ? 'SÍ (EVITAR ADRENALINA / TELEMETRÍA)' : 'No'}.`,
      `- Parálisis flácida o debilidad extrema (ATR por Tolueno): ${state.hasSevereWeaknessParalysis ? 'SÍ (REPOSICIÓN DE POTASIO URGENTE)' : 'No'}.`,
      `- Mancha ciega o pérdida visual central (Maculopatía por Poppers): ${state.hasCentralVisionLossScotoma ? 'SÍ (OCT MACULAR URGENTE)' : 'No'}.`,
      `- Co-ingesta con Viagra/Cialis (Shock vasodilatador mortal): ${state.coIngestedPde5Inhibitor ? 'SÍ (SHOCK GRAVE POR PDE-5)' : 'No'}.`,
      `- Uso de bolsa o máscara atada a la cabeza (Riesgo de asfixia): ${state.usingMaskOrBagOverHead ? 'SÍ (RETIRAR INMEDIATAMENTE)' : 'No'}.`,
      '',
      'A (EVALUACIÓN CLÍNICA):',
      `- Análisis: ${evaluation.actionEs}`,
      `- Intervención propuesta: ${evaluation.interventionEs}`,
      '',
      'R (RECOMENDACIONES Y MANEJO TOXICOLÓGICO):',
      '1. En sospecha de neuropatía por N₂O: No confiar en niveles séricos de B12 normales; solicitar MMA/Homocisteína e iniciar Hidroxocobalamina 1.000 mcg IM.',
      '2. En metahemoglobinemia: Administrar Azul de Metileno 1-2 mg/kg IV en 5 min (descartar déficit de G6PD previamente).',
      '3. En arritmias por hidrocarburos (SSDS): Evitar adrenalina o estimulantes simpáticos; usar betabloqueantes o lidocaína.',
      '4. Educar en el uso exclusivo de globos para N₂O para prevenir quemaduras criogénicas y barotrauma.',
      '====================================================================',
    ].join('\n');
  }

  return [
    '====================================================================',
    'INHALANT, SOLVENT & NITROUS OXIDE CLINICAL SBAR HANDOFF NOTE',
    'HarborPath Clinical CDS Platform - Strict Zero-PII Standard',
    `Timestamp: ${now}`,
    '====================================================================',
    '',
    'S (SITUATION):',
    `Clinical/toxicological presentation regarding use of: ${sub.nameEn}.`,
    `Assessed Presentation: ${evaluation.titleEn}.`,
    `Safety Urgency: ${evaluation.isEmergency ? 'MEDICAL / TOXICOLOGICAL EMERGENCY' : 'HARM REDUCTION & MONITORING'}.`,
    '',
    'B (BACKGROUND / TOXICOLOGICAL RISK FACTORS):',
    `- Reported Substance: ${sub.nameEn}.`,
    `- Numbness, ataxia, or Lhermitte’s sign (N₂O SCD alert): ${state.hasNumbnessTinglingAtaxia ? 'YES (EVALUATE SCD / B12)' : 'No'}.`,
    `- Cyanosis or chocolate-brown blood (Methemoglobinemia): ${state.hasCyanosisChocolateBlood ? 'YES (STAT CO-OXIMETRY REQUIRED)' : 'No'}.`,
    `- Palpitations, chest pain, or agitation (SSDS hazard): ${state.hasPalpitationsChestPainAgitation ? 'YES (AVOID EPINEPHRINE / MONITOR)' : 'No'}.`,
    `- Flaccid paralysis or severe weakness (Toluene distal RTA): ${state.hasSevereWeaknessParalysis ? 'YES (STAT POTASSIUM REPLETION)' : 'No'}.`,
    `- Central blind spot or blurred vision (Popper maculopathy): ${state.hasCentralVisionLossScotoma ? 'YES (URGENT SPECTRAL-DOMAIN OCT)' : 'No'}.`,
    `- Co-ingestion with PDE-5 inhibitors (Viagra/Cialis shock): ${state.coIngestedPde5Inhibitor ? 'YES (CRITICAL VASODILATORY COLLAPSE)' : 'No'}.`,
    `- Mask or bag fastened over face/head (Suffocation hazard): ${state.usingMaskOrBagOverHead ? 'YES (REMOVE APPARATUS IMMEDIATELY)' : 'No'}.`,
    '',
    'A (CLINICAL ASSESSMENT):',
    `- Assessment: ${evaluation.actionEn}`,
    `- Proposed Clinical Intervention: ${evaluation.interventionEn}`,
    '',
    'R (RECOMMENDATIONS & TOXICOLOGY MANAGEMENT):',
    '1. If N₂O neuropathy suspected: Standard B12 levels are deceptively normal; order serum MMA & Homocysteine; initiate IM Hydroxocobalamin 1,000 mcg.',
    '2. If methemoglobinemia confirmed: Administer IV Methylene Blue 1–2 mg/kg over 5 min (verify G6PD status; use IV ascorbic acid if deficient).',
    '3. If hydrocarbon arrest / SSDS: Avoid epinephrine/isoproterenol; prioritize defibrillation and beta-blockers (esmolol).',
    '4. Strictly mandate balloons for N₂O to prevent cryogenic freeze burns to laryngeal structures and pulmonary barotrauma.',
    '====================================================================',
  ].join('\n');
}

// ============================================================================
// MAIN VIEW RENDERER (WCAG 2.2 AA COMPLIANT DOM TREE)
// ============================================================================

export function inhalantCareView() {
  const container = h('div', { class: 'inhalant-care-view' });

  function render() {
    clear(container);
    const state = getInhalantState();
    const evaluation = evaluateInhalantRisk(state);

    // Header Banner
    const header = h('header', { class: 'ic-header' }, [
      h('div', { class: 'ic-header-badge' }, [
        icon('activity'),
        h('span', {}, t('ic.header.badge', 'Inhalants, Solvents & Nitrous Oxide Safety')),
      ]),
      h('h1', { class: 'ic-header-title' }, t('ic.header.title', 'Inhalant, Solvent & Nitrous Oxide Harm Reduction')),
      h('p', { class: 'ic-header-desc' }, t('ic.header.desc', 'Evidence-based clinical decision support and harm reduction standards from ACMT, NPIS, and toxicology consensus: Subacute Combined Degeneration from N₂O B12 inactivation, Sudden Sniffing Death Syndrome (SSDS), alkyl nitrite methemoglobinemia, and cryogenic freeze injury prevention.')),
    ]);

    // Mode Switcher
    const modeSwitcher = h('div', { class: 'ic-mode-switcher', role: 'group', 'aria-label': 'Audience Mode Switcher' }, [
      h('button', {
        class: `ic-mode-btn ${state.viewMode === 'community' ? 'active' : ''}`,
        'aria-pressed': state.viewMode === 'community' ? 'true' : 'false',
        onclick: () => setInhalantState({ viewMode: 'community' }),
      }, [
        icon('check'),
        h('span', {}, t('ic.mode.community', 'Community & Festival Mode (Balloons, Poppers & Safety)')),
      ]),
      h('button', {
        class: `ic-mode-btn ${state.viewMode === 'clinical' ? 'active' : ''}`,
        'aria-pressed': state.viewMode === 'clinical' ? 'true' : 'false',
        onclick: () => setInhalantState({ viewMode: 'clinical' }),
      }, [
        icon('alert'),
        h('span', {}, t('ic.mode.clinical', 'Clinician & Toxicology Mode (SCD, MetHb, RTA & SBAR)')),
      ]),
    ]);

    // Tabs Nav
    const tabsList = h('div', { class: 'ic-tabs-nav', role: 'tablist', 'aria-label': 'Inhalant Care Tabs' }, [
      h('button', {
        class: `ic-tab-btn ${state.activeTab === 'triage' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': state.activeTab === 'triage' ? 'true' : 'false',
        onclick: () => setInhalantState({ activeTab: 'triage' }),
      }, t('ic.tabs.triage', 'Emergency & Toxin Triage')),
      h('button', {
        class: `ic-tab-btn ${state.activeTab === 'substances' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': state.activeTab === 'substances' ? 'true' : 'false',
        onclick: () => setInhalantState({ activeTab: 'substances' }),
      }, t('ic.tabs.substances', 'Substance Science & Kinetics')),
      h('button', {
        class: `ic-tab-btn ${state.activeTab === 'differentials' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': state.activeTab === 'differentials' ? 'true' : 'false',
        onclick: () => setInhalantState({ activeTab: 'differentials' }),
      }, t('ic.tabs.differentials', 'Clinical Differentials & Antidotes')),
      h('button', {
        class: `ic-tab-btn ${state.activeTab === 'harmReduction' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': state.activeTab === 'harmReduction' ? 'true' : 'false',
        onclick: () => setInhalantState({ activeTab: 'harmReduction' }),
      }, t('ic.tabs.harmReduction', 'Harm Reduction & Safer Use')),
    ]);

    let tabContent;
    switch (state.activeTab) {
      case 'substances':
        tabContent = renderSubstancesTab();
        break;
      case 'differentials':
        tabContent = renderDifferentialsTab();
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
    const section = h('section', { class: 'ic-triage-section', role: 'tabpanel' });

    // Inputs Grid
    const inputsGrid = h('div', { class: 'ic-inputs-grid' }, [
      // 1. Substance Selector
      h('div', { class: 'input-card' }, [
        h('label', { for: 'ic-select-substance', class: 'input-label' }, t('ic.label.substance', '1. Primary Substance Inhaled')),
        h('select', {
          id: 'ic-select-substance',
          class: 'ic-select',
          onchange: (e) => setInhalantState({ selectedSubstance: e.target.value }),
        }, [
          h('option', { value: 'nitrous_oxide', selected: state.selectedSubstance === 'nitrous_oxide' }, t('ic.opt.n2o', 'Nitrous Oxide (N₂O / Whippets, Cylinders, Galaxy Gas)')),
          h('option', { value: 'volatile_hydrocarbons', selected: state.selectedSubstance === 'volatile_hydrocarbons' }, t('ic.opt.hydrocarbons', 'Volatile Hydrocarbons / Aerosols / Dusters / Butane / Toluene')),
          h('option', { value: 'alkyl_nitrites', selected: state.selectedSubstance === 'alkyl_nitrites' }, t('ic.opt.nitrites', 'Alkyl Nitrites ("Poppers" / Isobutyl, Isopentyl, Amyl Nitrite)')),
        ]),
      ]),

      // 2. Co-ingestion with PDE-5 inhibitors (Viagra/Cialis)
      h('div', { class: 'input-card checkbox-card' }, [
        h('label', { class: 'checkbox-label' }, [
          h('input', {
            type: 'checkbox',
            checked: state.coIngestedPde5Inhibitor,
            onchange: (e) => setInhalantState({ coIngestedPde5Inhibitor: e.target.checked }),
          }),
          h('span', {}, [
            h('strong', {}, t('ic.check.pde5Strong', 'Poppers Combined with Viagra, Cialis, or Levitra? ')),
            t('ic.check.pde5Detail', '(Lethal vasodilatory shock hazard)'),
          ]),
        ]),
      ]),

      // 3. Mask or Bag Over Head
      h('div', { class: 'input-card checkbox-card' }, [
        h('label', { class: 'checkbox-label' }, [
          h('input', {
            type: 'checkbox',
            checked: state.usingMaskOrBagOverHead,
            onchange: (e) => setInhalantState({ usingMaskOrBagOverHead: e.target.checked }),
          }),
          h('span', {}, [
            h('strong', {}, t('ic.check.maskStrong', 'Plastic Bag or Mask Fastened Over Face or Head? ')),
            t('ic.check.maskDetail', '(Fatal suffocation & anoxic brain death hazard)'),
          ]),
        ]),
      ]),

      // 4. Cyanosis & Chocolate Blood (Methemoglobinemia)
      h('div', { class: 'input-card checkbox-card' }, [
        h('label', { class: 'checkbox-label' }, [
          h('input', {
            type: 'checkbox',
            checked: state.hasCyanosisChocolateBlood,
            onchange: (e) => setInhalantState({ hasCyanosisChocolateBlood: e.target.checked }),
          }),
          h('span', {}, [
            h('strong', {}, t('ic.check.metHbStrong', 'Blue/Gray Skin, Pulse Ox ~85%, or Chocolate-Brown Blood? ')),
            t('ic.check.metHbDetail', '(Suspected Methemoglobinemia from poppers)'),
          ]),
        ]),
      ]),

      // 5. Palpitations / Chest Pain (SSDS)
      h('div', { class: 'input-card checkbox-card' }, [
        h('label', { class: 'checkbox-label' }, [
          h('input', {
            type: 'checkbox',
            checked: state.hasPalpitationsChestPainAgitation,
            onchange: (e) => setInhalantState({ hasPalpitationsChestPainAgitation: e.target.checked }),
          }),
          h('span', {}, [
            h('strong', {}, t('ic.check.ssdsStrong', 'Racing Heart, Severe Palpitations, or Chest Pain Post-Huffing? ')),
            t('ic.check.ssdsDetail', '(Sudden Sniffing Death / adrenaline sensitization)'),
          ]),
        ]),
      ]),

      // 6. Numbness / Tingling / Ataxia (N2O SCD)
      h('div', { class: 'input-card checkbox-card' }, [
        h('label', { class: 'checkbox-label' }, [
          h('input', {
            type: 'checkbox',
            checked: state.hasNumbnessTinglingAtaxia,
            onchange: (e) => setInhalantState({ hasNumbnessTinglingAtaxia: e.target.checked }),
          }),
          h('span', {}, [
            h('strong', {}, t('ic.check.scdStrong', 'Numb Hands/Feet, Pins & Needles, or Stumbling Balance? ')),
            t('ic.check.scdDetail', '(Subacute Combined Degeneration / B12 shutdown)'),
          ]),
        ]),
      ]),

      // 7. Severe Weakness / Quadriparesis (Toluene RTA)
      h('div', { class: 'input-card checkbox-card' }, [
        h('label', { class: 'checkbox-label' }, [
          h('input', {
            type: 'checkbox',
            checked: state.hasSevereWeaknessParalysis,
            onchange: (e) => setInhalantState({ hasSevereWeaknessParalysis: e.target.checked }),
          }),
          h('span', {}, [
            h('strong', {}, t('ic.check.rtaStrong', 'Severe Flaccid Muscle Weakness or Inability to Move Limbs? ')),
            t('ic.check.rtaDetail', '(Toluene distal RTA & severe hypokalemia K⁺ < 2.0)'),
          ]),
        ]),
      ]),

      // 8. Central Blind Spot / Blurred Vision (Popper Maculopathy)
      h('div', { class: 'input-card checkbox-card' }, [
        h('label', { class: 'checkbox-label' }, [
          h('input', {
            type: 'checkbox',
            checked: state.hasCentralVisionLossScotoma,
            onchange: (e) => setInhalantState({ hasCentralVisionLossScotoma: e.target.checked }),
          }),
          h('span', {}, [
            h('strong', {}, t('ic.check.maculaStrong', 'Central Blind Spot (Scotoma) or Blurry Vision Post-Poppers? ')),
            t('ic.check.maculaDetail', '(Popper-induced foveal photoreceptor phototoxicity)'),
          ]),
        ]),
      ]),
    ]);

    // Results Box
    const resultBox = h('div', { class: `ic-result-card ${evaluation.isEmergency ? 'emergency' : 'standard'}` }, [
      h('div', { class: 'ic-result-header' }, [
        icon(evaluation.isEmergency ? 'alert' : 'check'),
        h('h3', {}, evaluation.titleEn),
      ]),
      h('div', { class: 'ic-result-details' }, [
        h('div', { class: 'ic-rec-item' }, [
          h('strong', {}, t('ic.res.action', 'Clinical & Harm Reduction Action: ')),
          h('p', {}, evaluation.actionEn),
        ]),
        h('div', { class: 'ic-rec-item' }, [
          h('strong', {}, t('ic.res.intervention', 'Recommended Medical Intervention: ')),
          h('p', {}, evaluation.interventionEn),
        ]),
      ]),
    ]);

    // SBAR Export Card
    const sbarCard = h('div', { class: 'ic-sbar-card' }, [
      h('div', { class: 'sbar-header' }, [
        h('h3', {}, t('ic.sbar.title', 'Zero-PII Inhalant & Toxicology Clinical Handoff Note Generator')),
        h('div', { class: 'sbar-actions' }, [
          h('button', {
            class: 'btn btn-secondary',
            onclick: () => {
              const text = buildInhalantSbarText(state, evaluation, 'en');
              navigator.clipboard?.writeText(text);
            },
          }, [icon('copy'), h('span', {}, t('ic.sbar.copyEn', 'Copy Clinical SBAR (English)'))]),
          h('button', {
            class: 'btn btn-secondary',
            onclick: () => {
              const text = buildInhalantSbarText(state, evaluation, 'es');
              navigator.clipboard?.writeText(text);
            },
          }, [icon('copy'), h('span', {}, t('ic.sbar.copyEs', 'Copiar SBAR (Español)'))]),
        ]),
      ]),
      h('pre', { class: 'sbar-pre', 'aria-label': 'SBAR Preview' }, buildInhalantSbarText(state, evaluation, 'en')),
    ]);

    section.appendChild(inputsGrid);
    section.appendChild(resultBox);
    section.appendChild(sbarCard);
    return section;
  }

  function renderSubstancesTab() {
    const section = h('section', { class: 'ic-substances-tab', role: 'tabpanel' });

    const introCard = h('div', { class: 'ic-intro-card' }, [
      h('h2', { class: 'tab-heading' }, t('ic.sub.heading', 'Inhalant Pharmacology, Molecular Mechanisms & Clinical Hazards')),
      h('p', { class: 'tab-subtitle' }, t('ic.sub.subtitle', 'Distinct pharmacokinetic profiles of nitrous oxide, volatile hydrocarbons, and alkyl nitrites: from Vitamin B12 cobalt oxidation to myocardial adrenaline sensitization.')),
    ]);

    const cardsGrid = h('div', { class: 'ic-cards-grid' }, Object.values(INHALANT_COMPOUND_PROFILES).map((compound) => h('div', { class: 'ic-compound-card' }, [
      h('h3', { class: 'compound-title' }, compound.nameEn),
      h('div', { class: 'compound-field' }, [
        h('strong', {}, 'Pharmacological Mechanism: '),
        h('p', {}, compound.pharmacologyEn),
      ]),
      h('div', { class: 'compound-field' }, [
        h('strong', {}, 'Acute Toxic Hazards: '),
        h('p', {}, compound.acuteHazardsEn),
      ]),
      h('div', { class: 'compound-field alert-box' }, [
        h('strong', {}, 'Diagnostic Trap / ACLS Nuance: '),
        h('p', {}, compound.diagnosticParadoxEn),
      ]),
      h('div', { class: 'compound-field antidote-box' }, [
        h('strong', {}, 'Antidote & Reversal Protocol: '),
        h('p', {}, compound.antidoteEn),
      ]),
    ])));

    section.appendChild(introCard);
    section.appendChild(cardsGrid);
    return section;
  }

  function renderDifferentialsTab() {
    const section = h('section', { class: 'ic-differentials-tab', role: 'tabpanel' });

    const introCard = h('div', { class: 'ic-intro-card' }, [
      h('h2', { class: 'tab-heading' }, t('ic.diff.heading', 'Clinical Differential Engines: Neurotoxicity, Arrhythmias & Methemoglobinemia')),
      h('p', { class: 'tab-subtitle' }, t('ic.diff.subtitle', 'Critical bedside diagnosis and emergency management of inhalant syndromes: Subacute Combined Degeneration, Sudden Sniffing Death, MetHb, and Toluene RTA.')),
    ]);

    const diffsGrid = h('div', { class: 'ic-diff-grid' }, Object.values(INHALANT_CLINICAL_DIFFERENTIALS).map((diff) => h('div', { class: `ic-diff-card ${diff.severity}` }, [
      h('div', { class: `diff-badge ${diff.severity}` }, diff.severity.toUpperCase().replace('_', ' ')),
      h('h3', { class: 'diff-title' }, diff.titleEn),
      h('div', { class: 'diff-section' }, [
        h('strong', {}, 'Classic Clinical Triad / Presentation: '),
        h('p', {}, diff.classicTriadEn),
      ]),
      h('div', { class: 'diff-section' }, [
        h('strong', {}, 'Underlying Pathophysiology: '),
        h('p', {}, diff.underlyingPathologyEn),
      ]),
      h('div', { class: 'diff-section action-section' }, [
        h('strong', {}, 'Emergency Clinical Action & Protocol: '),
        h('p', {}, diff.actionEn),
      ]),
    ])));

    section.appendChild(introCard);
    section.appendChild(diffsGrid);
    return section;
  }

  function renderHarmReductionTab() {
    const section = h('section', { class: 'ic-harm-tab', role: 'tabpanel' });

    const introCard = h('div', { class: 'ic-intro-card' }, [
      h('h2', { class: 'tab-heading' }, t('ic.hr.heading', 'Evidence-Based Harm Reduction & Safer Administration Directives')),
      h('p', { class: 'tab-subtitle' }, t('ic.hr.subtitle', 'Non-judgmental, actionable directives to prevent sudden death, vocal cord cryo-freezing, anoxic brain injury, and irreversible spinal cord damage.')),
    ]);

    const rulesGrid = h('div', { class: 'ic-rules-grid' }, INHALANT_HARM_REDUCTION_RULES.map((rule) => h('div', { class: 'ic-rule-card' }, [
      h('div', { class: 'rule-badge' }, `Rule ${rule.ruleNum}`),
      h('h3', {}, rule.titleEn),
      h('p', {}, rule.detailEn),
    ])));

    section.appendChild(introCard);
    section.appendChild(rulesGrid);
    const hematologyCard = h('div', { class: 'ic-rule-card mt-3' }, [
      h('h3', {}, 'Poppers Methemoglobinemia, Heinz-Body Hemolysis & G6PD Methylene Blue Ban'),
      h('p', {}, 'Alkyl nitrites ("Poppers") oxidize hemoglobin to MetHb and cause Heinz-body "bite cell" hemolysis. Methylene Blue is strictly contraindicated in G6PD deficiency: '),
      h('p', {}, [
        h('a', { href: '#/hematology-care', class: 'btn btn-secondary' }, 'Open Hematology, Coagulopathy & Toxic Hemolysis Navigator →'),
      ]),
    ]);
    section.appendChild(hematologyCard);
    return section;
  }

  // Initial render
  const unsubscribe = subscribeInhalantState(() => render());
  render();

  return container;
}
