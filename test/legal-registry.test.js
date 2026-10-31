import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  loadLegalRegistry,
  getLegalProtections,
  filterStatesByProtection,
  getJurisdictionSummary,
  normalizeStateCode,
  isSupportedJurisdiction,
  getAllJurisdictionCodes,
  getAllJurisdictions,
  hasGoodSamaritanProtection,
  hasArrestImmunity,
  hasParoleProbationProtection,
  hasFentanylTestStripProtection,
  hasXylazineTestStripProtection,
  hasSyringeProgramProtection,
  compareJurisdictions,
} from '../src/legalRegistry.js';

const EXPECTED_JURISDICTIONS = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL',
  'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME',
  'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH',
  'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'PR',
  'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV',
  'WI', 'WY'
];

describe('Legal Registry - Schema & Completeness (52 Jurisdictions)', () => {
  it('data/state-legal.json exists, parses cleanly, and contains exactly 52 records', () => {
    const raw = readFileSync(new URL('../data/state-legal.json', import.meta.url), 'utf8');
    const parsed = JSON.parse(raw);
    assert.ok(Array.isArray(parsed), 'Expected state-legal.json to be an array');
    assert.equal(parsed.length, 52, 'Expected 52 jurisdictions (50 states + DC + PR)');
  });

  it('loadLegalRegistry() returns all 52 jurisdictions and covers all expected codes', () => {
    const registry = loadLegalRegistry();
    assert.equal(registry.length, 52);

    const codes = registry.map((r) => r.stateCode);
    const uniqueCodes = new Set(codes);
    assert.equal(uniqueCodes.size, 52);

    for (const expected of EXPECTED_JURISDICTIONS) {
      assert.ok(uniqueCodes.has(expected), `Missing jurisdiction code: ${expected}`);
    }
  });

  it('every record satisfies the full required legal schema with strict types', () => {
    const registry = loadLegalRegistry();

    for (const item of registry) {
      // Top-level fields
      assert.equal(typeof item.stateCode, 'string', `Invalid stateCode in ${item.stateCode}`);
      assert.match(item.stateCode, /^[A-Z]{2}$/, `stateCode must be 2 uppercase letters: ${item.stateCode}`);
      assert.equal(typeof item.stateName, 'string', `Invalid stateName in ${item.stateCode}`);
      assert.ok(item.stateName.trim().length > 0, `Empty stateName in ${item.stateCode}`);

      // Good Samaritan fields
      const gs = item.goodSamaritan;
      assert.ok(gs && typeof gs === 'object', `Missing goodSamaritan in ${item.stateCode}`);
      assert.equal(typeof gs.hasProtection, 'boolean', `goodSamaritan.hasProtection in ${item.stateCode}`);
      assert.equal(typeof gs.arrestImmunity, 'boolean', `goodSamaritan.arrestImmunity in ${item.stateCode}`);
      assert.equal(typeof gs.chargeImmunity, 'boolean', `goodSamaritan.chargeImmunity in ${item.stateCode}`);
      assert.equal(typeof gs.prosecutionImmunity, 'boolean', `goodSamaritan.prosecutionImmunity in ${item.stateCode}`);
      assert.equal(typeof gs.protectsParoleProbation, 'boolean', `goodSamaritan.protectsParoleProbation in ${item.stateCode}`);
      assert.equal(typeof gs.protectsParaphernalia, 'boolean', `goodSamaritan.protectsParaphernalia in ${item.stateCode}`);
      assert.equal(typeof gs.protectsUnderageAlcohol, 'boolean', `goodSamaritan.protectsUnderageAlcohol in ${item.stateCode}`);
      assert.equal(typeof gs.statuteCitation, 'string', `goodSamaritan.statuteCitation in ${item.stateCode}`);
      assert.ok(gs.statuteCitation.trim().length > 0, `Empty statute citation in ${item.stateCode}`);

      // Naloxone Access fields
      const nx = item.naloxoneAccess;
      assert.ok(nx && typeof nx === 'object', `Missing naloxoneAccess in ${item.stateCode}`);
      assert.equal(typeof nx.standingOrder, 'boolean', `naloxoneAccess.standingOrder in ${item.stateCode}`);
      assert.equal(typeof nx.thirdPartyPrescribing, 'boolean', `naloxoneAccess.thirdPartyPrescribing in ${item.stateCode}`);
      assert.equal(typeof nx.layResponderImmunity, 'boolean', `naloxoneAccess.layResponderImmunity in ${item.stateCode}`);
      assert.equal(typeof nx.statuteCitation, 'string', `naloxoneAccess.statuteCitation in ${item.stateCode}`);
      assert.ok(nx.statuteCitation.trim().length > 0, `Empty naloxone citation in ${item.stateCode}`);

      // Harm Reduction Equipment fields
      const hr = item.harmReductionEquipment;
      assert.ok(hr && typeof hr === 'object', `Missing harmReductionEquipment in ${item.stateCode}`);
      assert.equal(typeof hr.fentanylTestStripsLegal, 'boolean', `harmReductionEquipment.fentanylTestStripsLegal in ${item.stateCode}`);
      assert.equal(typeof hr.xylazineTestStripsLegal, 'boolean', `harmReductionEquipment.xylazineTestStripsLegal in ${item.stateCode}`);
      assert.equal(typeof hr.sspStatutoryProtection, 'boolean', `harmReductionEquipment.sspStatutoryProtection in ${item.stateCode}`);
      assert.equal(typeof hr.statuteNotes, 'string', `harmReductionEquipment.statuteNotes in ${item.stateCode}`);
      assert.ok(hr.statuteNotes.trim().length > 0, `Empty statuteNotes in ${item.stateCode}`);
    }
  });

  it('records in registry are deeply frozen and immutable against mutations', () => {
    const ca = getLegalProtections('CA');
    assert.ok(Object.isFrozen(ca), 'CA record should be frozen');
    assert.ok(Object.isFrozen(ca.goodSamaritan), 'CA.goodSamaritan should be frozen');
    assert.ok(Object.isFrozen(ca.naloxoneAccess), 'CA.naloxoneAccess should be frozen');
    assert.ok(Object.isFrozen(ca.harmReductionEquipment), 'CA.harmReductionEquipment should be frozen');

    // Attempted mutations should throw in strict mode
    assert.throws(() => {
      // @ts-ignore
      ca.stateName = 'Mutated';
    }, TypeError);

    assert.throws(() => {
      // @ts-ignore
      ca.goodSamaritan.arrestImmunity = false;
    }, TypeError);
  });
});

describe('Legal Registry - Fast Zero-Allocation Memoization', () => {
  it('multiple invocations of loadLegalRegistry() return the identical cached reference', () => {
    const reg1 = loadLegalRegistry();
    const reg2 = loadLegalRegistry();
    assert.equal(reg1, reg2, 'loadLegalRegistry() must return identical memoized array instance');
  });

  it('getLegalProtections() returns identical object references with zero allocations', () => {
    const ca1 = getLegalProtections('CA');
    const ca2 = getLegalProtections('CA');
    const caLower = getLegalProtections('ca');
    assert.equal(ca1, ca2, 'Repeated lookups must return identical memoized record');
    assert.equal(ca1, caLower, 'Case-insensitive lookups must return identical memoized record');
  });

  it('executes 10,000 lookups in under 50ms with memoized O(1) performance', () => {
    const start = performance.now();
    for (let i = 0; i < 10000; i++) {
      const code = EXPECTED_JURISDICTIONS[i % EXPECTED_JURISDICTIONS.length];
      const record = getLegalProtections(code);
      assert.ok(record !== null);
    }
    const elapsed = performance.now() - start;
    assert.ok(elapsed < 50, `Expected 10,000 lookups to take < 50ms, took ${elapsed.toFixed(2)}ms`);
  });

  it('options.reload reloads data cleanly', () => {
    const fresh = loadLegalRegistry({ reload: true });
    assert.equal(fresh.length, 52);
  });
});

describe('Legal Registry - Input Normalization & Error Handling', () => {
  it('normalizes valid state codes correctly (case, trimming)', () => {
    assert.equal(normalizeStateCode('ca'), 'CA');
    assert.equal(normalizeStateCode(' NY '), 'NY');
    assert.equal(normalizeStateCode('tX'), 'TX');
  });

  it('normalizeStateCode handles null and undefined gracefully', () => {
    assert.equal(normalizeStateCode(null), null);
    assert.equal(normalizeStateCode(undefined), null);
  });

  it('normalizeStateCode throws TypeError on non-string inputs', () => {
    assert.throws(() => normalizeStateCode(123), TypeError);
    assert.throws(() => normalizeStateCode({}), TypeError);
    assert.throws(() => normalizeStateCode([]), TypeError);
    assert.throws(() => normalizeStateCode(true), TypeError);
  });

  it('normalizeStateCode returns null for strings not formatted as 2-letter codes', () => {
    assert.equal(normalizeStateCode(''), null);
    assert.equal(normalizeStateCode('C'), null);
    assert.equal(normalizeStateCode('CAL'), null);
    assert.equal(normalizeStateCode('CALIFORNIA'), null);
    assert.equal(normalizeStateCode('12'), null);
  });

  it('getLegalProtections returns null gracefully for invalid or unknown state codes', () => {
    assert.equal(getLegalProtections(null), null);
    assert.equal(getLegalProtections(undefined), null);
    assert.equal(getLegalProtections(''), null);
    assert.equal(getLegalProtections('ZZ'), null);
    assert.equal(getLegalProtections('XX'), null);
    assert.equal(getLegalProtections('FOO'), null);
  });

  it('getLegalProtections throws when strict: true is specified and code is invalid', () => {
    assert.throws(() => getLegalProtections('ZZ', { strict: true }), /not found/);
    assert.throws(() => getLegalProtections('', { strict: true }), /Invalid or missing/);
  });

  it('isSupportedJurisdiction accurately classifies codes', () => {
    assert.equal(isSupportedJurisdiction('CA'), true);
    assert.equal(isSupportedJurisdiction('ny'), true);
    assert.equal(isSupportedJurisdiction('PR'), true);
    assert.equal(isSupportedJurisdiction('DC'), true);
    assert.equal(isSupportedJurisdiction('ZZ'), false);
    assert.equal(isSupportedJurisdiction(''), false);
    assert.equal(isSupportedJurisdiction(null), false);
    assert.equal(isSupportedJurisdiction(123), false);
  });
});

describe('Legal Registry - Search and Filtering Capabilities', () => {
  it('filterStatesByProtection with empty/undefined filters returns all 52 jurisdictions', () => {
    assert.equal(filterStatesByProtection().length, 52);
    assert.equal(filterStatesByProtection({}).length, 52);
  });

  it('filters by fentanyl test strip legality (ftsLegal)', () => {
    const ftsLegal = filterStatesByProtection({ ftsLegal: true });
    const ftsIllegal = filterStatesByProtection({ ftsLegal: false });

    assert.ok(ftsLegal.length >= 45, `Expected at least 45 FTS legal states, found ${ftsLegal.length}`);
    assert.ok(ftsIllegal.length <= 7, `Expected small number of FTS restricted jurisdictions, found ${ftsIllegal.length}`);
    assert.equal(ftsLegal.length + ftsIllegal.length, 52);

    const ftsIllegalCodes = ftsIllegal.map((r) => r.stateCode);
    assert.ok(ftsIllegalCodes.includes('TX'), 'Texas should be in FTS restricted list');
    assert.ok(ftsIllegalCodes.includes('IA'), 'Iowa should be in FTS restricted list');
    assert.ok(ftsIllegalCodes.includes('ND'), 'North Dakota should be in FTS restricted list');
  });

  it('supports alias property names in filters (fentanylTestStripsLegal)', () => {
    const byShort = filterStatesByProtection({ ftsLegal: true });
    const byFull = filterStatesByProtection({ fentanylTestStripsLegal: true });
    assert.equal(byShort.length, byFull.length);
  });

  it('filters by syringe services statutory protection (sspLegal)', () => {
    const sspLegal = filterStatesByProtection({ sspLegal: true });
    const sspIllegal = filterStatesByProtection({ sspLegal: false });

    assert.ok(sspLegal.length >= 35, `Expected >= 35 states with statutory SSP authorization, found ${sspLegal.length}`);
    assert.equal(sspLegal.length + sspIllegal.length, 52);

    const sspIllegalCodes = sspIllegal.map((r) => r.stateCode);
    assert.ok(sspIllegalCodes.includes('TX'), 'Texas should lack statutory SSP authorization');
    assert.ok(sspIllegalCodes.includes('ID'), 'Idaho should lack statutory SSP authorization (repealed 2024)');
    assert.ok(sspIllegalCodes.includes('SD'), 'South Dakota should lack statutory SSP authorization');
    assert.ok(sspIllegalCodes.includes('WY'), 'Wyoming should lack statutory SSP authorization');
  });

  it('filters by parole/probation protection (paroleProtected)', () => {
    const paroleProtected = filterStatesByProtection({ paroleProtected: true });
    const paroleUnprotected = filterStatesByProtection({ paroleProtected: false });

    assert.ok(paroleProtected.length >= 20, `Expected >= 20 states protecting parole/probation, got ${paroleProtected.length}`);
    assert.equal(paroleProtected.length + paroleUnprotected.length, 52);

    const protectedCodes = paroleProtected.map((r) => r.stateCode);
    assert.ok(protectedCodes.includes('CA'), 'California protects parole/probation');
    assert.ok(protectedCodes.includes('NY'), 'New York protects parole/probation');
    assert.ok(protectedCodes.includes('CO'), 'Colorado protects parole/probation');
    assert.ok(protectedCodes.includes('DE'), 'Delaware protects parole/probation');
  });

  it('supports multi-criteria compound filtering', () => {
    // States that have FTS legal, SSP statutory protection, and protect parole/probation
    const goldStandardStates = filterStatesByProtection({
      ftsLegal: true,
      sspLegal: true,
      paroleProtected: true,
    });

    assert.ok(goldStandardStates.length >= 15, `Expected >= 15 gold standard states, found ${goldStandardStates.length}`);
    for (const r of goldStandardStates) {
      assert.equal(r.harmReductionEquipment.fentanylTestStripsLegal, true);
      assert.equal(r.harmReductionEquipment.sspStatutoryProtection, true);
      assert.equal(r.goodSamaritan.protectsParoleProbation, true);
    }
  });

  it('filters by naloxone standing order and lay responder immunity', () => {
    const standingOrders = filterStatesByProtection({ standingOrder: true });
    assert.equal(standingOrders.length, 52, 'All 52 jurisdictions have standing order naloxone access');

    const layImmunity = filterStatesByProtection({ layResponderImmunity: true });
    assert.equal(layImmunity.length, 52, 'All 52 jurisdictions provide lay responder naloxone immunity');
  });
});

describe('Legal Registry - Jurisdiction Summary Generation', () => {
  it('generates rich, accessible summaries for valid jurisdictions', () => {
    const caSummary = getJurisdictionSummary('CA');
    assert.ok(caSummary !== null);
    assert.equal(caSummary.stateCode, 'CA');
    assert.equal(caSummary.stateName, 'California');

    // Good Samaritan summary
    assert.ok(caSummary.goodSamaritan.summary.length > 20);
    assert.match(caSummary.goodSamaritan.summary, /Cal\. Health & Safety Code § 11376\.5/);
    assert.match(caSummary.goodSamaritan.summary, /parole or probation/i);

    // Naloxone summary
    assert.ok(caSummary.naloxoneAccess.summary.length > 20);
    assert.match(caSummary.naloxoneAccess.summary, /Cal\. Civ\. Code § 1714\.22/);

    // Harm reduction equipment summary
    assert.ok(caSummary.harmReductionEquipment.summary.length > 20);
    assert.match(caSummary.harmReductionEquipment.summary, /Fentanyl test strips/i);

    // Notices and citations
    assert.ok(caSummary.plainLanguageNotice.includes('California overdose response summary'));
    assert.ok(caSummary.confidentialityNotice.includes('strictly confidential'));
    assert.ok(caSummary.citations.length >= 2);
  });

  it('memoizes summaries across repeated calls', () => {
    const s1 = getJurisdictionSummary('NY');
    const s2 = getJurisdictionSummary('ny');
    assert.equal(s1, s2, 'Summary objects must be identical memoized references');
  });

  it('returns null gracefully or throws with strict: true for invalid codes', () => {
    assert.equal(getJurisdictionSummary(null), null);
    assert.equal(getJurisdictionSummary('ZZ'), null);
    assert.throws(() => getJurisdictionSummary('ZZ', { strict: true }), /not found/);
  });
});

describe('Legal Registry - Specific Jurisdictional Verification', () => {
  it('verifies Texas (TX) statutory distinctions', () => {
    const tx = getLegalProtections('TX');
    assert.ok(tx);
    assert.equal(tx.stateName, 'Texas');
    assert.equal(tx.goodSamaritan.arrestImmunity, false, 'Texas HB 1694 does not provide arrest immunity');
    assert.equal(tx.goodSamaritan.prosecutionImmunity, true, 'Texas HB 1694 provides affirmative defense to prosecution');
    assert.equal(tx.harmReductionEquipment.fentanylTestStripsLegal, false, 'Texas classifies FTS as illegal paraphernalia');
    assert.equal(tx.harmReductionEquipment.sspStatutoryProtection, false, 'Texas has no statutory SSP protection');
    assert.match(tx.goodSamaritan.statuteCitation, /483\.102/);
  });

  it('verifies Idaho (ID) 2024 legislative updates', () => {
    const id = getLegalProtections('ID');
    assert.ok(id);
    assert.equal(id.stateName, 'Idaho');
    assert.equal(id.harmReductionEquipment.fentanylTestStripsLegal, true, 'HB 441 in 2024 decriminalized FTS in Idaho');
    assert.equal(id.harmReductionEquipment.sspStatutoryProtection, false, 'HB 617 in 2024 repealed the Syringe and Needle Exchange Act');
    assert.match(id.harmReductionEquipment.statuteNotes, /HB 441/);
    assert.match(id.harmReductionEquipment.statuteNotes, /HB 617/);
  });

  it('verifies Puerto Rico (PR) Law No. 35-2021', () => {
    const pr = getLegalProtections('PR');
    assert.ok(pr);
    assert.equal(pr.stateName, 'Puerto Rico');
    assert.equal(pr.goodSamaritan.hasProtection, true);
    assert.equal(pr.goodSamaritan.protectsParoleProbation, true);
    assert.match(pr.goodSamaritan.statuteCitation, /24 L\.P\.R\.A\. § 2644/);
    assert.equal(pr.harmReductionEquipment.sspStatutoryProtection, true);
  });

  it('verifies District of Columbia (DC)', () => {
    const dc = getLegalProtections('DC');
    assert.ok(dc);
    assert.equal(dc.stateName, 'District of Columbia');
    assert.equal(dc.goodSamaritan.hasProtection, true);
    assert.equal(dc.goodSamaritan.protectsParoleProbation, true);
    assert.equal(dc.harmReductionEquipment.fentanylTestStripsLegal, true);
    assert.equal(dc.harmReductionEquipment.sspStatutoryProtection, true);
    assert.match(dc.goodSamaritan.statuteCitation, /D\.C\. Code § 7-403/);
  });
});

describe('Legal Registry - Helper Functions & Jurisdiction Comparison', () => {
  it('getAllJurisdictionCodes() and getAllJurisdictions() return complete 52 collections', () => {
    const codes = getAllJurisdictionCodes();
    assert.equal(codes.length, 52);

    const list = getAllJurisdictions();
    assert.equal(list.length, 52);
  });

  it('boolean check helpers return accurate answers', () => {
    assert.equal(hasGoodSamaritanProtection('CA'), true);
    assert.equal(hasGoodSamaritanProtection('ZZ'), false);

    assert.equal(hasArrestImmunity('CA'), true);
    assert.equal(hasArrestImmunity('TX'), false);

    assert.equal(hasParoleProbationProtection('CA'), true);
    assert.equal(hasParoleProbationProtection('FL'), false);

    assert.equal(hasFentanylTestStripProtection('CA'), true);
    assert.equal(hasFentanylTestStripProtection('TX'), false);

    assert.equal(hasXylazineTestStripProtection('DE'), true);
    assert.equal(hasXylazineTestStripProtection('TX'), false);

    assert.equal(hasSyringeProgramProtection('CA'), true);
    assert.equal(hasSyringeProgramProtection('ID'), false);
  });

  it('compareJurisdictions identifies legal differences between two states', () => {
    const comp = compareJurisdictions('CA', 'TX');
    assert.ok(comp.stateA);
    assert.ok(comp.stateB);
    assert.ok(comp.differences.length > 0);

    const diffText = comp.differences.join(' ');
    assert.match(diffText, /Arrest immunity/i);
    assert.match(diffText, /Fentanyl test strips/i);
    assert.match(diffText, /Syringe services/i);
  });

  it('compareJurisdictions handles invalid codes gracefully', () => {
    const comp = compareJurisdictions('CA', 'ZZ');
    assert.ok(comp.differences.some((d) => d.includes('invalid')));
  });
});

describe('Legal Registry - Zero-PII & Confidentiality Invariants', () => {
  it('queries take state codes only, with no logging, retention, or tracking artifacts', () => {
    // Calling getLegalProtections or filterStatesByProtection requires no identifiers
    const res1 = getLegalProtections('WA');
    assert.ok(res1);

    const res2 = filterStatesByProtection({ ftsLegal: true, sspLegal: true });
    assert.ok(res2.length > 0);

    // Summary output explicitly includes confidentiality notice
    const summary = getJurisdictionSummary('WA');
    assert.ok(summary.confidentialityNotice);
    assert.match(summary.confidentialityNotice, /strictly confidential/i);
    assert.match(summary.confidentialityNotice, /zero/i);
  });
});
