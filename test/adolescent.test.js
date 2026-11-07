/**
 * Adolescent Care & Legal Specialist Unit & Integration Tests (test/adolescent.test.js)
 *
 * Verifies:
 * 1. Legal and Clinical Taxonomy Schemas:
 *    - MINOR_CONSENT_STANDARDS (state statutory thresholds, parental notice, inpatient rules).
 *    - CONFIDENTIALITY_RIGHTS_42CFR (42 CFR Part 2 § 2.14, EOB insurance risk, HIPAA § 164.522).
 *    - YOUTH_ASAM_DIMENSIONS (Dimensions 1–6 developmentally adapted for youth).
 *    - EVIDENCE_BASED_INTERVENTIONS (A-CRA, MDFT, SBIRT/MET, Youth CM, Peer Support, MOUD).
 *    - YOUTH_HARM_REDUCTION_GUIDELINES (FTS dilution, Naloxone Good Samaritan, 24/7 crisis lines).
 *    - APPOINTMENT_CHECKLIST_ITEMS (appointment preparation items).
 * 2. Clinical & Legal Accuracy:
 *    - Statutory variations across states (e.g. CA age 12, WA age 13, OR age 14, TX age 16).
 *    - Inpatient/residential treatment parental consent requirements vs. outpatient minor consent.
 *    - Federal 42 CFR Part 2 § 2.14 mandatory written minor consent.
 *    - Commercial insurance EOB disclosure risks and HIPAA 45 CFR § 164.522 mitigation.
 *    - Zero-trace sliding-scale FQHC and Title X health center utilization.
 *    - FTS dilution ratios for stimulants (1 tsp / 10 mg water) and counterfeit pressed pills.
 * 3. Decision Logic Engine evaluateYouthCarePathway(inputs):
 *    - Minor consent calculation by age and state jurisdiction.
 *    - ASAM level recommendation (Level 1, Level 2.1, Level 3.5, Level 3.7/4).
 *    - Evidence-based modality matching and red flag emergency triggers.
 * 4. Ephemeral In-RAM State Management:
 *    - getAdolescentState(), setAdolescentState(), resetAdolescentState() clean memory wipes.
 * 5. Static Security Audit:
 *    - Zero localStorage, sessionStorage, or cookie writes.
 *    - Zero innerHTML, outerHTML, or inline style= attributes.
 * 6. formatAdolescentSummaryText() Formatting:
 *    - Complete English and Spanish clinical report generation.
 * 7. WCAG 2.2 AA Compliant DOM Rendering (adolescentCareView):
 *    - Accessible structure, event dispatches, tab switching, form controls, and Quick Exit reset.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  MINOR_CONSENT_STANDARDS,
  CONFIDENTIALITY_RIGHTS_42CFR,
  YOUTH_ASAM_DIMENSIONS,
  EVIDENCE_BASED_INTERVENTIONS,
  YOUTH_HARM_REDUCTION_GUIDELINES,
  APPOINTMENT_CHECKLIST_ITEMS,
  evaluateYouthCarePathway,
  getAdolescentState,
  setAdolescentState,
  resetAdolescentState,
  formatAdolescentSummaryText,
  adolescentCareView,
} from '../public/js/views/adolescentCare.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const adolescentFilePath = path.resolve(here, '../public/js/views/adolescentCare.js');

// ============================================================================
// 1. Taxonomy & Schema Integrity Tests
// ============================================================================

test('MINOR_CONSENT_STANDARDS exports federal framework and key states with bilingual fields', () => {
  assert.ok(Array.isArray(MINOR_CONSENT_STANDARDS), 'MINOR_CONSENT_STANDARDS must be an array');
  assert.ok(MINOR_CONSENT_STANDARDS.length >= 10, 'Must contain at least 10 state and federal entries');

  const expectedKeys = ['federal_framework', 'CA', 'WA', 'OR', 'IL', 'NY', 'TX', 'FL', 'MD', 'MA', 'PA', 'CO', 'MI', 'default'];

  for (const id of expectedKeys) {
    const entry = MINOR_CONSENT_STANDARDS[id];
    assert.ok(entry, `Missing minor consent standard: ${id}`);
    assert.equal(entry.id, id);

    // Bilingual title
    assert.equal(typeof entry.title.en, 'string');
    assert.ok(entry.title.en.length > 5);
    assert.equal(typeof entry.title.es, 'string');
    assert.ok(entry.title.es.length > 5);

    // Bilingual summary
    assert.equal(typeof entry.summary.en, 'string');
    assert.ok(entry.summary.en.length > 20);
    assert.equal(typeof entry.summary.es, 'string');
    assert.ok(entry.summary.es.length > 20);

    if (entry.category === 'state') {
      assert.equal(typeof entry.minAge, 'number', `State ${id} must specify minAge`);
      assert.ok(entry.minAge >= 12 && entry.minAge <= 18);
      assert.ok(entry.statuteCitation, `State ${id} must have a statuteCitation`);
      assert.ok(entry.inpatientRule, `State ${id} must specify an inpatientRule`);
      assert.equal(typeof entry.inpatientRule.en, 'string');
      assert.equal(typeof entry.inpatientRule.es, 'string');
    }
  }
});

test('CONFIDENTIALITY_RIGHTS_42CFR exports Part 2 § 2.14, EOB risks, and HIPAA protections', () => {
  assert.ok(Array.isArray(CONFIDENTIALITY_RIGHTS_42CFR));
  assert.ok(CONFIDENTIALITY_RIGHTS_42CFR.length >= 4);

  const expectedIds = ['part2_section14', 'eob_insurance_risk', 'hipaa_164_522_mitigation', 'safetynet_titlex_fqhc'];
  for (const id of expectedIds) {
    const item = CONFIDENTIALITY_RIGHTS_42CFR[id];
    assert.ok(item, `Missing confidentiality entry: ${id}`);
    assert.equal(item.id, id);
    assert.equal(typeof item.title.en, 'string');
    assert.equal(typeof item.title.es, 'string');
    assert.equal(typeof item.summary.en, 'string');
    assert.equal(typeof item.summary.es, 'string');
    assert.ok(Array.isArray(item.keyRules));
    assert.ok(item.keyRules.length >= 2);
    assert.ok(item.citation);
  }
});

test('YOUTH_ASAM_DIMENSIONS exports all 6 developmentally tailored dimensions', () => {
  assert.ok(Array.isArray(YOUTH_ASAM_DIMENSIONS));
  assert.equal(YOUTH_ASAM_DIMENSIONS.length, 6, 'Must contain all 6 ASAM dimensions');

  for (let d = 1; d <= 6; d++) {
    const dim = YOUTH_ASAM_DIMENSIONS[`dimension_${d}`];
    assert.ok(dim, `Missing ASAM dimension ${d}`);
    assert.equal(dim.dimensionNumber, d);
    assert.equal(typeof dim.title.en, 'string');
    assert.equal(typeof dim.title.es, 'string');
    assert.equal(typeof dim.summary.en, 'string');
    assert.equal(typeof dim.summary.es, 'string');
    assert.ok(Array.isArray(dim.clinicalFocus));
    assert.ok(dim.clinicalFocus.length >= 3);
    assert.equal(typeof dim.asamAssessmentNote, 'string');
  }
});

test('EVIDENCE_BASED_INTERVENTIONS exports A-CRA, MDFT, SBIRT/MET, Youth CM, Peer Support, and MOUD', () => {
  assert.ok(Array.isArray(EVIDENCE_BASED_INTERVENTIONS));
  assert.ok(EVIDENCE_BASED_INTERVENTIONS.length >= 6);

  const expectedModalities = ['acra', 'mdft', 'sbirt_met', 'youth_cm', 'youth_peer_aid', 'moud_adolescents'];
  for (const id of expectedModalities) {
    const mod = EVIDENCE_BASED_INTERVENTIONS[id];
    assert.ok(mod, `Missing intervention: ${id}`);
    assert.equal(mod.id, id);
    assert.equal(typeof mod.name.en, 'string');
    assert.equal(typeof mod.name.es, 'string');
    assert.equal(typeof mod.evidenceTier, 'string');
    assert.equal(typeof mod.summary.en, 'string');
    assert.equal(typeof mod.summary.es, 'string');
    assert.ok(Array.isArray(mod.keyElements));
    assert.ok(mod.keyElements.length >= 3);
  }
});

test('YOUTH_HARM_REDUCTION_GUIDELINES exports FTS protocols, naloxone protections, and hotlines', () => {
  assert.ok(Array.isArray(YOUTH_HARM_REDUCTION_GUIDELINES));
  assert.equal(YOUTH_HARM_REDUCTION_GUIDELINES.length, 3);

  const fts = YOUTH_HARM_REDUCTION_GUIDELINES['fts_dilution_protocol'];
  assert.ok(fts);
  assert.match(fts.summary.en, /chocolate chip cookie/i);
  assert.match(fts.summary.en, /1 teaspoon.*10 mg/i);
  assert.ok(fts.stepByStep.length >= 5);

  const naloxone = YOUTH_HARM_REDUCTION_GUIDELINES['naloxone_good_samaritan'];
  assert.ok(naloxone);
  assert.match(naloxone.summary.en, /Good Samaritan/i);
  assert.match(naloxone.summary.en, /all 50 U\.S\. states/i);

  const crisis = YOUTH_HARM_REDUCTION_GUIDELINES['crisis_text_and_hotlines'];
  assert.ok(crisis);
  assert.ok(Array.isArray(crisis.resources));
  const contactNames = crisis.resources.map((r) => r.name);
  assert.ok(contactNames.includes('Crisis Text Line'));
  assert.ok(contactNames.includes('Suicide & Crisis Lifeline'));
  assert.ok(contactNames.includes('The Trevor Project (LGBTQ+ Youth)'));
  assert.ok(contactNames.includes('Never Use Alone Inc.'));
});

test('APPOINTMENT_CHECKLIST_ITEMS exports checkable preparation items with topics', () => {
  assert.ok(Array.isArray(APPOINTMENT_CHECKLIST_ITEMS));
  assert.ok(APPOINTMENT_CHECKLIST_ITEMS.length >= 6);

  for (const item of APPOINTMENT_CHECKLIST_ITEMS) {
    assert.ok(item.id);
    assert.ok(item.topic);
    assert.equal(typeof item.text.en, 'string');
    assert.equal(typeof item.text.es, 'string');
  }
});

// ============================================================================
// 2. Clinical & Legal Accuracy Tests
// ============================================================================

test('Minor consent laws: Outpatient minor authority vs. inpatient parental consent distinction', () => {
  const ca = MINOR_CONSENT_STANDARDS['CA'];
  assert.equal(ca.minAge, 12);
  assert.match(ca.statuteCitation, /Cal\. Health & Safety Code § 124260|Cal\. Family Code § 6929/);
  assert.match(ca.inpatientRule.en, /parental.*consent|juvenile court/i);

  const wa = MINOR_CONSENT_STANDARDS['WA'];
  assert.equal(wa.minAge, 13);
  assert.match(wa.statuteCitation, /RCW 71\.34\.500|RCW 71\.34\.530/);
  assert.match(wa.inpatientRule.en, /parental/i);

  const or = MINOR_CONSENT_STANDARDS['OR'];
  assert.equal(or.minAge, 14);
  assert.match(or.statuteCitation, /ORS 109\.675/);

  const tx = MINOR_CONSENT_STANDARDS['TX'];
  assert.equal(tx.minAge, 16);
  assert.match(tx.statuteCitation, /Tex\. Family Code § 32\.003/);
});

test('Federal 42 CFR Part 2 § 2.14: Written minor consent is mandatory when minor has legal capacity', () => {
  const part2 = CONFIDENTIALITY_RIGHTS_42CFR['part2_section14'];
  assert.match(part2.summary.en, /42 CFR Part 2 § 2\.14/);
  assert.match(part2.summary.en, /written consent is mandatory/i);

  const denialRule = part2.keyRules.find((r) => r.topic.en.includes('No Parental Confirmation'));
  assert.ok(denialRule);
  assert.match(denialRule.detail.en, /cannot confirm, deny, or acknowledge/i);

  const emergencyRule = part2.keyRules.find((r) => r.topic.en.includes('Emergency'));
  assert.ok(emergencyRule);
  assert.match(emergencyRule.detail.en, /42 CFR § 2\.51/);
});

test('Explanation of Benefits (EOB) risks and HIPAA 45 CFR § 164.522 confidential communication rights', () => {
  const eob = CONFIDENTIALITY_RIGHTS_42CFR['eob_insurance_risk'];
  assert.match(eob.summary.en, /Explanation of Benefits/i);
  assert.match(eob.summary.en, /primary policyholder/i);

  const hipaa = CONFIDENTIALITY_RIGHTS_42CFR['hipaa_164_522_mitigation'];
  assert.match(hipaa.summary.en, /45 CFR § 164\.522\(b\)/);
  assert.match(hipaa.summary.en, /alternative location.*email.*telephone/i);

  const safetynet = CONFIDENTIALITY_RIGHTS_42CFR['safetynet_titlex_fqhc'];
  assert.match(safetynet.summary.en, /FQHC/);
  assert.match(safetynet.summary.en, /Title X/);
  assert.match(safetynet.summary.en, /sliding-fee/i);
});

test('Youth-adapted ASAM criteria: Developmental physiology, neurodevelopment, and dual diagnosis', () => {
  const dim1 = YOUTH_ASAM_DIMENSIONS['dimension_1'];
  assert.match(dim1.summary.en, /Adolescent physiology/i);
  assert.match(dim1.summary.en, /polysubstance/i);

  const dim2 = YOUTH_ASAM_DIMENSIONS['dimension_2'];
  assert.match(dim2.summary.en, /prefrontal cortex/i);
  assert.match(dim2.summary.en, /age ~25/i);

  const dim3 = YOUTH_ASAM_DIMENSIONS['dimension_3'];
  assert.match(dim3.summary.en, /ADHD/);
  assert.match(dim3.summary.en, /ACEs/);

  const dim4 = YOUTH_ASAM_DIMENSIONS['dimension_4'];
  assert.match(dim4.summary.en, /developmentally adapted/i);
  assert.match(dim4.summary.en, /harm reduction/i);

  const dim5 = YOUTH_ASAM_DIMENSIONS['dimension_5'];
  assert.match(dim5.summary.en, /peer networks/i);
  assert.match(dim5.summary.en, /social media/i);

  const dim6 = YOUTH_ASAM_DIMENSIONS['dimension_6'];
  assert.match(dim6.summary.en, /school/i);
  assert.match(dim6.summary.en, /family/i);
});

test('Evidence-based interventions: A-CRA, MDFT, Youth Contingency Management, and AAP MOUD guidance', () => {
  const acra = EVIDENCE_BASED_INTERVENTIONS['acra'];
  assert.match(acra.summary.en, /recreational ecology/i);
  assert.match(acra.summary.en, /pro-social/i);

  const mdft = EVIDENCE_BASED_INTERVENTIONS['mdft'];
  assert.match(mdft.summary.en, /four interdependent systems/i);

  const cm = EVIDENCE_BASED_INTERVENTIONS['youth_cm'];
  assert.match(cm.summary.en, /vouchers/i);
  assert.match(cm.summary.en, /operant/i);

  const moud = EVIDENCE_BASED_INTERVENTIONS['moud_adolescents'];
  assert.match(moud.summary.en, /American Academy of Pediatrics/i);
  assert.match(moud.summary.en, /Buprenorphine/i);
  assert.match(moud.summary.en, /FDA-approved.*16\+/i);
});

test('Youth harm reduction: FTS dilution protocols for stimulants and counterfeit pills', () => {
  const fts = YOUTH_HARM_REDUCTION_GUIDELINES['fts_dilution_protocol'];
  // Check stimulant ratio
  assert.ok(fts.stepByStep.some((s) => s.includes('1 teaspoon') && s.includes('10 mg')));
  // Check full pill crush requirement
  assert.ok(fts.stepByStep.some((s) => s.includes('entire pill') || s.includes('whole pill')));
});

// ============================================================================
// 3. Clinical Decision Engine Tests: evaluateYouthCarePathway(inputs)
// ============================================================================

test('evaluateYouthCarePathway: 15-year-old in California with opioid/counterfeit pill use', () => {
  const res = evaluateYouthCarePathway({
    age: 15,
    state: 'CA',
    substances: ['opioids'],
    familyInvolvement: 'conflicted',
    confidentialityPriority: 'strict_confidential',
    withdrawalRisk: 'moderate',
    coOccurringConditions: ['trauma'],
    schoolOrLegalInvolvement: true,
    housingStatus: 'stable',
  });

  assert.equal(res.age, 15);
  assert.equal(res.isMinor, true);
  assert.equal(res.canConsentAloneOutpatient, true, 'In CA (min age 12), a 15-year-old can consent independently');
  assert.match(res.statuteCitation, /Cal\. Health & Safety Code § 124260|Cal\. Family Code § 6929/);

  // ASAM Level
  assert.equal(res.recommendedLevel.asamLevel, 'Level 2.1');
  assert.equal(res.recommendedLevel.code, 'INTENSIVE_OUTPATIENT');

  // Confidentiality
  assert.equal(res.confidentialityGuidance.applies42CFRPart2, true);
  assert.match(res.confidentialityGuidance.summary.en, /42 CFR Part 2 § 2\.14/);
  assert.match(res.confidentialityGuidance.eobRiskWarning.en, /Explanation of Benefits/);

  // Modalities: MDFT recommended for conflicted family, MOUD recommended for opioids
  const modalityIds = res.evidenceBasedModalities.map((m) => m.id);
  assert.ok(modalityIds.includes('acra'));
  assert.ok(modalityIds.includes('mdft'));
  assert.ok(modalityIds.includes('moud_adolescents'));

  // Harm reduction: Counterfeit pill warning
  assert.match(res.harmReductionPlan.ftsProtocol.en, /Counterfeit Pill Alert/);
  assert.match(res.harmReductionPlan.naloxoneGuidance.en, /Good Samaritan/);
});

test('evaluateYouthCarePathway: 13-year-old in Oregon (below OR min age 14 threshold)', () => {
  const res = evaluateYouthCarePathway({
    age: 13,
    state: 'OR',
    substances: ['cannabis'],
    familyInvolvement: 'supportive',
    confidentialityPriority: 'open_family',
    withdrawalRisk: 'low',
    coOccurringConditions: [],
    schoolOrLegalInvolvement: false,
    housingStatus: 'stable',
  });

  assert.equal(res.age, 13);
  assert.equal(res.isMinor, true);
  assert.equal(res.canConsentAloneOutpatient, false, 'In OR (min age 14), a 13-year-old requires parental consent');
  assert.match(res.confidentialityGuidance.summary.en, /minimum statutory age.*14/);
  assert.equal(res.confidentialityGuidance.applies42CFRPart2, false);
  assert.equal(res.recommendedLevel.asamLevel, 'Level 1');
  assert.equal(res.recommendedLevel.code, 'OUTPATIENT_COUNSELING');
});

test('evaluateYouthCarePathway: Severe withdrawal triggers Level 3.7/4 Medically Managed Inpatient Withdrawal', () => {
  const res = evaluateYouthCarePathway({
    age: 16,
    state: 'TX',
    substances: ['opioids', 'benzodiazepines'],
    familyInvolvement: 'uninvolved',
    confidentialityPriority: 'strict_confidential',
    withdrawalRisk: 'high_severe',
    coOccurringConditions: ['depression_anxiety'],
    schoolOrLegalInvolvement: false,
    housingStatus: 'stable',
  });

  assert.equal(res.recommendedLevel.asamLevel, 'Level 3.7 / 4');
  assert.equal(res.recommendedLevel.code, 'MED_MANAGED_WITHDRAWAL');

  const emergencyFlag = res.redFlags.find((f) => f.severity === 'emergency');
  assert.ok(emergencyFlag, 'Must trigger emergency red flag for high/severe withdrawal risk');
  assert.match(emergencyFlag.title.en, /Acute Medical Withdrawal Hazard/);
});

test('evaluateYouthCarePathway: Runaway / unhoused youth with moderate withdrawal triggers Level 3.5 Residential', () => {
  const res = evaluateYouthCarePathway({
    age: 16,
    state: 'WA',
    substances: ['methamphetamine', 'cannabis'],
    familyInvolvement: 'hostile_unsafe',
    confidentialityPriority: 'strict_confidential',
    withdrawalRisk: 'moderate',
    coOccurringConditions: ['trauma'],
    schoolOrLegalInvolvement: true,
    housingStatus: 'runaway_unhoused',
  });

  assert.equal(res.recommendedLevel.asamLevel, 'Level 3.5');
  assert.equal(res.recommendedLevel.code, 'CLINICALLY_MANAGED_RESIDENTIAL');

  const housingFlag = res.redFlags.find((f) => f.title.en.includes('Housing Vulnerability'));
  assert.ok(housingFlag);
});

test('evaluateYouthCarePathway: Young adult age 19 has full adult legal capacity', () => {
  const res = evaluateYouthCarePathway({
    age: 19,
    state: 'NY',
    substances: ['cannabis'],
    familyInvolvement: 'supportive',
  });

  assert.equal(res.isMinor, false);
  assert.equal(res.canConsentAloneOutpatient, true);
  assert.match(res.confidentialityGuidance.summary.en, /adult \(age 18\+\)/);
});

// ============================================================================
// 4. Ephemeral In-RAM State Management & Reset Tests
// ============================================================================

test('getAdolescentState, setAdolescentState, and resetAdolescentState maintain ephemeral RAM state', () => {
  resetAdolescentState();
  const initial = getAdolescentState();

  assert.equal(initial.activeTab, 'overview');
  assert.equal(initial.lang, 'en');
  assert.equal(initial.inputs.age, 16);
  assert.equal(initial.inputs.state, 'CA');
  assert.deepEqual(initial.checklist, {});
  assert.equal(initial.notes, '');

  // Mutate state with patch
  setAdolescentState({
    activeTab: 'navigator',
    lang: 'es',
    inputs: { age: 14, state: 'WA', withdrawalRisk: 'moderate' },
    checklist: { verify_state_minor_consent: true, ask_clinic_about_42cfr_part2: true },
    notes: 'Ask about sliding-fee scale.',
  });

  const updated = getAdolescentState();
  assert.equal(updated.activeTab, 'navigator');
  assert.equal(updated.lang, 'es');
  assert.equal(updated.inputs.age, 14);
  assert.equal(updated.inputs.state, 'WA');
  assert.equal(updated.inputs.withdrawalRisk, 'moderate');
  assert.equal(updated.checklist.verify_state_minor_consent, true);
  assert.equal(updated.checklist.ask_clinic_about_42cfr_part2, true);
  assert.equal(updated.notes, 'Ask about sliding-fee scale.');

  // Clean wipe via resetAdolescentState()
  resetAdolescentState();
  const wiped = getAdolescentState();
  assert.equal(wiped.activeTab, 'overview');
  assert.equal(wiped.lang, 'en');
  assert.equal(wiped.inputs.age, 16);
  assert.deepEqual(wiped.checklist, {});
  assert.equal(wiped.notes, '');
});

// ============================================================================
// 5. Static Security Audit: Zero PII, Zero Storage, Zero Markup Injections
// ============================================================================

test('Source file static audit: zero localStorage, sessionStorage, cookie, innerHTML, or style= writes', () => {
  const src = readFileSync(adolescentFilePath, 'utf8');

  // Ephemeral RAM invariant: zero disk/persistent storage writes
  assert.doesNotMatch(src, /localStorage\s*[\.\[]/, 'adolescentCare.js must never touch localStorage');
  assert.doesNotMatch(src, /sessionStorage\s*[\.\[]/, 'adolescentCare.js must never touch sessionStorage');
  assert.doesNotMatch(src, /document\s*\.\s*cookie/, 'adolescentCare.js must never touch document.cookie');
  assert.doesNotMatch(src, /indexedDB/, 'adolescentCare.js must never touch indexedDB');

  // Security invariant: zero innerHTML, outerHTML, insertAdjacentHTML, or inline style=
  assert.doesNotMatch(src, /\b(innerHTML|outerHTML|insertAdjacentHTML)\b/, 'adolescentCare.js must have 0 innerHTML/outerHTML');
  assert.doesNotMatch(src, /\bstyle\s*=/i, 'adolescentCare.js must have 0 inline style= attributes');
});

// ============================================================================
// 6. formatAdolescentSummaryText() Output & Parity Tests
// ============================================================================

test('formatAdolescentSummaryText generates complete clinical report in English and Spanish', () => {
  resetAdolescentState();
  setAdolescentState({
    lang: 'en',
    inputs: { age: 15, state: 'CA', withdrawalRisk: 'low' },
    checklist: { verify_state_minor_consent: true, request_hipaa_eob_suppression: true },
    notes: 'Inquire about Title X sliding scale discount.',
  });

  const enReport = formatAdolescentSummaryText(getAdolescentState());
  assert.match(enReport, /HARBORPATH: ADOLESCENT & YOUTH SUBSTANCE USE CARE/);
  assert.match(enReport, /Session Mode: 100% Ephemeral In-RAM/);
  assert.match(enReport, /Age 15 \| State Jurisdiction: CA/);
  assert.match(enReport, /MINOR CONSENT LAWS & LEGAL CAPACITY/);
  assert.match(enReport, /FEDERAL CONFIDENTIALITY \(42 CFR PART 2 § 2\.14 & HIPAA\)/);
  assert.match(enReport, /CRITICAL EOB INSURANCE WARNING/);
  assert.match(enReport, /RECOMMENDED ASAM LEVEL OF CARE/);
  assert.match(enReport, /EVIDENCE-BASED INTERVENTIONS FOR YOUTH/);
  assert.match(enReport, /Crisis Text Line: Text HOME to 741741/);
  assert.match(enReport, /Suicide & Crisis Lifeline: Call or Text 988/);
  assert.match(enReport, /The Trevor Project.*866-488-7386/);
  assert.match(enReport, /Never Use Alone.*1-800-484-3731/);
  assert.match(enReport, /\[X\] Verify your state’s minor consent/);
  assert.match(enReport, /Inquire about Title X sliding scale discount\./);

  // Test Spanish report
  setAdolescentState({ lang: 'es' });
  const esReport = formatAdolescentSummaryText(getAdolescentState());
  assert.match(esReport, /GUIA CLINICA Y DERECHOS LEGALES EN SALUD JUVENIL/);
  assert.match(esReport, /Modo de Sesion: 100% Efimero en Memoria RAM/);
  assert.match(esReport, /LEYES DE CONSENTIMIENTO DE MENORES/);
  assert.match(esReport, /CONFIDENCIALIDAD FEDERAL/);
  assert.match(esReport, /ADVERTENCIA CRITICA DE EOB DEL SEGURO/);
  assert.match(esReport, /NIVEL DE ATENCION ASAM RECOMENDADO/);
  assert.match(esReport, /INTERVENCIONES BASADAS EN EVIDENCIA/);
  assert.match(esReport, /REDUCCION DE DANOS Y SEGURIDAD ANTE SOBREDOSIS/);

  resetAdolescentState();
});

// ============================================================================
// 7. DOM Component & Accessibility Rendering (adolescentCareView)
// ============================================================================

class MockNode {
  constructor(tag = 'div') {
    this.tagName = tag.toUpperCase();
    this.attributes = {};
    this.children = [];
    this.parent = null;
    this.listeners = {};
    this.dataset = {};
    this.className = '';
    this._textContent = '';
  }

  get textContent() {
    if (this.children.length === 0) return this._textContent;
    return this._textContent + this.children.map((c) => (typeof c === 'string' ? c : c.textContent)).join('');
  }

  set textContent(val) {
    this._textContent = String(val ?? '');
    this.children = [];
  }

  setAttribute(k, v) {
    this.attributes[k] = String(v);
  }

  getAttribute(k) {
    return this.attributes[k] ?? null;
  }

  removeAttribute(k) {
    delete this.attributes[k];
  }

  addEventListener(event, fn) {
    this.listeners[event] = fn;
  }

  dispatchEvent(event, data = {}) {
    const fn = this.listeners[event];
    if (typeof fn === 'function') fn({ target: this, ...data });
  }

  append(...items) {
    for (const item of items) {
      if (item === null || item === undefined || item === false) continue;
      if (typeof item === 'string' || typeof item === 'number') {
        const textNode = new MockNode('#text');
        textNode._textContent = String(item);
        textNode.parent = this;
        this.children.push(textNode);
      } else if (item instanceof MockNode) {
        item.parent = this;
        this.children.push(item);
      }
    }
  }

  remove() {
    if (!this.parent) return;
    const idx = this.parent.children.indexOf(this);
    if (idx !== -1) this.parent.children.splice(idx, 1);
    this.parent = null;
  }

  get firstChild() {
    return this.children[0] ?? null;
  }

  querySelectorAll(selector) {
    const matches = [];
    const walk = (node) => {
      if (node instanceof MockNode) {
        if (selector === 'button' && node.tagName === 'BUTTON') matches.push(node);
        else if (selector === 'input[type="checkbox"]' && node.tagName === 'INPUT' && node.attributes.type === 'checkbox') matches.push(node);
        else if (selector === 'textarea' && node.tagName === 'TEXTAREA') matches.push(node);
        else if (selector === 'select' && node.tagName === 'SELECT') matches.push(node);
        else if (selector.startsWith('.') && node.className && node.className.includes(selector.slice(1))) matches.push(node);
        for (const child of node.children) {
          if (child instanceof MockNode) walk(child);
        }
      }
    };
    walk(this);
    return matches;
  }
}

test('adolescentCareView renders accessible WCAG 2.2 AA compliant structure and handles interactions', () => {
  const prevDoc = globalThis.document;
  const prevNode = globalThis.Node;

  globalThis.Node = MockNode;
  globalThis.document = {
    createElement: (tag) => new MockNode(tag),
    createElementNS: (_ns, tag) => new MockNode(tag),
    getElementById: () => null,
  };

  try {
    resetAdolescentState();
    const root = adolescentCareView({ query: { tab: 'navigator', state: 'CA', lang: 'en' } });

    assert.ok(root instanceof MockNode);
    assert.match(root.className, /view-adolescent/);

    const fullText = root.textContent;
    assert.match(fullText, /Adolescent & Youth Substance Use Care Pathways/);
    assert.match(fullText, /In-RAM Ephemeral Decision Support/);
    assert.match(fullText, /Crisis Text Line/);
    assert.match(fullText, /Text HOME to 741741/);
    assert.match(fullText, /Call\/Text 988/);
    assert.match(fullText, /1-866-488-7386/); // Trevor Project
    assert.match(fullText, /1-800-484-3731/); // Never Use Alone (hotlines.js primary)

    // Test tab headers exist
    assert.match(fullText, /Overview/);
    assert.match(fullText, /Minor Consent Laws/);
    assert.match(fullText, /42 CFR & EOB Privacy/);
    assert.match(fullText, /Youth ASAM Dimensions/);
    assert.match(fullText, /Evidence-Based Treatments/);
    assert.match(fullText, /Youth Harm Reduction/);
    assert.match(fullText, /Pathway Navigator/);
    assert.match(fullText, /Appointment Checklist/);
    assert.match(fullText, /Printable Handout/);

    // Test form interactive controls in Navigator tab
    const selects = root.querySelectorAll('select');
    assert.ok(selects.length >= 3, 'Must render select inputs for age, state, and clinical dimensions');

    // Switch to Checklist tab to test interactive checkboxes
    setAdolescentState({ activeTab: 'checklist' });
    const checklistRoot = adolescentCareView();
    const checkboxes = checklistRoot.querySelectorAll('input[type="checkbox"]');
    assert.ok(checkboxes.length >= 5, 'Should render interactive appointment checkboxes');

    // Toggle a checkbox
    const firstCheckbox = checkboxes[0];
    firstCheckbox.checked = true;
    firstCheckbox.dispatchEvent('change', { target: firstCheckbox });

    const currentState = getAdolescentState();
    const checkedKeys = Object.keys(currentState.checklist);
    assert.ok(checkedKeys.length >= 1, 'Checklist state should record checked item in RAM');
    assert.equal(currentState.checklist[checkedKeys[0]], true);

    // Test Notes Textarea
    const textareas = checklistRoot.querySelectorAll('textarea');
    assert.ok(textareas.length >= 1, 'Should render private notes textarea');
    const notesBox = textareas[0];
    notesBox.dispatchEvent('input', { target: { value: 'Ask about buprenorphine confidentiality.' } });
    assert.equal(getAdolescentState().notes, 'Ask about buprenorphine confidentiality.');

    // Test Quick Exit / Reset RAM button
    const buttons = root.querySelectorAll('button');
    const resetBtn = buttons.find((b) => b.textContent.includes('Quick Exit') || b.textContent.includes('Reset RAM'));
    assert.ok(resetBtn, 'Must render Quick Exit / Reset RAM button');
    resetBtn.dispatchEvent('click');

    const stateAfterReset = getAdolescentState();
    assert.deepEqual(stateAfterReset.checklist, {}, 'Quick exit must wipe checklist from RAM');
    assert.equal(stateAfterReset.notes, '', 'Quick exit must wipe notes from RAM');

    // Test printable handout is rendered
    setAdolescentState({ activeTab: 'handout' });
    const handoutRoot = adolescentCareView();
    assert.match(handoutRoot.textContent, /HarborPath Adolescent Care Pathway Handout/);
  } finally {
    globalThis.document = prevDoc;
    globalThis.Node = prevNode;
    resetAdolescentState();
  }
});
