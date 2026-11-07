/**
 * Veterans & Military Health Care Specialist Unit & Integration Tests (test/veterans.test.js)
 *
 * Verifies:
 * 1. Statutory Taxonomy Schemas:
 *    - VA_MISSION_ACT_RULES (38 U.S.C. § 1703, 38 C.F.R. § 17.4010, § 17.4040, § 1725A)
 *    - TRICARE_CARE_LEVELS (32 C.F.R. § 199.4, Prime vs Select, mandatory pre-auth levels)
 *    - MST_PROTECTIONS (38 U.S.C. § 1720D & § 1720I, OTH inclusivity, $0 copay, zero report required)
 * 2. Clinical and Legal Evaluation Engine: evaluateVeteransEligibility(inputs)
 *    - Primary/Mental Health/SUD Access Standards: 20 days / 30-minute average drive time.
 *    - Specialty / Residential Care Access Standards: 28 days / 60-minute average drive time.
 *    - Service unavailable at local VA facility.
 *    - Residing in state/territory without full-service VA facility (AK, HI, NH, GU, AS, MP, VI).
 *    - Best medical interest / clinical hardship standard.
 *    - Urgent Care Benefit (38 U.S.C. § 1725A): in-network CCN walk-in without prior auth.
 *    - TRICARE Prime vs Select pre-authorization differentiation across care levels.
 *    - Military Sexual Trauma (MST): 100% free, no service-connected rating, no report needed,
 *      Other Than Honorable (OTH) discharges fully eligible under § 1720I.
 *    - Defensive resilience against null, undefined, string numbers, and missing fields.
 * 3. Ephemeral In-RAM State Management:
 *    - getVeteransState(), setVeteransState(), resetVeteransState().
 *    - Static security audit: ZERO localStorage, sessionStorage, cookie, innerHTML, or inline style writes.
 * 4. Clinical Handout Formatter: formatVeteransSummaryText() in English and Spanish.
 * 5. Accessible DOM Construction: veteransView() mounting, crisis banner, link to #/treatment?codes=VET,
 *    tab switching, interactive screener controls, and Quick Exit reset.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  VA_MISSION_ACT_RULES,
  TRICARE_CARE_LEVELS,
  MST_PROTECTIONS,
  evaluateVeteransEligibility,
  getVeteransState,
  setVeteransState,
  resetVeteransState,
  formatVeteransSummaryText,
  veteransView,
} from '../public/js/views/veterans.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const veteransFilePath = path.resolve(here, '../public/js/views/veterans.js');

// ============================================================================
// 1. Statutory Taxonomy & Schema Integrity Tests
// ============================================================================

test('VA_MISSION_ACT_RULES exports all 6 statutory criteria with complete bilingual schemas', () => {
  assert.ok(Array.isArray(VA_MISSION_ACT_RULES), 'VA_MISSION_ACT_RULES must be an array');
  assert.ok(VA_MISSION_ACT_RULES.length >= 6, 'Must contain all 6 statutory community care pathways');

  const expectedCriteria = [
    'service_unavailable',
    'no_full_service_state',
    'grandfathered_choice',
    'access_standards',
    'best_medical_interest',
    'quality_standards',
  ];

  for (const id of expectedCriteria) {
    const criterion = VA_MISSION_ACT_RULES[id];
    assert.ok(criterion, `Missing criterion ID: ${id}`);
    assert.equal(criterion.id, id);

    // Bilingual title
    assert.equal(typeof criterion.title.en, 'string');
    assert.ok(criterion.title.en.length > 5);
    assert.equal(typeof criterion.title.es, 'string');
    assert.ok(criterion.title.es.length > 5);

    // Statutory citation
    assert.equal(typeof criterion.statute, 'string');
    assert.match(criterion.statute, /38 U\.S\.C\.|38 C\.F\.R\./);

    // Bilingual summary
    assert.equal(typeof criterion.summary.en, 'string');
    assert.ok(criterion.summary.en.length > 20);
    assert.equal(typeof criterion.summary.es, 'string');
    assert.ok(criterion.summary.es.length > 20);

    // Action advice
    assert.equal(typeof criterion.actionAdvice.en, 'string');
    assert.equal(typeof criterion.actionAdvice.es, 'string');
  }

  // Access Standards property
  assert.ok(VA_MISSION_ACT_RULES.ACCESS_STANDARDS, 'Must export ACCESS_STANDARDS metadata');
  const primaryStd = VA_MISSION_ACT_RULES.ACCESS_STANDARDS.primaryAndMentalHealth;
  assert.equal(primaryStd.maxWaitDays, 20);
  assert.equal(primaryStd.maxDriveMinutes, 30);
  assert.match(primaryStd.citation, /38 C\.F\.R\. § 17\.4040/);

  const specialtyStd = VA_MISSION_ACT_RULES.ACCESS_STANDARDS.specialtyCare;
  assert.equal(specialtyStd.maxWaitDays, 28);
  assert.equal(specialtyStd.maxDriveMinutes, 60);
  assert.match(specialtyStd.citation, /38 C\.F\.R\. § 17\.4040/);

  // Urgent Care benefit property (38 U.S.C. § 1725A)
  assert.ok(VA_MISSION_ACT_RULES.URGENT_CARE, 'Must export URGENT_CARE metadata');
  assert.match(VA_MISSION_ACT_RULES.URGENT_CARE.statute, /38 U\.S\.C\. § 1725A/);
  assert.equal(VA_MISSION_ACT_RULES.URGENT_CARE.prescriptionSupplyDays, 14);
  assert.equal(VA_MISSION_ACT_RULES.URGENT_CARE.emergencyHotline, '1-844-724-7842');
  assert.equal(VA_MISSION_ACT_RULES.URGENT_CARE.emergencyNotificationWindowHours, 72);
});

test('TRICARE_CARE_LEVELS exports care levels, plans, and authorization requirements', () => {
  assert.ok(Array.isArray(TRICARE_CARE_LEVELS), 'TRICARE_CARE_LEVELS must be an array');
  assert.ok(TRICARE_CARE_LEVELS.length >= 7, 'Must contain at least 7 care levels');

  const expectedLevels = [
    'outpatient_therapy',
    'obot',
    'otp',
    'iop',
    'php',
    'residential_sud',
    'inpatient_detox',
  ];

  for (const id of expectedLevels) {
    const lvl = TRICARE_CARE_LEVELS[id];
    assert.ok(lvl, `Missing TRICARE care level: ${id}`);
    assert.equal(lvl.id, id);
    assert.equal(typeof lvl.name.en, 'string');
    assert.equal(typeof lvl.name.es, 'string');
    assert.equal(typeof lvl.summary.en, 'string');
    assert.equal(typeof lvl.summary.es, 'string');
    assert.equal(typeof lvl.primeRequiresPreAuth, 'boolean');
    assert.equal(typeof lvl.selectRequiresPreAuth, 'boolean');
  }

  // Clinical & Statutory Invariants:
  // Residential SUD, Inpatient Detox, PHP, and IOP strictly require pre-authorization
  assert.equal(TRICARE_CARE_LEVELS['residential_sud'].primeRequiresPreAuth, true);
  assert.equal(TRICARE_CARE_LEVELS['residential_sud'].selectRequiresPreAuth, true);
  assert.equal(TRICARE_CARE_LEVELS['inpatient_detox'].primeRequiresPreAuth, true);
  assert.equal(TRICARE_CARE_LEVELS['inpatient_detox'].selectRequiresPreAuth, true);
  assert.equal(TRICARE_CARE_LEVELS['php'].primeRequiresPreAuth, true);
  assert.equal(TRICARE_CARE_LEVELS['php'].selectRequiresPreAuth, true);
  assert.equal(TRICARE_CARE_LEVELS['iop'].primeRequiresPreAuth, true);
  assert.equal(TRICARE_CARE_LEVELS['iop'].selectRequiresPreAuth, true);

  // Outpatient therapy and OBOT in-network do NOT require pre-authorization under Select
  assert.equal(TRICARE_CARE_LEVELS['outpatient_therapy'].selectRequiresPreAuth, false);
  assert.equal(TRICARE_CARE_LEVELS['obot'].selectRequiresPreAuth, false);

  // Plans metadata
  assert.ok(TRICARE_CARE_LEVELS.PLANS, 'Must export PLANS metadata');
  assert.equal(TRICARE_CARE_LEVELS.PLANS.prime.pcmRequired, true);
  assert.equal(TRICARE_CARE_LEVELS.PLANS.select.pcmRequired, false);

  // Regional Contractors metadata
  assert.ok(TRICARE_CARE_LEVELS.REGIONS, 'Must export REGIONS metadata');
  assert.equal(TRICARE_CARE_LEVELS.REGIONS.east.phone, '1-800-444-5445');
  assert.equal(TRICARE_CARE_LEVELS.REGIONS.west.phone, '1-888-874-9378');
  assert.equal(TRICARE_CARE_LEVELS.REGIONS.west.contractor, 'TriWest Healthcare Alliance');
});

test('MST_PROTECTIONS exports complete statutory rights under 38 U.S.C. § 1720D & § 1720I', () => {
  assert.ok(Array.isArray(MST_PROTECTIONS), 'MST_PROTECTIONS must be an array');
  assert.ok(MST_PROTECTIONS.length >= 7, 'Must contain at least 7 core MST protections');

  const expectedProtections = [
    'free_of_cost',
    'no_service_connection',
    'no_report_required',
    'oth_discharge_eligible',
    'gender_choice',
    'vet_centers',
    'mst_coordinators',
  ];

  for (const id of expectedProtections) {
    const item = MST_PROTECTIONS[id];
    assert.ok(item, `Missing MST protection: ${id}`);
    assert.equal(item.id, id);
    assert.equal(typeof item.title.en, 'string');
    assert.equal(typeof item.title.es, 'string');
    assert.equal(typeof item.summary.en, 'string');
    assert.equal(typeof item.summary.es, 'string');
    assert.equal(typeof item.statute, 'string');
  }

  // Statutory Invariants:
  // 1. 100% free of charge
  const free = MST_PROTECTIONS['free_of_cost'];
  assert.match(free.summary.en, /free of charge|100% free/i);
  assert.match(free.statute, /38 U\.S\.C\. § 1720D/);

  // 2. No service connection required
  const noRating = MST_PROTECTIONS['no_service_connection'];
  assert.match(noRating.summary.en, /service-connected disability rating/i);

  // 3. No incident report or military documentation required
  const noReport = MST_PROTECTIONS['no_report_required'];
  assert.match(noReport.summary.en, /never have to have reported/i);

  // 4. Other Than Honorable (OTH) discharges eligible under 38 U.S.C. § 1720I
  const oth = MST_PROTECTIONS['oth_discharge_eligible'];
  assert.match(oth.statute, /38 U\.S\.C\. § 1720I/);
  assert.match(oth.summary.en, /Other Than Honorable|OTH/);

  // 5. Crisis line metadata
  assert.ok(MST_PROTECTIONS.CRISIS_LINE);
  assert.equal(MST_PROTECTIONS.CRISIS_LINE.dial, '988');
  assert.equal(MST_PROTECTIONS.CRISIS_LINE.prompt, 'Press 1');
  assert.equal(MST_PROTECTIONS.CRISIS_LINE.text, '838255');
  assert.equal(MST_PROTECTIONS.CRISIS_LINE.chatUrl, 'https://www.veteranscrisisline.net/');
});

// ============================================================================
// 2. Clinical & Legal Evaluation Engine Tests (evaluateVeteransEligibility)
// ============================================================================

test('VA Community Care: accurately applies 20-day / 30-minute standard for primary & mental health care', () => {
  // Scenario A: Under the limits (10 days wait, 20 min drive) -> does not meet access standard
  const resA = evaluateVeteransEligibility({
    enrolledInVa: 'yes',
    careType: 'mental_health',
    vaWaitDays: 10,
    vaDriveMinutes: 20,
  });
  assert.equal(resA.vaCommunityCare.eligible, false);
  assert.equal(resA.vaCommunityCare.criteriaMatched.length, 0);

  // Scenario B: Drive time exceeds 30 minutes (35 min)
  const resB = evaluateVeteransEligibility({
    enrolledInVa: 'yes',
    careType: 'mental_health',
    vaWaitDays: 10,
    vaDriveMinutes: 35,
  });
  assert.equal(resB.vaCommunityCare.eligible, true);
  assert.ok(resB.vaCommunityCare.criteriaMatched.includes('access_standards_drive_time'));
  assert.match(resB.vaCommunityCare.reasons[0], /35 min.*30 min/i);

  // Scenario C: Wait time exceeds 20 days (25 days) for outpatient SUD
  const resC = evaluateVeteransEligibility({
    enrolledInVa: 'yes',
    careType: 'sud_outpatient',
    vaWaitDays: 25,
    vaDriveMinutes: 15,
  });
  assert.equal(resC.vaCommunityCare.eligible, true);
  assert.ok(resC.vaCommunityCare.criteriaMatched.includes('access_standards_wait_time'));
  assert.match(resC.vaCommunityCare.reasons[0], /25 days.*20 days/i);
});

test('VA Community Care: accurately applies 28-day / 60-minute standard for specialty & residential SUD care', () => {
  // Scenario A: 45 min drive time and 22 days wait
  // For primary care this would qualify by drive time (>30 min), but for specialty/residential standard is 60 min / 28 days!
  const resA = evaluateVeteransEligibility({
    enrolledInVa: 'yes',
    careType: 'sud_residential',
    vaWaitDays: 22,
    vaDriveMinutes: 45,
  });
  assert.equal(resA.vaCommunityCare.eligible, false);
  assert.equal(resA.vaCommunityCare.standards.driveMinutesLimit, 60);
  assert.equal(resA.vaCommunityCare.standards.waitDaysLimit, 28);

  // Scenario B: Inpatient detox with 65-minute drive time
  const resB = evaluateVeteransEligibility({
    enrolledInVa: 'yes',
    careType: 'detox',
    vaWaitDays: 5,
    vaDriveMinutes: 65,
  });
  assert.equal(resB.vaCommunityCare.eligible, true);
  assert.ok(resB.vaCommunityCare.criteriaMatched.includes('access_standards_drive_time'));

  // Scenario C: Residential SUD with 35-day wait time
  const resC = evaluateVeteransEligibility({
    enrolledInVa: 'yes',
    careType: 'sud_residential',
    vaWaitDays: 35,
    vaDriveMinutes: 20,
  });
  assert.equal(resC.vaCommunityCare.eligible, true);
  assert.ok(resC.vaCommunityCare.criteriaMatched.includes('access_standards_wait_time'));
});

test('VA Community Care: evaluates service unavailable, state without full VA hospital, and best medical interest', () => {
  // Service unavailable
  const resUnavailable = evaluateVeteransEligibility({
    enrolledInVa: 'yes',
    serviceUnavailableAtVa: true,
  });
  assert.equal(resUnavailable.vaCommunityCare.eligible, true);
  assert.ok(resUnavailable.vaCommunityCare.criteriaMatched.includes('service_unavailable'));
  assert.match(resUnavailable.vaCommunityCare.reasons[0], /38 U\.S\.C\. § 1703\(d\)\(1\)\(A\)/);

  // State without full-service hospital (e.g. AK, HI, NH, GU, AS, MP, VI)
  const resState = evaluateVeteransEligibility({
    enrolledInVa: 'yes',
    stateWithoutFullServiceVa: true,
  });
  assert.equal(resState.vaCommunityCare.eligible, true);
  assert.ok(resState.vaCommunityCare.criteriaMatched.includes('no_full_service_state'));
  assert.match(resState.vaCommunityCare.reasons[0], /38 U\.S\.C\. § 1703\(d\)\(1\)\(B\)/);

  // Best medical interest standard
  const resBestInterest = evaluateVeteransEligibility({
    enrolledInVa: 'yes',
    bestMedicalInterest: true,
  });
  assert.equal(resBestInterest.vaCommunityCare.eligible, true);
  assert.ok(resBestInterest.vaCommunityCare.criteriaMatched.includes('best_medical_interest'));
  assert.match(resBestInterest.vaCommunityCare.reasons[0], /38 U\.S\.C\. § 1703\(e\)/);

  // Grandfathered choice standard
  const resChoice = evaluateVeteransEligibility({
    enrolledInVa: 'yes',
    grandfatheredChoice: true,
  });
  assert.equal(resChoice.vaCommunityCare.eligible, true);
  assert.ok(resChoice.vaCommunityCare.criteriaMatched.includes('grandfathered_choice'));
});

test('TRICARE: differentiates authorization for Prime vs Select across care settings', () => {
  // 1. TRICARE Select with outpatient therapy -> No pre-auth required
  const resSelectOutpatient = evaluateVeteransEligibility({
    insurance: 'tricare_select',
    careType: 'mental_health',
  });
  assert.equal(resSelectOutpatient.tricareAuth.applies, true);
  assert.equal(resSelectOutpatient.tricareAuth.plan, 'select');
  assert.equal(resSelectOutpatient.tricareAuth.requiresPreAuth, false);
  assert.equal(resSelectOutpatient.tricareAuth.requiresReferral, false);

  // 2. TRICARE Select with residential SUD -> Mandatory pre-authorization
  const resSelectRes = evaluateVeteransEligibility({
    insurance: 'tricare_select',
    careType: 'sud_residential',
  });
  assert.equal(resSelectRes.tricareAuth.applies, true);
  assert.equal(resSelectRes.tricareAuth.requiresPreAuth, true);
  assert.match(resSelectRes.tricareAuth.guidelines[0], /Mandatory Prior Authorization/i);

  // 3. TRICARE Prime with inpatient detox -> Mandatory pre-authorization
  const resPrimeDetox = evaluateVeteransEligibility({
    insurance: 'tricare_prime',
    careType: 'detox',
  });
  assert.equal(resPrimeDetox.tricareAuth.applies, true);
  assert.equal(resPrimeDetox.tricareAuth.plan, 'prime');
  assert.equal(resPrimeDetox.tricareAuth.requiresPreAuth, true);

  // 4. TRICARE Prime Active Duty -> Requires referral and commander pre-auth
  const resPrimeADSM = evaluateVeteransEligibility({
    insurance: 'tricare_prime',
    militaryStatus: 'active_duty',
    careType: 'mental_health',
  });
  assert.equal(resPrimeADSM.tricareAuth.requiresReferral, true);
  assert.match(resPrimeADSM.tricareAuth.guidelines[0], /Active Duty Requirement/i);
});

test('Military Sexual Trauma (MST): guarantees 100% free care, no report needed, and OTH eligibility under 38 U.S.C. § 1720I', () => {
  const res = evaluateVeteransEligibility({
    experiencedMst: 'yes',
    dischargeStatus: 'oth',
  });

  assert.equal(res.mstCare.applies, true);
  assert.equal(res.mstCare.eligible, true);
  assert.equal(res.mstCare.freeOfCost, true);
  assert.equal(res.mstCare.noServiceConnectionRequired, true);
  assert.equal(res.mstCare.noReportNeeded, true);
  assert.equal(res.mstCare.othEligible, true);
  assert.equal(res.mstCare.isOthDischarge, true);

  // Guidelines must affirm 100% free care and OTH protection under 38 U.S.C. § 1720I
  const guidelinesText = res.mstCare.guidelines.join(' ');
  assert.match(guidelinesText, /100% Free Care/);
  assert.match(guidelinesText, /No Service Connection Required/);
  assert.match(guidelinesText, /No Incident Report Needed/);
  assert.match(guidelinesText, /Other Than Honorable.*38 U\.S\.C\. § 1720I/);

  // Next steps recommend connecting with facility MST Coordinator and Vet Centers
  const nextStepsText = res.mstCare.nextSteps.join(' ');
  assert.match(nextStepsText, /MST Coordinator/);
  assert.match(nextStepsText, /Vet Center/);
});

test('VA Urgent Care Benefit (38 U.S.C. § 1725A) and Crisis Support validation', () => {
  const res = evaluateVeteransEligibility({
    enrolledInVa: 'yes',
    receivedVaCarePast24Months: true,
  });

  assert.equal(res.urgentCare.eligible, true);
  assert.equal(res.urgentCare.noPriorAuthRequired, true);
  assert.match(res.urgentCare.prescriptionBenefit, /14-day supply/);

  // Crisis line notice
  assert.equal(res.crisisNotice.dial, '988');
  assert.equal(res.crisisNotice.press, '1');
  assert.equal(res.crisisNotice.text, '838255');
  assert.match(res.crisisNotice.compactAct, /38 U\.S\.C\. § 1720J/);
});

test('evaluateVeteransEligibility handles null, undefined, string numbers, and missing fields safely', () => {
  // Empty input
  const emptyRes = evaluateVeteransEligibility({});
  assert.equal(typeof emptyRes, 'object');
  assert.equal(emptyRes.vaCommunityCare.eligible, false);

  // Null input
  const nullRes = evaluateVeteransEligibility(null);
  assert.equal(typeof nullRes, 'object');
  assert.equal(nullRes.vaCommunityCare.eligible, false);

  // String numbers for wait and drive times
  const stringNumRes = evaluateVeteransEligibility({
    enrolledInVa: true,
    careType: 'primary',
    vaWaitDays: '35',
    vaDriveMinutes: '50',
  });
  assert.equal(stringNumRes.vaCommunityCare.eligible, true);
  assert.ok(stringNumRes.vaCommunityCare.criteriaMatched.includes('access_standards_wait_time'));
  assert.ok(stringNumRes.vaCommunityCare.criteriaMatched.includes('access_standards_drive_time'));
});

// ============================================================================
// 3. Ephemeral In-RAM State & Deterministic Resets
// ============================================================================

test('getVeteransState, setVeteransState, and resetVeteransState manage ephemeral RAM cleanly', () => {
  resetVeteransState();
  const initial = getVeteransState();

  assert.equal(initial.activeTab, 'screener');
  assert.equal(initial.enrolledInVa, 'yes');
  assert.equal(initial.careType, 'mental_health');
  assert.deepEqual(initial.checklistChecked, {});

  // Modify state
  setVeteransState({
    activeTab: 'mission_act',
    careType: 'sud_residential',
    vaDriveMinutes: '75',
    checklistChecked: { q_0: true, q_1: true },
  });

  const modified = getVeteransState();
  assert.equal(modified.activeTab, 'mission_act');
  assert.equal(modified.careType, 'sud_residential');
  assert.equal(modified.vaDriveMinutes, '75');
  assert.equal(modified.checklistChecked.q_0, true);

  // Deterministic reset
  const afterReset = resetVeteransState();
  assert.equal(afterReset.activeTab, 'screener');
  assert.equal(afterReset.careType, 'mental_health');
  assert.equal(afterReset.vaDriveMinutes, '');
  assert.deepEqual(afterReset.checklistChecked, {});
});

test('Source file static security audit: zero localStorage, sessionStorage, cookie, or direct markup injection', () => {
  const code = readFileSync(veteransFilePath, 'utf8');

  // Zero persistent storage or cookie writes
  assert.doesNotMatch(code, /localStorage\s*\./, 'veterans.js must never access localStorage');
  assert.doesNotMatch(code, /sessionStorage\s*\./, 'veterans.js must never access sessionStorage');
  assert.doesNotMatch(code, /document\s*\.\s*cookie/, 'veterans.js must never touch document.cookie');
  assert.doesNotMatch(code, /indexedDB/, 'veterans.js must never touch indexedDB');

  // Zero direct markup injection or inline style writes
  assert.doesNotMatch(code, /\b(innerHTML|outerHTML|insertAdjacentHTML)\b/, 'veterans.js must have 0 innerHTML/outerHTML');
  assert.doesNotMatch(code, /\bstyle\s*=/i, 'veterans.js must have 0 inline style= attributes');
});

// ============================================================================
// 4. Clinical Handout Formatter Tests (formatVeteransSummaryText)
// ============================================================================

test('formatVeteransSummaryText formats comprehensive clinical text in English and Spanish', () => {
  const testState = {
    lang: 'en',
    enrolledInVa: 'yes',
    careType: 'mental_health',
    vaWaitDays: '30',
    vaDriveMinutes: '45',
    insurance: 'tricare_select',
    experiencedMst: 'yes',
    dischargeStatus: 'oth',
    checklistChecked: {},
  };

  const textEn = formatVeteransSummaryText(testState, 'en');
  assert.match(textEn, /VETERANS & MILITARY HEALTH CARE NAVIGATION GUIDE/);
  assert.match(textEn, /988, then press 1/);
  assert.match(textEn, /838255/);
  assert.match(textEn, /VeteransCrisisLine\.net/);
  assert.match(textEn, /38 U\.S\.C\. § 1703/);
  assert.match(textEn, /TRICARE AUTHORIZATION GUIDELINES/);
  assert.match(textEn, /38 U\.S\.C\. § 1720D & § 1720I/);
  assert.match(textEn, /Other Than Honorable.*38 U\.S\.C\. § 1720I/);
  assert.match(textEn, /#\/treatment\?codes=VET/);

  // Spanish formatting
  const textEs = formatVeteransSummaryText(testState, 'es');
  assert.match(textEs, /GUÍA DE NAVEGACIÓN DE SALUD PARA VETERANOS/);
  assert.match(textEs, /LÍNEA DE CRISIS PARA VETERANOS/);
  assert.match(textEs, /988 y presione 1/);
  assert.match(textEs, /Ley VA MISSION Act de 2018/i);
  assert.match(textEs, /PAUTAS DE AUTORIZACIÓN DE TRICARE/);
  assert.match(textEs, /TRAUMA SEXUAL MILITAR/);
});

// ============================================================================
// 5. Accessible DOM Construction Tests (veteransView)
// ============================================================================

class MockNode {
  constructor(tagName) {
    this.tagName = tagName ? tagName.toUpperCase() : '#TEXT';
    this.children = [];
    this.attributes = {};
    this.listeners = {};
    this.className = '';
    this.dataset = {};
    this._textContent = '';
    this.parent = null;
    this.checked = false;
    this.value = '';
    this.id = '';
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
        else if (selector === 'a' && node.tagName === 'A') matches.push(node);
        else if (selector === 'input[type="checkbox"]' && node.tagName === 'INPUT' && node.attributes.type === 'checkbox') matches.push(node);
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

test('veteransView renders accessible DOM tree with crisis line, treatment link, screener, and tabs', () => {
  const prevDoc = globalThis.document;
  const prevNode = globalThis.Node;

  globalThis.Node = MockNode;
  globalThis.document = {
    createElement: (tag) => new MockNode(tag),
    createElementNS: (_ns, tag) => new MockNode(tag),
    getElementById: () => null,
  };

  try {
    resetVeteransState();
    const root = veteransView({ query: { tab: 'screener', care: 'mental_health' } });

    assert.ok(root instanceof MockNode);
    assert.match(root.className, /view-veterans/);

    const fullText = root.textContent;

    // 1. Title and header
    assert.match(fullText, /Veterans & Military Health Care Navigation/);
    assert.match(fullText, /VA MISSION Act of 2018/);

    // 2. Veterans Crisis Line Banner
    assert.match(fullText, /Veterans Crisis Line: Free, Confidential Support 24\/7\/365/);
    assert.match(fullText, /Dial 988, then Press 1/);
    assert.match(fullText, /Text 838255/);
    assert.match(fullText, /Veterans COMPACT Act/);

    // 3. In-RAM privacy callout
    assert.match(fullText, /In-RAM Decision Support & Ephemeral Privacy/);

    // 4. Treatment link pre-filtered with VET
    const links = root.querySelectorAll('a');
    const vaTreatmentLink = links.find((a) => a.attributes.href === '#/treatment?codes=VET');
    assert.ok(vaTreatmentLink, 'Must contain a link directly to #/treatment?codes=VET');

    // 5. Tabs present
    assert.match(fullText, /Interactive Decision Aid/);
    assert.match(fullText, /VA MISSION Act & Community Care/);
    assert.match(fullText, /TRICARE Substance Use Rules/);
    assert.match(fullText, /Military Sexual Trauma \(MST\) Rights/);
    assert.match(fullText, /Provider Discussion Checklist/);

    // 6. Interactive Screener Form controls
    const selects = root.querySelectorAll('select');
    assert.ok(selects.length >= 4, 'Must render select dropdowns for enrollment, status, discharge, care type, insurance');

    // 7. Quick Exit / Wipe button
    const buttons = root.querySelectorAll('button');
    const resetBtn = buttons.find((b) => b.className.includes('btn-quick-exit'));
    assert.ok(resetBtn, 'Must render Quick Exit & Wipe State button');

    resetBtn.dispatchEvent('click');
    const cleanState = getVeteransState();
    assert.equal(cleanState.activeTab, 'screener');
    assert.deepEqual(cleanState.checklistChecked, {});
  } finally {
    globalThis.document = prevDoc;
    globalThis.Node = prevNode;
    resetVeteransState();
  }
});
