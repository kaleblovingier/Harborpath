import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateAsamCare,
  scoreOpioidWithdrawal,
  scoreAlcoholSedativeRisk,
  formatAsamHandoffText,
} from '../public/js/views/navigator.js';

describe('evaluateAsamCare() — ASAM Criteria (4th Edition) Clinical Engine', () => {
  it('returns ASAM Level 1.0 / 1.5 Outpatient by default with empty answers', () => {
    const res = evaluateAsamCare();
    assert.equal(res.asamLevel, 'ASAM Level 1.0 / 1.5');
    assert.ok(res.asamTitle.includes('Outpatient'));
    assert.ok(res.codes.includes('OP'));
    assert.equal(res.redFlags.length, 0);
    assert.equal(res.searchHref, `#/treatment?codes=${res.codes.join(',')}`);
    assert.ok(res.broadCodes.length >= 1 && res.broadCodes.length <= 3);
  });

  it('flags life-threatening GABAergic withdrawal and recommends ASAM Level 3.7-WM / 4.0 (DT, HI) for alcohol or benzos with moderate/severe withdrawal', () => {
    const alcoholSevere = evaluateAsamCare({
      substances: ['alcohol'],
      withdrawalRisk: 'severe',
    });
    assert.equal(alcoholSevere.asamLevel, 'ASAM Level 3.7-WM / 4.0');
    assert.ok(alcoholSevere.codes.includes('DT'), 'Expected DT code for alcohol withdrawal');
    assert.ok(alcoholSevere.codes.includes('HI'), 'Expected HI code for inpatient withdrawal management');
    assert.ok(alcoholSevere.codes.includes('PMAT'), 'Expected PMAT code for alcohol use disorder medications');
    assert.ok(
      alcoholSevere.redFlags.some((msg) => /seizure|delirium tremens|GABAergic/i.test(msg)),
      'Expected red flag warning about alcohol/benzo withdrawal seizures and delirium tremens',
    );

    const benzoModerate = evaluateAsamCare({
      substances: new Set(['benzos']),
      withdrawalRisk: 'moderate',
    });
    assert.equal(benzoModerate.asamLevel, 'ASAM Level 3.7-WM / 4.0');
    assert.ok(benzoModerate.codes.includes('DT'));
    assert.ok(benzoModerate.codes.includes('HI'));
    assert.ok(
      benzoModerate.redFlags.some((msg) => /seizure|delirium tremens|GABAergic/i.test(msg)),
      'Expected red flag warning for moderate benzodiazepine withdrawal risk',
    );
  });

  it('prioritizes MOUD (BU) and perinatal care (PW) over abrupt detox for opioid use in pregnancy, and explains DEA 72-Hour Rule & CAPTA', () => {
    const res = evaluateAsamCare({
      substances: ['opioids'],
      withdrawalRisk: 'mild',
      biomedical: 'pregnant',
      environment: 'supportive',
      structureNeeded: 'flexible',
    });

    assert.equal(res.asamLevel, 'ASAM Level 1.0 / 1.5');
    assert.ok(res.codes.includes('PW'), 'Expected PW (Pregnant/postpartum) SAMHSA code');
    assert.ok(res.codes.includes('BU'), 'Expected BU (Buprenorphine) SAMHSA code');
    assert.ok(!res.codes.includes('DT'), 'Should not force abrupt detox (DT) for mild opioid withdrawal in pregnancy');
    assert.ok(
      res.redFlags.some((msg) => /ACOG|ASAM|buprenorphine|methadone|fetal/i.test(msg)),
      'Expected perinatal agonist maintenance guidance per ACOG/ASAM guidelines',
    );
    assert.ok(
      res.clinicalNotes.some((msg) => /1306\.07\(b\)|72-Hour Rule/i.test(msg)),
      'Expected DEA 72-Hour Rule (21 CFR 1306.07(b)) clinical note for opioids',
    );
    assert.ok(
      res.clinicalNotes.some((msg) => /CAPTA|Plans of Safe Care/i.test(msg)),
      'Expected CAPTA / perinatal support note',
    );
  });

  it('addresses xylazine (tranq/medetomidine) alpha-2 adrenergic withdrawal and acute infection urgent hospital care (HI)', () => {
    const res = evaluateAsamCare({
      substances: ['opioids', 'xylazine'],
      withdrawalRisk: 'moderate',
      biomedical: 'acute_infection',
    });

    assert.equal(res.asamLevel, 'ASAM Level 3.7-WM / 4.0');
    assert.ok(res.codes.includes('HI'), 'Expected HI (Hospital Inpatient) for acute infection + xylazine');
    assert.ok(res.codes.includes('BU'), 'Expected BU for co-occurring opioid use');
    assert.ok(
      res.clinicalNotes.some((msg) => /alpha-2|clonidine|wound/i.test(msg)),
      'Expected xylazine alpha-2 adrenergic withdrawal and wound care guidance',
    );
    assert.ok(
      res.redFlags.some((msg) => /endocarditis|osteomyelitis|sepsis|EMTALA|#\/health/i.test(msg)),
      'Expected acute infection medical urgency banner',
    );
  });

  it('recommends ASAM Level 3.1 / 3.5 / 3.7 Residential & Recovery Housing (RES, HH) and MHSU for unhoused individuals with co-occurring mental health conditions', () => {
    const res = evaluateAsamCare({
      substances: ['stimulants'],
      withdrawalRisk: 'mild',
      biomedical: 'none',
      mentalHealth: 'severe_crisis',
      environment: 'unhoused',
      structureNeeded: 'flexible',
    });

    assert.equal(res.asamLevel, 'ASAM Level 3.1 / 3.5 / 3.7');
    assert.ok(res.codes.includes('RES'), 'Expected RES (Residential) code');
    assert.ok(res.codes.includes('HH'), 'Expected HH (Recovery housing) code for unhoused environment');
    assert.ok(res.codes.includes('MHSU'), 'Expected MHSU code for co-occurring mental health condition');
    assert.ok(res.codes.includes('CMI'), 'Expected CMI (Contingency Management) for stimulants');
    assert.ok(
      res.redFlags.some((msg) => /988|WI|PEOFF/i.test(msg)),
      'Expected 988 and walk-in/mobile crisis guidance for severe mental health crisis',
    );
  });

  it('recommends ASAM Level 2.1 / 2.5 (IOP) for structured day treatment or unstable environment with trauma-informed care (TRMA)', () => {
    const res = evaluateAsamCare({
      substances: ['alcohol'],
      withdrawalRisk: 'mild',
      biomedical: 'none',
      mentalHealth: 'trauma',
      environment: 'unstable',
      structureNeeded: 'structured_day',
    });

    assert.equal(res.asamLevel, 'ASAM Level 2.1 / 2.5');
    assert.ok(res.codes.includes('IOP'), 'Expected IOP code for Level 2.1 / 2.5');
    assert.ok(res.codes.includes('TRMA'), 'Expected TRMA code for trauma history');
    assert.ok(res.codes.includes('PMAT'), 'Expected PMAT code for alcohol medication support');
  });

  it('includes TELE, payment, and population codes for outpatient telehealth preferences', () => {
    const res = evaluateAsamCare({
      substances: ['opioids'],
      withdrawalRisk: 'mild',
      biomedical: 'none',
      mentalHealth: 'none',
      environment: 'supportive',
      structureNeeded: 'flexible',
      preferTelehealth: true,
      payment: 'MD',
      population: 'VET',
    });

    assert.equal(res.asamLevel, 'ASAM Level 1.0 / 1.5');
    assert.ok(res.codes.includes('OP'));
    assert.ok(res.codes.includes('TELE'));
    assert.ok(res.codes.includes('BU'));
    assert.ok(res.codes.includes('MD'));
    assert.ok(res.codes.includes('VET'));
    assert.ok(res.searchHref.startsWith('#/treatment?codes='));
  });

  it('strictly caps SAMHSA codes at <= 8 and provides 1–3 broadCodes even when every option is selected', () => {
    const res = evaluateAsamCare({
      substances: ['opioids', 'alcohol', 'benzos', 'stimulants', 'xylazine', 'other'],
      withdrawalRisk: 'severe',
      biomedical: 'pregnant',
      mentalHealth: 'severe_crisis',
      environment: 'unhoused',
      structureNeeded: '24_hour',
      payment: 'SS',
      population: 'CJ',
      preferTelehealth: true,
    });

    assert.ok(res.codes.length >= 1 && res.codes.length <= 8, `Expected <= 8 codes, got ${res.codes.length}`);
    assert.equal(new Set(res.codes).size, res.codes.length, 'Codes must not contain duplicates');
    assert.ok(res.broadCodes.length >= 1 && res.broadCodes.length <= 3, 'Expected 1 to 3 broadCodes');
    assert.equal(res.searchHref, `#/treatment?codes=${res.codes.join(',')}`);
    assert.equal(res.broadSearchHref, `#/treatment?codes=${res.broadCodes.join(',')}`);
  });
});

describe('scoreOpioidWithdrawal() — Validated SOWS / COWS-Informed Calculator', () => {
  it('scores none/minimal withdrawal (0–4) and warns against premature sublingual buprenorphine initiation while explaining micro-induction & methadone', () => {
    const zero = scoreOpioidWithdrawal({});
    assert.equal(zero.score, 0);
    assert.equal(zero.band, 'none_minimal');
    assert.equal(zero.navWithdrawalRisk, 'none');
    assert.match(zero.bupGuidance, /precipitated withdrawal/i);
    assert.match(zero.bupGuidance, /Bernese|#\/medications/i);
    assert.match(zero.bupGuidance, /methadone/i);
  });

  it('scores mild withdrawal (5–12) and highlights fentanyl lipophilicity and micro-induction options', () => {
    const mild = scoreOpioidWithdrawal({
      restlessness: 2,
      sweating_chills: 2,
      muscle_bone_aches: 2,
      anxiety_irritability: 2,
      yawning_insomnia: 1,
    });
    assert.equal(mild.score, 9);
    assert.equal(mild.band, 'mild');
    assert.equal(mild.navWithdrawalRisk, 'mild');
    assert.match(mild.bupGuidance, /fentanyl/i);
    assert.match(mild.bupGuidance, /Bernese|#\/medications/i);
  });

  it('scores moderate (13–20), moderately_severe (21–24), and severe (>= 25) withdrawal accurately and supports boolean inputs', () => {
    const moderate = scoreOpioidWithdrawal({
      restlessness: true,
      sweating_chills: true,
      muscle_bone_aches: true,
      gi_upset: true,
      runny_nose_tearing: true,
      tremor_gooseflesh: true,
      anxiety_irritability: true,
    });
    assert.equal(moderate.score, 14);
    assert.equal(moderate.band, 'moderate');
    assert.equal(moderate.navWithdrawalRisk, 'moderate');

    const modSevere = scoreOpioidWithdrawal({
      restlessness: 4,
      sweating_chills: 4,
      muscle_bone_aches: 4,
      gi_upset: 4,
      runny_nose_tearing: 2,
      tremor_gooseflesh: 2,
      anxiety_irritability: 2,
    });
    assert.equal(modSevere.score, 22);
    assert.equal(modSevere.band, 'moderately_severe');
    assert.equal(modSevere.navWithdrawalRisk, 'severe');

    const severe = scoreOpioidWithdrawal({
      restlessness: 4,
      sweating_chills: 4,
      muscle_bone_aches: 4,
      gi_upset: 4,
      runny_nose_tearing: 4,
      tremor_gooseflesh: 4,
      anxiety_irritability: 4,
      yawning_insomnia: 4,
    });
    assert.equal(severe.score, 32);
    assert.equal(severe.band, 'severe');
    assert.equal(severe.navWithdrawalRisk, 'severe');
    assert.match(severe.bupGuidance, /1306\.07\(b\)|72-Hour Rule/i);
  });
});

describe('scoreAlcoholSedativeRisk() — PAWSS / CIWA-Ar Informed GABAergic Risk Calculator', () => {
  it('returns low risk when no risk factors are present', () => {
    const low = scoreAlcoholSedativeRisk({});
    assert.equal(low.score, 0);
    assert.equal(low.riskLevel, 'low');
    assert.equal(low.navWithdrawalRisk, 'none');
    assert.match(low.guidance, /Outpatient|PMAT/i);
  });

  it('returns moderate risk for daily heavy use or tremor/sweating without severe red flags', () => {
    const mod = scoreAlcoholSedativeRisk({ dailyHeavyUse: true });
    assert.equal(mod.score, 2);
    assert.equal(mod.riskLevel, 'moderate');
    assert.equal(mod.navWithdrawalRisk, 'moderate');
    assert.match(mod.guidance, /seizure|DT/i);
  });

  it('returns high_seizure_dt_risk and severe navWithdrawalRisk for prior seizures/DTs, autonomic instability, or combined high score', () => {
    const priorSeizure = scoreAlcoholSedativeRisk({ priorSeizuresOrDTs: true });
    assert.equal(priorSeizure.score, 4);
    assert.equal(priorSeizure.riskLevel, 'high_seizure_dt_risk');
    assert.equal(priorSeizure.navWithdrawalRisk, 'severe');
    assert.match(priorSeizure.guidance, /cold turkey|3\.7-WM|4\.0/i);

    const autonomic = scoreAlcoholSedativeRisk({ autonomicInstability: true });
    assert.equal(autonomic.riskLevel, 'high_seizure_dt_risk');
    assert.equal(autonomic.navWithdrawalRisk, 'severe');
  });
});

describe('formatAsamHandoffText() — Clinician Handoff & Referral Summary Formatter', () => {
  it('formats a complete, structured ASAM 4th Edition plain-text summary with dimensions, red flags, SAMHSA codes, and crisis lines', () => {
    const answers = {
      substances: ['opioids', 'xylazine'],
      withdrawalRisk: 'moderate',
      biomedical: 'pregnant',
      mentalHealth: 'mild_moderate',
      environment: 'unstable',
      structureNeeded: '24_hour',
      payment: 'MD',
      preferTelehealth: true,
    };
    const evaluation = evaluateAsamCare(answers);
    const text = formatAsamHandoffText(answers, evaluation);

    assert.match(text, /HARBORPATH — MY SELF-REPORTED ANSWERS TO SHARE WITH A CLINICIAN/);
    assert.ok(text.includes(evaluation.asamLevel), 'Handoff note must include recommended ASAM level');
    assert.match(text, /Dimension 1/i);
    assert.match(text, /Dimension 2/i);
    assert.match(text, /Dimension 3/i);
    assert.match(text, /Dimension 4 & 5/i);
    assert.match(text, /Dimension 6/i);
    assert.match(text, /SAFETY ALERTS BASED ON MY ANSWERS/);
    assert.match(text, /PW \(Pregnant \/ Postpartum Specialty\)/);
    assert.match(text, /BU \(Buprenorphine/);
    assert.match(text, /988/);
    assert.match(text, /1-800-662-4357/);
    assert.match(text, /21 CFR 1306\.07\(b\)/);
  });
});
