import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  REVERSAL_FORMULATIONS,
  WOODEN_CHEST_SYNDROME,
  RENARCONIZATION_RISK,
  STIMULANT_OVERAMPING_GUIDE,
  XYLAZINE_SEDATION_MANAGEMENT,
  compareFormulations,
  getReversalProtocols,
  evaluateOverdoseRiskScenario,
} from '../public/js/content/reversalFormulations.js';

describe('REVERSAL_FORMULATIONS Clinical Pharmacology & Schema', () => {
  const REQUIRED_IDS = [
    'naloxone_nasal_4mg',
    'naloxone_nasal_8mg',
    'nalmefene_nasal_3mg',
    'naloxone_injectable_0_4mg',
  ];

  it('contains all 4 core evidence-based reversal formulations', () => {
    assert.ok(REVERSAL_FORMULATIONS && typeof REVERSAL_FORMULATIONS === 'object');
    for (const id of REQUIRED_IDS) {
      assert.ok(REVERSAL_FORMULATIONS[id], `Missing formulation with id "${id}"`);
      assert.equal(REVERSAL_FORMULATIONS[id].id, id);
    }
  });

  it('is iterable via for..of and spread syntax', () => {
    const list = [...REVERSAL_FORMULATIONS];
    assert.equal(list.length, 4);
    const ids = list.map((f) => f.id);
    for (const req of REQUIRED_IDS) {
      assert.ok(ids.includes(req), `Iterated list missing "${req}"`);
    }
  });

  it('validates complete pharmacological and regulatory properties for each formulation', () => {
    for (const [id, f] of Object.entries(REVERSAL_FORMULATIONS)) {
      // Basic Identification
      assert.equal(typeof f.brandName, 'string', `Invalid brandName on ${id}`);
      assert.equal(typeof f.genericName, 'string', `Invalid genericName on ${id}`);
      assert.equal(typeof f.deliveryRoute, 'string', `Invalid deliveryRoute on ${id}`);
      assert.ok(['intranasal', 'injectable'].includes(f.routeCategory), `Invalid routeCategory on ${id}`);
      assert.equal(typeof f.dose, 'string', `Invalid dose on ${id}`);
      assert.equal(typeof f.doseValueMg, 'number', `Invalid doseValueMg on ${id}`);
      assert.ok(f.doseValueMg > 0, `doseValueMg must be positive on ${id}`);
      assert.equal(typeof f.volume, 'string', `Invalid volume on ${id}`);
      assert.equal(typeof f.concentration, 'string', `Invalid concentration on ${id}`);
      assert.equal(typeof f.deviceType, 'string', `Invalid deviceType on ${id}`);
      assert.ok(['otc', 'rx_only', 'ssp_community'].includes(f.accessStatus), `Invalid accessStatus on ${id}`);
      assert.equal(typeof f.accessLabel, 'string', `Invalid accessLabel on ${id}`);

      // Pharmacokinetics
      assert.equal(typeof f.onsetMinutes.min, 'number');
      assert.equal(typeof f.onsetMinutes.max, 'number');
      assert.ok(f.onsetMinutes.min <= f.onsetMinutes.max);
      assert.equal(typeof f.onsetMinutes.text, 'string');

      assert.equal(typeof f.eliminationHalfLifeMinutes.min, 'number');
      assert.equal(typeof f.eliminationHalfLifeMinutes.max, 'number');
      assert.ok(f.eliminationHalfLifeMinutes.min <= f.eliminationHalfLifeMinutes.max);
      assert.equal(typeof f.eliminationHalfLifeMinutes.text, 'string');
      assert.equal(typeof f.eliminationHalfLifeMinutes.terminalHours, 'number');

      assert.equal(typeof f.durationOfActionMinutes.min, 'number');
      assert.equal(typeof f.durationOfActionMinutes.max, 'number');
      assert.equal(typeof f.durationOfActionMinutes.text, 'string');

      // Receptor Pharmacology
      assert.equal(typeof f.receptorPharmacology.targetReceptor, 'string');
      assert.equal(typeof f.receptorPharmacology.action, 'string');
      assert.equal(typeof f.receptorPharmacology.affinityKiNm, 'number');
      assert.ok(f.receptorPharmacology.affinityKiNm > 0);
      assert.equal(typeof f.receptorPharmacology.receptorSelectivity, 'string');
      assert.equal(f.receptorPharmacology.intrinsicAgonistActivity, 0);

      // Bioavailability & Administration
      assert.equal(typeof f.bioavailabilityPct.min, 'number');
      assert.equal(typeof f.bioavailabilityPct.max, 'number');
      assert.equal(typeof f.bioavailabilityPct.text, 'string');

      assert.equal(typeof f.standardRedosingIntervalMinutes.min, 'number');
      assert.equal(typeof f.standardRedosingIntervalMinutes.max, 'number');
      assert.equal(typeof f.standardRedosingIntervalMinutes.text, 'string');

      // Precipitated Withdrawal Profile
      assert.ok(['moderate', 'high', 'severe_prolonged', 'low_titratable'].includes(f.precipitatedWithdrawal.riskLevel));
      assert.equal(typeof f.precipitatedWithdrawal.severity, 'string');
      assert.equal(typeof f.precipitatedWithdrawal.durationHours, 'string');
      assert.ok(Array.isArray(f.precipitatedWithdrawal.clinicalFeatures) && f.precipitatedWithdrawal.clinicalFeatures.length >= 3);
      assert.equal(typeof f.precipitatedWithdrawal.mitigationStrategy, 'string');

      // Indications, Pearls, and Evidence Sources
      assert.ok(Array.isArray(f.targetIndications) && f.targetIndications.length >= 2);
      assert.ok(Array.isArray(f.clinicalPearls) && f.clinicalPearls.length >= 2);
      assert.ok(Array.isArray(f.sources) && f.sources.length >= 2);
      assert.ok(Array.isArray(f.evidenceSources) && f.evidenceSources.length >= 2);
      for (const src of f.sources) {
        assert.equal(typeof src.organization, 'string');
        assert.equal(typeof src.title, 'string');
        assert.ok(typeof src.year === 'number');
        assert.ok(src.url.startsWith('https://'));
      }
    }
  });

  describe('Formulation 1: naloxone_nasal_4mg (Narcan / OTC generic)', () => {
    const n4 = REVERSAL_FORMULATIONS.naloxone_nasal_4mg;

    it('documents 4mg / 0.1mL needle-free nasal spray with OTC status', () => {
      assert.equal(n4.doseValueMg, 4);
      assert.equal(n4.volume, '0.1 mL');
      assert.equal(n4.accessStatus, 'otc');
      assert.match(n4.brandName, /Narcan/i);
    });

    it('documents 2–3 min onset and 30–90 min elimination half-life', () => {
      assert.equal(n4.onsetMinutes.min, 2);
      assert.equal(n4.onsetMinutes.max, 3);
      assert.equal(n4.eliminationHalfLifeMinutes.min, 30);
      assert.equal(n4.eliminationHalfLifeMinutes.max, 90);
    });

    it('identifies as standard initial community reversal with moderate withdrawal profile', () => {
      assert.equal(n4.precipitatedWithdrawal.riskLevel, 'moderate');
      assert.match(n4.targetIndications.join(' '), /bystander|community/i);
      assert.match(n4.clinicalPearls[0], /adequate spontaneous breathing/i);
    });
  });

  describe('Formulation 2: naloxone_nasal_8mg (Kloxxado)', () => {
    const n8 = REVERSAL_FORMULATIONS.naloxone_nasal_8mg;

    it('documents 8mg / 0.1mL high-concentration formulation', () => {
      assert.equal(n8.doseValueMg, 8);
      assert.equal(n8.volume, '0.1 mL');
      assert.match(n8.brandName, /Kloxxado/i);
      assert.equal(n8.accessStatus, 'rx_only');
    });

    it('highlights clinical caveat: high acute precipitated withdrawal risk and sympathetic surge', () => {
      assert.equal(n8.precipitatedWithdrawal.riskLevel, 'high');
      const features = n8.precipitatedWithdrawal.clinicalFeatures.join(' ');
      assert.match(features, /sympathetic|catecholamine/i);
      assert.match(features, /emesis|vomiting/i);
      assert.match(features, /pulmonary edema/i);
    });

    it('clarifies that higher dose does not lengthen elimination half-life (still 30–90 min)', () => {
      assert.equal(n8.eliminationHalfLifeMinutes.min, 30);
      assert.equal(n8.eliminationHalfLifeMinutes.max, 90);
      assert.match(n8.clinicalPearls.join(' '), /does NOT prolong elimination half-life/i);
    });
  });

  describe('Formulation 3: nalmefene_nasal_3mg (Opvee)', () => {
    const nalm = REVERSAL_FORMULATIONS.nalmefene_nasal_3mg;

    it('documents 3mg (2.7mg base) in 0.1mL nasal spray', () => {
      assert.equal(nalm.doseValueMg, 3);
      assert.equal(nalm.volume, '0.1 mL');
      assert.match(nalm.brandName, /Opvee/i);
      assert.equal(nalm.accessStatus, 'rx_only');
    });

    it('documents long terminal elimination half-life of ~11.4 hours', () => {
      assert.equal(nalm.eliminationHalfLifeMinutes.terminalHours, 11.4);
      assert.ok(nalm.eliminationHalfLifeMinutes.min >= 480);
      assert.match(nalm.eliminationHalfLifeMinutes.text, /11\.4 hours/);
    });

    it('documents higher mu-opioid receptor affinity than naloxone (Ki ~0.3 nM)', () => {
      assert.equal(nalm.receptorPharmacology.affinityKiNm, 0.3);
      assert.ok(nalm.receptorPharmacology.affinityKiNm < REVERSAL_FORMULATIONS.naloxone_nasal_4mg.receptorPharmacology.affinityKiNm);
    });

    it('highlights severe clinical caveat: prolonged precipitated withdrawal lasting 12–24+ hours', () => {
      assert.equal(nalm.precipitatedWithdrawal.riskLevel, 'severe_prolonged');
      assert.equal(nalm.precipitatedWithdrawal.durationHours, '12–24+ hours');
      assert.match(nalm.precipitatedWithdrawal.mitigationStrategy, /12–24 hour hospital observation/i);
      assert.match(nalm.clinicalPearls.join(' '), /cannot be quickly reversed/i);
    });
  });

  describe('Formulation 4: naloxone_injectable_0_4mg (Vial/Ampule IM/SC/IV)', () => {
    const inj = REVERSAL_FORMULATIONS.naloxone_injectable_0_4mg;

    it('documents 0.4mg/mL injectable formulation with 100% bioavailability', () => {
      assert.equal(inj.doseValueMg, 0.4);
      assert.equal(inj.volume, '1.0 mL');
      assert.equal(inj.concentration, '0.4 mg/mL');
      assert.equal(inj.routeCategory, 'injectable');
      assert.equal(inj.bioavailabilityPct.min, 100);
      assert.equal(inj.bioavailabilityPct.max, 100);
    });

    it('identifies as low-cost Syringe Services Programs (SSP) protocol with titratable low withdrawal risk', () => {
      assert.equal(inj.accessStatus, 'ssp_community');
      assert.equal(inj.precipitatedWithdrawal.riskLevel, 'low_titratable');
      assert.match(inj.clinicalPearls.join(' '), /Syringe Services Programs|cost-effectiveness/i);
      assert.match(inj.clinicalPearls.join(' '), /directly through clothing/i);
    });
  });
});

describe('Clinical Scenario Guides', () => {
  describe('WOODEN_CHEST_SYNDROME', () => {
    it('documents pathophysiology of fentanyl-induced chest wall rigidity and glottic closure', () => {
      assert.equal(WOODEN_CHEST_SYNDROME.id, 'wooden_chest_syndrome');
      assert.match(WOODEN_CHEST_SYNDROME.pathophysiology.mechanism, /central mu-opioid/i);
      assert.match(WOODEN_CHEST_SYNDROME.pathophysiology.mechanism, /striatum|basal ganglia/i);
      assert.match(WOODEN_CHEST_SYNDROME.pathophysiology.glotticInvolvement, /vocal cord closure|laryngospasm/i);
      assert.match(WOODEN_CHEST_SYNDROME.pathophysiology.ventilationImpact, /bag-valve-mask.*impossible/i);
    });

    it('provides immediate clinical response: high-dose naloxone, rapid airway positioning, emergency EMS activation', () => {
      const resp = WOODEN_CHEST_SYNDROME.immediateClinicalResponse;
      assert.match(resp.naloxoneDosing, /high-dose|repeat immediately/i);
      assert.match(resp.airwayManagement, /jaw thrust/i);
      assert.match(resp.emsRole, /ALS|neuromuscular blockade|succinylcholine|rocuronium/i);
      assert.match(resp.contraindications, /do not rely solely on rescue breathing without naloxone/i);
    });
  });

  describe('RENARCONIZATION_RISK', () => {
    it('documents lipophilic synthetic fentanyl redistribution kinetics after naloxone wears off (30–90 min)', () => {
      assert.equal(RENARCONIZATION_RISK.id, 'renarconization_risk');
      assert.match(RENARCONIZATION_RISK.pathophysiology.mechanism, /short-acting antagonist.*lipophilic synthetic fentanyl/i);
      assert.match(RENARCONIZATION_RISK.pathophysiology.redistributionDynamics, /adipose tissue.*redistribute/i);
      assert.equal(RENARCONIZATION_RISK.pathophysiology.timeToReboundMinutes.min, 30);
      assert.equal(RENARCONIZATION_RISK.pathophysiology.timeToReboundMinutes.max, 120);
    });

    it('establishes minimum 2–4 hour post-reversal observation protocol', () => {
      const proto = RENARCONIZATION_RISK.clinicalProtocol;
      assert.equal(proto.minimumObservationHours, 2);
      assert.match(proto.recommendedObservationHours, /2–4 hours/);
      assert.ok(proto.monitoringParameters.some((m) => m.includes('pulse oximetry') || m.includes('SpO2')));
      assert.ok(proto.monitoringParameters.some((m) => m.includes('respiratory rate')));
      assert.match(proto.managementOfRecurrence.join(' '), /continuous IV naloxone infusion/i);
    });
  });

  describe('STIMULANT_OVERAMPING_GUIDE', () => {
    it('delineates psychological vs physical overamping presentations', () => {
      assert.equal(STIMULANT_OVERAMPING_GUIDE.id, 'stimulant_overamping_guide');
      const psych = STIMULANT_OVERAMPING_GUIDE.classification.psychologicalOveramping;
      const phys = STIMULANT_OVERAMPING_GUIDE.classification.physicalOveramping;

      assert.match(psych.symptoms.join(' '), /paranoia|hallucinations|panic/i);
      assert.match(psych.interventions.join(' '), /calm.*quiet.*low-stimulation/i);
      assert.match(psych.interventions.join(' '), /never physically restrain/i);

      assert.match(phys.symptoms.join(' '), /hyperthermia.*104°F/i);
      assert.match(phys.symptoms.join(' '), /seizure/i);
      assert.match(phys.symptoms.join(' '), /chest pain|hypertensive/i);
      assert.match(phys.symptoms.join(' '), /rhabdomyolysis/i);
      assert.match(phys.interventions.join(' '), /cooling|ice packs|cool wet towels/i);
    });

    it('enforces the naloxone administration rule for suspected opioid adulteration', () => {
      const rule = STIMULANT_OVERAMPING_GUIDE.naloxoneAdministrationRule;
      assert.match(rule.pharmacologicalFact, /zero pharmacological effect on amphetamines|methamphetamine|cocaine/i);
      assert.match(rule.clinicalMandate, /ALWAYS ADMINISTER NALOXONE/i);
      assert.match(rule.rationale.join(' '), /contaminated with fentanyl/i);
    });
  });

  describe('XYLAZINE_SEDATION_MANAGEMENT', () => {
    it('identifies non-opioid alpha-2 adrenergic agonist pathophysiology and sedation duration', () => {
      assert.equal(XYLAZINE_SEDATION_MANAGEMENT.id, 'xylazine_sedation_management');
      assert.match(XYLAZINE_SEDATION_MANAGEMENT.pathophysiology.mechanism, /alpha-2 adrenergic receptor agonist/i);
      assert.match(XYLAZINE_SEDATION_MANAGEMENT.pathophysiology.clinicalEffects.join(' '), /bradycardia|hypotension|hypothermia/i);
      assert.match(XYLAZINE_SEDATION_MANAGEMENT.pathophysiology.durationOfSedationHours, /1–4\+ hours/);
    });

    it('establishes rescue breathing priority and cautions against repeat naloxone dumping', () => {
      const p1 = XYLAZINE_SEDATION_MANAGEMENT.coreClinicalPriorities.priority1_rescueBreathing;
      const p2 = XYLAZINE_SEDATION_MANAGEMENT.coreClinicalPriorities.priority2_avoidNaloxoneDumping;
      const p3 = XYLAZINE_SEDATION_MANAGEMENT.coreClinicalPriorities.priority3_recoveryPositionAndMonitoring;
      const p4 = XYLAZINE_SEDATION_MANAGEMENT.coreClinicalPriorities.priority4_woundCareAwareness;

      assert.match(p1.action, /rescue breathing/i);
      assert.match(p2.warning, /avoid.*naloxone dumping/i);
      assert.match(p2.rationale.join(' '), /respiratory rate >= 10–12.*STOP GIVING NALOXONE/i);
      assert.match(p2.rationale.join(' '), /aspiration/i);
      assert.match(p3.action, /recovery position/i);
      assert.match(p4.guidelines.join(' '), /necrotic skin lesions|wound care/i);
    });
  });
});

describe('Helper Functions & Clinical Comparison Engine', () => {
  describe('compareFormulations(idA, idB)', () => {
    it('accurately compares standard naloxone 4mg vs long-acting nalmefene 3mg', () => {
      const cmp = compareFormulations('naloxone_nasal_4mg', 'nalmefene_nasal_3mg');

      assert.equal(cmp.formulationA.id, 'naloxone_nasal_4mg');
      assert.equal(cmp.formulationB.id, 'nalmefene_nasal_3mg');

      // Half-life ratio comparison (~11.4h vs 1.5h -> ratio ~0.13 or inverted ~7.6x)
      assert.ok(cmp.halfLifeComparison.ratioAtoB < 1);
      assert.match(cmp.halfLifeComparison.summary, /longer elimination half-life/i);

      // Receptor affinity comparison (nalmefene Ki 0.3 nM is higher affinity than naloxone 1.5 nM)
      assert.equal(cmp.receptorAffinityComparison.affinityA, 1.5);
      assert.equal(cmp.receptorAffinityComparison.affinityB, 0.3);
      assert.match(cmp.receptorAffinityComparison.summary, /Opvee has higher mu-opioid receptor binding affinity/i);

      // Precipitated withdrawal comparison
      assert.equal(cmp.precipitatedWithdrawalComparison.riskA, 'moderate');
      assert.equal(cmp.precipitatedWithdrawalComparison.riskB, 'severe_prolonged');
      assert.match(cmp.precipitatedWithdrawalComparison.summary, /Opvee carries higher precipitated withdrawal risk/i);

      // Clinical recommendation synthesis
      assert.match(cmp.clinicalRecommendation, /Standard naloxone.*strongly preferred for community bystander/i);
      assert.match(cmp.clinicalRecommendation, /12–24\+ hours/i);
    });

    it('accurately compares naloxone 4mg vs naloxone 8mg', () => {
      const cmp = compareFormulations('naloxone_nasal_4mg', 'naloxone_nasal_8mg');

      assert.equal(cmp.doseComparison.ratio, 0.5);
      assert.equal(cmp.precipitatedWithdrawalComparison.riskB, 'high');
      assert.match(cmp.clinicalRecommendation, /ACMT and harm reduction toxicologists recommend initial resuscitation with 4 mg/i);
      assert.match(cmp.clinicalRecommendation, /aspiration risk/i);
    });

    it('accurately compares naloxone nasal 4mg vs injectable 0.4mg', () => {
      const cmp = compareFormulations('naloxone_nasal_4mg', 'naloxone_injectable_0_4mg');

      assert.equal(cmp.formulationA.routeCategory, 'intranasal');
      assert.equal(cmp.formulationB.routeCategory, 'injectable');
      assert.match(cmp.clinicalRecommendation, /Injectable naloxone.*100% systemic bioavailability/i);
      assert.match(cmp.clinicalRecommendation, /gentle titration/i);
    });

    it('throws a descriptive error when supplied with an invalid formulation ID', () => {
      assert.throws(
        () => compareFormulations('naloxone_nasal_4mg', 'nonexistent_drug'),
        /Invalid formulation ID provided: "nonexistent_drug"/
      );
      assert.throws(
        () => compareFormulations('unknown_drug', 'naloxone_nasal_4mg'),
        /Invalid formulation ID provided: "unknown_drug"/
      );
    });
  });

  describe('getReversalProtocols(filter)', () => {
    it('returns all 4 formulations when called with no filter', () => {
      const all = getReversalProtocols();
      assert.equal(all.length, 4);
    });

    it('filters by routeCategory', () => {
      const nasal = getReversalProtocols({ routeCategory: 'intranasal' });
      assert.equal(nasal.length, 3);
      assert.ok(nasal.every((f) => f.routeCategory === 'intranasal'));

      const inj = getReversalProtocols({ routeCategory: 'injectable' });
      assert.equal(inj.length, 1);
      assert.equal(inj[0].id, 'naloxone_injectable_0_4mg');
    });

    it('filters by accessStatus and otcOnly', () => {
      const otc = getReversalProtocols({ accessStatus: 'otc' });
      assert.equal(otc.length, 1);
      assert.equal(otc[0].id, 'naloxone_nasal_4mg');

      const otcFlag = getReversalProtocols({ otcOnly: true });
      assert.equal(otcFlag.length, 1);
      assert.equal(otcFlag[0].id, 'naloxone_nasal_4mg');

      const rx = getReversalProtocols({ accessStatus: 'rx_only' });
      assert.equal(rx.length, 2);
      const rxIds = rx.map((f) => f.id);
      assert.ok(rxIds.includes('naloxone_nasal_8mg'));
      assert.ok(rxIds.includes('nalmefene_nasal_3mg'));
    });

    it('performs case-insensitive text search across brand, generic, and id', () => {
      const kloxxado = getReversalProtocols({ search: 'kloxxado' });
      assert.equal(kloxxado.length, 1);
      assert.equal(kloxxado[0].id, 'naloxone_nasal_8mg');

      const nalmefene = getReversalProtocols({ search: 'NALMEFENE' });
      assert.equal(nalmefene.length, 1);
      assert.equal(nalmefene[0].id, 'nalmefene_nasal_3mg');

      const syringe = getReversalProtocols({ search: 'vial' });
      assert.equal(syringe.length, 1);
      assert.equal(syringe[0].id, 'naloxone_injectable_0_4mg');
    });
  });

  describe('evaluateOverdoseRiskScenario(scenario)', () => {
    it('evaluates Wooden Chest Syndrome scenario correctly', () => {
      const resultByStr = evaluateOverdoseRiskScenario('wooden_chest');
      assert.equal(resultByStr.scenarioId, 'wooden_chest_syndrome');
      assert.equal(resultByStr.severity, 'critical');
      assert.equal(resultByStr.emergencyEMSRequired, true);
      assert.match(resultByStr.primaryAction, /Call 911 immediately.*give naloxone.*rescue breathing.*left recovery position.*stay with them/i);
      assert.match(resultByStr.primaryAction, /Advanced Life Support/i);
      assert.match(resultByStr.airwayGuidance, /jaw thrust/i);
      assert.equal(resultByStr.referenceGuide.id, 'wooden_chest_syndrome');

      const resultByObj = evaluateOverdoseRiskScenario({ chestRigidity: true, inabilityToVentilate: true });
      assert.equal(resultByObj.scenarioId, 'wooden_chest_syndrome');
    });

    it('evaluates Xylazine Sedation scenario and warns against naloxone dumping', () => {
      const resultByStr = evaluateOverdoseRiskScenario('xylazine_sedation');
      assert.equal(resultByStr.scenarioId, 'xylazine_sedation_management');
      assert.equal(resultByStr.severity, 'high');
      assert.match(resultByStr.primaryAction, /Call 911 immediately.*give naloxone.*rescue breathing.*left recovery position.*stay with them/i);
      assert.match(resultByStr.primaryAction, /breathing spontaneously.*rather than repeat naloxone dumping/i);
      assert.match(resultByStr.warnings[0], /DO NOT DUMP REPEATED NALOXONE/i);
      assert.match(resultByStr.airwayGuidance, /recovery position/i);
      assert.equal(resultByStr.referenceGuide.id, 'xylazine_sedation_management');

      const resultByVitals = evaluateOverdoseRiskScenario({ respiratoryRate: 14, persistentSedation: true, suspectedXylazine: true });
      assert.equal(resultByVitals.scenarioId, 'xylazine_sedation_management');
    });

    it('evaluates Renarconization scenario and mandates 2–4 hour observation', () => {
      const resultByStr = evaluateOverdoseRiskScenario('renarconization');
      assert.equal(resultByStr.scenarioId, 'renarconization_risk');
      assert.equal(resultByStr.severity, 'critical');
      assert.match(resultByStr.primaryAction, /Call 911 immediately.*give naloxone.*rescue breathing.*left recovery position.*stay with them/i);
      assert.match(resultByStr.primaryAction, /2–4 hour/i);
      assert.match(resultByStr.monitoringProtocol, /Minimum 2–4 hours continuous medical observation/i);
      assert.equal(resultByStr.referenceGuide.id, 'renarconization_risk');

      const resultByTime = evaluateOverdoseRiskScenario({ timeSinceReversalMinutes: 50, recurrentDepression: true });
      assert.equal(resultByTime.scenarioId, 'renarconization_risk');
    });

    it('evaluates Stimulant Overamping and enforces naloxone rule for suspected fentanyl', () => {
      const resultByStr = evaluateOverdoseRiskScenario('stimulant_overamping');
      assert.equal(resultByStr.scenarioId, 'stimulant_overamping_guide');
      assert.match(resultByStr.naloxoneGuidance, /ALWAYS administer naloxone if the person is unresponsive/i);
      assert.match(resultByStr.warnings[0], /NEVER physically restrain/i);
      assert.equal(resultByStr.referenceGuide.id, 'stimulant_overamping_guide');

      const resultPhysical = evaluateOverdoseRiskScenario({ methamphetamine: true, hyperthermia: true, seizure: true });
      assert.equal(resultPhysical.scenarioId, 'stimulant_overamping_guide');
      assert.equal(resultPhysical.severity, 'critical');
      assert.match(resultPhysical.primaryAction, /active external cooling/i);
    });

    it('evaluates standard opioid overdose as safe default', () => {
      const def = evaluateOverdoseRiskScenario({});
      assert.equal(def.scenarioId, 'standard_opioid_overdose');
      assert.equal(def.severity, 'critical');
      assert.equal(def.emergencyEMSRequired, true);
      assert.match(def.primaryAction, /Call 911 immediately.*first dose of naloxone/i);
    });
  });
});
