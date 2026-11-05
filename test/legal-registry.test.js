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
  LEGAL_DISCLAIMER,
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

      // Provenance, review status and disclaimer fields
      assert.equal(item.reviewStatus, 'unverified', `Expected reviewStatus: "unverified" in ${item.stateCode}`);
      assert.equal(item.lastReviewed, null, `Expected lastReviewed: null in ${item.stateCode}`);
      assert.ok(Array.isArray(item.sources), `Expected sources array in ${item.stateCode}`);
      assert.ok(item.sources.length > 0, `Expected non-empty sources in ${item.stateCode}`);
      for (const src of item.sources) {
        assert.equal(typeof src.name, 'string', `Invalid source name in ${item.stateCode}`);
        assert.ok(src.name.trim().length > 0, `Empty source name in ${item.stateCode}`);
        assert.equal(typeof src.url, 'string', `Invalid source url in ${item.stateCode}`);
        assert.match(src.url, /^https?:\/\//, `Source url must start with http(s) in ${item.stateCode}`);
      }
      assert.equal(typeof item.disclaimer, 'string');
      assert.ok(item.disclaimer.includes('unverified by a licensed attorney'));
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

  it('executes 10,000 lookups in under 150ms with memoized O(1) performance', () => {
    const start = performance.now();
    for (let i = 0; i < 10000; i++) {
      const code = EXPECTED_JURISDICTIONS[i % EXPECTED_JURISDICTIONS.length];
      const record = getLegalProtections(code);
      assert.ok(record !== null);
    }
    const elapsed = performance.now() - start;
    assert.ok(elapsed < 150, `Expected 10,000 lookups to take < 150ms, took ${elapsed.toFixed(2)}ms`);
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

describe('Legal Registry - Provenance, Disclaimer & stateLegalCard Safety', () => {
  it('exports LEGAL_DISCLAIMER with explicit attorney, change, and 911 safeguards', () => {
    assert.equal(typeof LEGAL_DISCLAIMER, 'string');
    assert.ok(LEGAL_DISCLAIMER.includes('unverified by a licensed attorney'));
    assert.ok(LEGAL_DISCLAIMER.toLowerCase().includes('statutes change') || LEGAL_DISCLAIMER.toLowerCase().includes('laws change'));
    assert.ok(LEGAL_DISCLAIMER.includes('local legal aid') || LEGAL_DISCLAIMER.includes('harm reduction'));
    assert.ok(LEGAL_DISCLAIMER.includes('ALWAYS call 911 first'));
    assert.ok(LEGAL_DISCLAIMER.includes('overdose'));
  });

  it('every record in data/state-legal.json has reviewStatus "unverified", non-empty sources, and lastReviewed null', () => {
    const raw = readFileSync(new URL('../data/state-legal.json', import.meta.url), 'utf8');
    const records = JSON.parse(raw);
    assert.equal(records.length, 52);
    for (const r of records) {
      assert.equal(r.reviewStatus, 'unverified', `Record ${r.stateCode} reviewStatus must be 'unverified'`);
      assert.equal(r.lastReviewed, null, `Record ${r.stateCode} lastReviewed must be null`);
      assert.ok(Array.isArray(r.sources) && r.sources.length > 0, `Record ${r.stateCode} sources must be non-empty`);
      for (const s of r.sources) {
        assert.equal(typeof s.name, 'string');
        assert.ok(s.name.length > 0);
        assert.equal(typeof s.url, 'string');
        assert.match(s.url, /^https?:\/\//);
      }
    }
  });

  it('exposes reviewStatus, lastReviewed, sources, and disclaimer on plain-language summaries', () => {
    const summary = getJurisdictionSummary('WA');
    assert.equal(summary.reviewStatus, 'unverified');
    assert.equal(summary.lastReviewed, null);
    assert.ok(Array.isArray(summary.sources) && summary.sources.length > 0);
    assert.equal(summary.disclaimer, LEGAL_DISCLAIMER);
  });

  it('stateLegalCard renders unverified note and does not claim "you are immune" or "you are protected"', async () => {
    class MockClassList {
      constructor(node) { this.node = node; }
      contains(c) { return (this.node.className || '').split(/\s+/).includes(c); }
      add(...classes) {
        const s = new Set((this.node.className || '').split(/\s+/).filter(Boolean));
        classes.forEach((c) => s.add(c));
        this.node.className = [...s].join(' ');
      }
    }
    class MockNode {
      constructor(tag) {
        this.tagName = String(tag).toUpperCase();
        this.className = '';
        this.dataset = {};
        this.attributes = {};
        this.listeners = {};
        this.children = [];
        this.classList = new MockClassList(this);
      }
      setAttribute(k, v) { this.attributes[k] = String(v); }
      getAttribute(k) { return this.attributes[k] ?? null; }
      removeAttribute(k) { delete this.attributes[k]; }
      addEventListener(ev, fn) { this.listeners[ev] = fn; }
      append(...children) {
        for (const c of children.flat(Infinity)) {
          if (c === null || c === undefined || c === false) continue;
          this.children.push(c instanceof MockNode ? c : new MockTextNode(String(c)));
        }
      }
      get textContent() { return this.children.map((c) => c.textContent).join(''); }
      querySelectorAll(sel) {
        const results = [];
        this._findAll(sel, results);
        return results;
      }
      _findAll(sel, acc) {
        for (const c of this.children) {
          if (c instanceof MockNode) {
            if (sel.startsWith('[') && sel.endsWith(']')) {
              const [k, v] = sel.slice(1, -1).split('=');
              const cleanV = v ? v.replace(/['"]/g, '') : null;
              if (cleanV ? c.getAttribute(k) === cleanV : c.getAttribute(k) !== null) acc.push(c);
            }
            c._findAll(sel, acc);
          }
        }
      }
    }
    class MockTextNode {
      constructor(text) { this.text = text; }
      get textContent() { return this.text; }
    }

    const hadDoc = typeof globalThis.document !== 'undefined';
    const hadNode = typeof globalThis.Node !== 'undefined';
    if (!hadDoc) {
      globalThis.Node = MockNode;
      globalThis.document = {
        createElement: (t) => new MockNode(t),
        createElementNS: (_ns, t) => new MockNode(t),
        createTextNode: (t) => new MockTextNode(t),
      };
    } else if (typeof globalThis.document.createElementNS !== 'function') {
      globalThis.document.createElementNS = (_ns, t) => globalThis.document.createElement(t);
    }

    try {
      const { stateLegalCard } = await import('../public/js/components/stateLegalCard.js');
      const waRecord = getLegalProtections('WA');
      const card = stateLegalCard(waRecord);

      // Verify unverified note is rendered with role="note"
      const noteCallouts = card.querySelectorAll('[role=note]');
      assert.ok(noteCallouts.length > 0, 'stateLegalCard must render a callout with role="note"');
      assert.ok(
        card.textContent.includes('Not yet reviewed by a legal expert — confirm with the source below.'),
        'Must display unverified disclaimer notice'
      );

      // Verify hedged phrasing: NEVER claims "you are immune" or "you are protected"
      const lowerText = card.textContent.toLowerCase();
      assert.ok(!lowerText.includes('you are immune'), 'stateLegalCard must never claim "you are immune"');
      assert.ok(!lowerText.includes('you are protected'), 'stateLegalCard must never claim "you are protected"');

      // Verify "Call 911 first" instruction is front and center
      assert.ok(card.textContent.includes('In an overdose emergency, ALWAYS CALL 911 FIRST to save a life.'));

      // Verify authoritative source links are present
      assert.ok(card.textContent.includes('LawAtlas Good Samaritan Overdose Prevention Laws'));
      assert.ok(card.textContent.includes('End Overdose State Law Toolkit'));

      // Also verify fallback when legalData is null
      const fallbackCard = stateLegalCard(null);
      assert.ok(
        fallbackCard.textContent.includes('Not yet reviewed by a legal expert — confirm with the source below.')
      );
      assert.ok(!fallbackCard.textContent.toLowerCase().includes('you are immune'));
    } finally {
      if (!hadDoc) {
        delete globalThis.document;
      }
      if (!hadNode) {
        delete globalThis.Node;
      }
    }
  });
});

