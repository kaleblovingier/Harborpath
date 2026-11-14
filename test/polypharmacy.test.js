import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  INTERACTIONS,
  REGIMEN_AGENTS,
  BERNESE_EXAMPLE_SCHEDULE,
  calculateWashout,
  evaluateRegimenSafety,
  scoreRespiratoryRisk,
} from '../public/js/views/medications.js';

describe('MOUD Drug-Drug & Polypharmacy Interactions', () => {
  it('validates critical pairwise interaction pathways in INTERACTIONS dataset', () => {
    assert.ok(Array.isArray(INTERACTIONS));
    assert.ok(INTERACTIONS.length >= 10);

    const ids = INTERACTIONS.map((ix) => ix.id);
    const requiredInteractions = [
      'opioids-benzos',
      'opioids-xylazine',
      'opioids-gabapentinoids',
      'opioids-alcohol',
      'buprenorphine-full-agonists',
      'methadone-cyp-qtc',
      'naltrexone-opioids',
      'cocaine-alcohol',
      'stimulants-opioids',
      'alcohol-disulfiram',
    ];

    for (const req of requiredInteractions) {
      assert.ok(ids.includes(req), `Expected INTERACTIONS to include ${req}`);
      const item = INTERACTIONS.find((x) => x.id === req);
      assert.ok(item.title && item.title.length > 5);
      assert.ok(item.summary && item.summary.length > 10);
      assert.ok(item.mechanism && item.mechanism.length > 15);
      assert.ok(item.action && item.action.length > 10);
      assert.ok(['critical', 'high', 'moderate', 'info'].includes(item.severity));
      assert.ok(Array.isArray(item.source) && item.source.length === 2);
    }
  });

  it('evaluates pairwise precipitated withdrawal alerts (buprenorphine + full opioid; naltrexone + opioid)', () => {
    // Buprenorphine + Fentanyl (partial agonist receptor displacement)
    const bupFent = evaluateRegimenSafety(['buprenorphine', 'opioids_fentanyl']);
    assert.ok(['high', 'critical'].includes(bupFent.riskLevel));
    assert.ok(bupFent.alerts.some((a) => a.id === 'precipitated-withdrawal-buprenorphine'));
    assert.ok(bupFent.actionSteps.some((s) => /Bernese Method|Low-Dose/i.test(s)));

    // Naltrexone + Opioid (antagonist displacement & receptor blockade)
    const naltrexoneFent = evaluateRegimenSafety(['naltrexone', 'opioids_fentanyl']);
    assert.equal(naltrexoneFent.riskLevel, 'critical');
    assert.ok(naltrexoneFent.alerts.some((a) => a.id === 'precipitated-withdrawal-naltrexone'));
    assert.ok(naltrexoneFent.actionSteps.some((s) => /opioid-free/i.test(s)));
  });

  it('evaluates cardiac QTc prolongation and metabolic enzyme interactions', () => {
    // Methadone + QTc meds
    const methadoneQtc = evaluateRegimenSafety(['methadone', 'qtc_meds']);
    assert.ok(['high', 'critical'].includes(methadoneQtc.riskLevel));
    assert.ok(methadoneQtc.alerts.some((a) => a.id === 'methadone-qtc-cyp-synergy'));
    assert.ok(methadoneQtc.actionSteps.some((s) => /CYP3A4|ECG|electrolyte/i.test(s)));

    // Methadone + Stimulants
    const methadoneStim = evaluateRegimenSafety(['methadone', 'stimulants']);
    assert.ok(methadoneStim.matchedInteractions.some((ix) => ix.id === 'methadone-cyp-qtc'));
  });

  it('evaluates disulfiram acetaldehyde toxicity and safe naltrexone AUD therapy', () => {
    // Disulfiram + Alcohol (acute toxic reaction)
    const disulfiramAlc = evaluateRegimenSafety(['disulfiram', 'alcohol']);
    assert.equal(disulfiramAlc.riskLevel, 'critical');
    assert.ok(disulfiramAlc.alerts.some((a) => a.id === 'disulfiram-acetaldehyde-reaction'));
    assert.ok(disulfiramAlc.actionSteps.some((s) => /14 days/i.test(s)));

    // Naltrexone + Alcohol (evidence-based non-toxic combination)
    const naltrexoneAlc = evaluateRegimenSafety(['naltrexone', 'alcohol']);
    assert.equal(naltrexoneAlc.riskLevel, 'info');
    assert.ok(naltrexoneAlc.alerts.some((a) => a.id === 'naltrexone-alcohol-therapeutic'));
    assert.ok(naltrexoneAlc.actionSteps.some((s) => /Continue taking naltrexone/i.test(s)));
  });

  it('handles empty, single, and unknown substance inputs gracefully in evaluateRegimenSafety', () => {
    const empty = evaluateRegimenSafety([]);
    assert.equal(empty.riskLevel, 'none');
    assert.equal(empty.alerts.length, 0);

    const single = evaluateRegimenSafety(['opioids_fentanyl']);
    assert.equal(single.riskLevel, 'none');
    assert.equal(single.alerts.length, 0);

    const invalid = evaluateRegimenSafety(['unknown_substance_xyz']);
    assert.equal(invalid.riskLevel, 'none');
  });
});

describe('Washout Calculations & Clearance Intervals', () => {
  it('returns naltrexone transition guidance without a self-clearance interval', () => {
    for (const [source, target] of [
      ['heroin', 'naltrexone'],
      ['street fentanyl', 'vivitrol'],
      ['methadone', 'oral naltrexone'],
      ['buprenorphine', 'naltrexone'],
    ]) {
      const transition = calculateWashout({ currentSubstance: source, targetMedication: target });
      assert.equal(transition.requiresWashout, true, source);
      assert.equal(transition.opioidFreeRequired, true, source);
      assert.equal(transition.minimumHours, null, source);
      assert.equal(transition.cowsThreshold, null, source);
      assert.match(transition.clinicalGuidance, /a clinician must assess/i, source);
    }
  });

  it('requires clinician assessment for a standard buprenorphine start', () => {
    for (const [source, target] of [
      ['oxycodone', 'buprenorphine'],
      ['methadone', 'suboxone'],
      ['fentanyl', 'buprenorphine'],
    ]) {
      const transition = calculateWashout(source, target);
      assert.equal(transition.requiresWashout, true, source);
      assert.equal(transition.requiresWithdrawal, true, source);
      assert.equal(transition.minimumHours, null, source);
      assert.equal(transition.cowsThreshold, null, source);
      assert.match(transition.clinicalGuidance, /clinician/i, source);
      assert.equal(transition.alternativeStrategy, source === 'fentanyl' ? 'discuss_with_clinician' : null);
    }
  });

  it('calculates disulfiram and metronidazole alcohol abstinence intervals', () => {
    const disulfToAlc = calculateWashout('disulfiram', 'alcohol');
    assert.equal(disulfToAlc.requiresWashout, true);
    assert.equal(disulfToAlc.minimumHours, 336);
    assert.equal(disulfToAlc.recommendedDays, '14 days');
    assert.match(disulfToAlc.clinicalGuidance, /aldehyde dehydrogenase/i);

    const metroToAlc = calculateWashout('metronidazole', 'alcohol');
    assert.equal(metroToAlc.requiresWashout, true);
    assert.equal(metroToAlc.minimumHours, 72);
    assert.equal(metroToAlc.recommendedDays, '3 days');
  });

  it('calculates elective surgery opioid interval after naltrexone', () => {
    // Oral naltrexone -> elective surgery opioids
    const oralToSurg = calculateWashout('oral naltrexone', 'surgery opioids');
    assert.equal(oralToSurg.requiresWashout, true);
    assert.equal(oralToSurg.minimumHours, 72);

    // Vivitrol XR-naltrexone -> elective surgery opioids
    const vivToSurg = calculateWashout('injectable vivitrol', 'surgery opioids');
    assert.equal(vivToSurg.requiresWashout, true);
    assert.equal(vivToSurg.minimumHours, 672);
    assert.equal(vivToSurg.recommendedDays, '28–30 days');
  });

  it('returns requiresWashout: false for non-conflicting or unknown regimens', () => {
    const safe = calculateWashout('alcohol', 'acamprosate');
    assert.equal(safe.requiresWashout, false);
    assert.equal(safe.minimumHours, 0);

    const unknown = calculateWashout('', '');
    assert.equal(unknown.requiresWashout, false);
    assert.equal(unknown.minimumHours, 0);
  });
});

describe('Buprenorphine initiation safety', () => {
  it('does not export a patient dosing schedule through the legacy API', () => {
    assert.deepEqual(BERNESE_EXAMPLE_SCHEDULE, []);
  });
});

describe('Respiratory Risk Scoring Engine', () => {
  it('returns riskLevel none and score 0 for empty or non-depressant inputs', () => {
    const empty = scoreRespiratoryRisk([]);
    assert.equal(empty.score, 0);
    assert.equal(empty.riskLevel, 'none');
    assert.equal(empty.depressantCount, 0);
    assert.equal(empty.depressants.length, 0);

    // Disulfiram and stimulants (non-depressants for respiratory depression score)
    const nonDep = scoreRespiratoryRisk(['disulfiram', 'stimulants']);
    assert.equal(nonDep.score, 0);
    assert.equal(nonDep.riskLevel, 'none');
    assert.equal(nonDep.depressantCount, 0);
  });

  it('scores single depressants appropriately (low to moderate baseline)', () => {
    // Buprenorphine alone has ceiling effect on respiratory depression (weight 1.5)
    const bup = scoreRespiratoryRisk(['buprenorphine']);
    assert.equal(bup.score, 1.5);
    assert.equal(bup.riskLevel, 'low');
    assert.equal(bup.depressantCount, 1);
    assert.ok(bup.harmReductionActions.some((a) => /naloxone/i.test(a)));

    // Gabapentinoids alone (weight 1.5)
    const gaba = scoreRespiratoryRisk(['gabapentinoids']);
    assert.equal(gaba.score, 1.5);
    assert.equal(gaba.riskLevel, 'low');
    assert.equal(gaba.depressantCount, 1);

    // Fentanyl alone (full agonist, weight 3.5)
    const fent = scoreRespiratoryRisk(['opioids_fentanyl']);
    assert.equal(fent.score, 3.5);
    assert.equal(fent.riskLevel, 'moderate');
    assert.equal(fent.depressantCount, 1);

    // Methadone alone (full agonist, weight 3.5)
    const meth = scoreRespiratoryRisk(['methadone']);
    assert.equal(meth.score, 3.5);
    assert.equal(meth.riskLevel, 'moderate');
    assert.equal(meth.depressantCount, 1);
  });

  it('evaluates dual depressants with synergistic 1.5x multiplier', () => {
    // Fentanyl (3.5) + Benzos (2.5) = (3.5 + 2.5) * 1.5 = 9.0 (critical)
    const fentBenzo = scoreRespiratoryRisk(['opioids_fentanyl', 'benzos_sedatives']);
    assert.equal(fentBenzo.score, 9.0);
    assert.equal(fentBenzo.riskLevel, 'critical');
    assert.equal(fentBenzo.depressantCount, 2);
    assert.ok(fentBenzo.riskFactors.some((r) => /GABA-A/i.test(r)));
    assert.ok(fentBenzo.harmReductionActions.some((a) => /rescue breathing/i.test(a)));

    // Fentanyl (3.5) + Xylazine (2.5) = (3.5 + 2.5) * 1.5 = 9.0 (critical)
    const fentXyl = scoreRespiratoryRisk(['opioids_fentanyl', 'xylazine_medetomidine']);
    assert.equal(fentXyl.score, 9.0);
    assert.equal(fentXyl.riskLevel, 'critical');
    assert.ok(fentXyl.riskFactors.some((r) => /alpha-2/i.test(r)));

    // Buprenorphine (1.5) + Gabapentinoids (1.5) = (1.5 + 1.5) * 1.5 = 4.5 (moderate)
    const bupGaba = scoreRespiratoryRisk(['buprenorphine', 'gabapentinoids']);
    assert.equal(bupGaba.score, 4.5);
    assert.equal(bupGaba.riskLevel, 'moderate');
    assert.equal(bupGaba.depressantCount, 2);
  });

  it('evaluates triple+ depressants with critical 2.0x multiplier and compounding risk factors', () => {
    // Fentanyl (3.5) + Benzos (2.5) + Alcohol (2.5) = (8.5) * 2.0 = 17.0 (critical)
    const triple = scoreRespiratoryRisk(['opioids_fentanyl', 'benzos_sedatives', 'alcohol']);
    assert.equal(triple.score, 17.0);
    assert.equal(triple.riskLevel, 'critical');
    assert.equal(triple.depressantCount, 3);
    assert.ok(triple.riskFactors.some((r) => /Triple\+ depressant synergy/i.test(r)));
    assert.ok(triple.harmReductionActions.some((a) => /Never Use Alone/i.test(a)));
    assert.ok(triple.harmReductionActions.some((a) => /rescue breathing/i.test(a)));
    assert.ok(triple.harmReductionActions.some((a) => /911/i.test(a)));

    // Quadruple: Fentanyl + Benzos + Xylazine + Gabapentinoids = (3.5 + 2.5 + 2.5 + 1.5) * 2.0 = 20.0
    const quad = scoreRespiratoryRisk(['opioids_fentanyl', 'benzos_sedatives', 'xylazine_medetomidine', 'gabapentinoids']);
    assert.equal(quad.score, 20.0);
    assert.equal(quad.riskLevel, 'critical');
    assert.equal(quad.depressantCount, 4);
  });
});
