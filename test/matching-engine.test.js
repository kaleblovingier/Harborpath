import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ACCREDITATION_CODES,
  InputError,
  LocationSchema,
  PAYMENT_CODES,
  ProviderSearchSchema,
  StateCodeSchema,
  TreatmentSearchSchema,
  createQueryMemoizer,
  matchInsuranceCompatibility,
  resolvePayerCodes,
  scoreFacilityMatch,
  z,
} from '../src/schema.js';
import {
  InputError as FindTreatmentInputError,
  normalizeFacility,
  parseTreatmentQuery,
} from '../src/findtreatment.js';
import { createTaxonomy } from '../src/taxonomy.js';
import { readJson } from '../src/util.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const taxonomy = createTaxonomy(readJson(path.join(here, '..', 'data', 'service-codes.json')));
const sample = readJson(path.join(here, 'fixtures', 'findtreatment-sample.json'));
const q = (s) => new URLSearchParams(s);

describe('z declarative schema validation toolkit', () => {
  test('validates primitive types: string, number, boolean, enum, array, object', () => {
    assert.equal(InputError, FindTreatmentInputError, 'InputError is shared across schema.js and findtreatment.js');

    const strSchema = z.string().trim().min(2).max(10);
    assert.equal(strSchema.parse('  hello  '), 'hello');
    assert.throws(() => strSchema.parse(123), InputError);
    assert.throws(() => strSchema.parse('a'), InputError);
    assert.throws(() => strSchema.parse('a'.repeat(11)), InputError);

    const numSchema = z.number().int().min(1).max(40);
    assert.equal(numSchema.parse(10), 10);
    assert.throws(() => numSchema.parse(3.14), InputError);
    assert.throws(() => numSchema.parse(0), InputError);
    assert.throws(() => numSchema.parse(41), InputError);
    assert.throws(() => numSchema.parse(NaN), InputError);
    assert.throws(() => numSchema.parse('10'), InputError);

    const boolSchema = z.boolean();
    assert.equal(boolSchema.parse(true), true);
    assert.equal(boolSchema.parse(false), false);
    assert.throws(() => boolSchema.parse('true'), InputError);

    const enumSchema = z.enum(['sa', 'mh']);
    assert.equal(enumSchema.parse('sa'), 'sa');
    assert.deepEqual(enumSchema.options, ['sa', 'mh']);
    assert.throws(() => enumSchema.parse('invalid'), InputError);

    const arrSchema = z.array(z.string().toUpperCase()).min(1).max(3);
    assert.deepEqual(arrSchema.parse(['bu', 'md']), ['BU', 'MD']);
    assert.throws(() => arrSchema.parse([]), InputError);
    assert.throws(() => arrSchema.parse(['a', 'b', 'c', 'd']), InputError);
    assert.throws(() => arrSchema.parse('not-an-array'), InputError);
  });

  test('supports .optional(), .default(), .refine(), .transform(), and .safeParse()', () => {
    const schema = z.object({
      name: z.string().trim().nonempty(),
      page: z.number().int().positive().default(1),
      notes: z.string().optional(),
      evenNumber: z.number().refine((n) => n % 2 === 0, 'Must be an even number').optional(),
    });

    const parsed = schema.parse({ name: '  HarborPath  ', evenNumber: 4 });
    assert.deepEqual(parsed, { name: 'HarborPath', page: 1, evenNumber: 4 });

    const badEven = schema.safeParse({ name: 'Test', evenNumber: 3 });
    assert.equal(badEven.success, false);
    assert.ok(badEven.error instanceof InputError);
    assert.match(badEven.error.message, /even number/);

    const goodSafe = schema.safeParse({ name: 'Clinic' });
    assert.equal(goodSafe.success, true);
    assert.deepEqual(goodSafe.data, { name: 'Clinic', page: 1 });
  });
});

describe('Search payload schemas (LocationSchema, TreatmentSearchSchema, ProviderSearchSchema, StateCodeSchema)', () => {
  test('LocationSchema validates bounds, rejects Null-Island coercion, and coarsens to 0.01 deg', () => {
    const loc = LocationSchema.parse({ lat: 48.751934, lng: -122.478712 });
    assert.deepEqual(loc, { lat: 48.75, lng: -122.48 });

    const fromParams = LocationSchema.parse(q('lat=47.60621&lng=-122.33207'));
    assert.deepEqual(fromParams, { lat: 47.61, lng: -122.33 });

    // Rejects out-of-bounds, missing, blank, null, or boolean inputs (prevents (0,0) coercion)
    for (const invalid of [
      { lat: 91, lng: -122 },
      { lat: -95, lng: -122 },
      { lat: 48, lng: 181 },
      { lat: 48, lng: -185 },
      { lat: '', lng: '' },
      { lat: '   ', lng: '-122' },
      { lat: null, lng: -122 },
      { lat: false, lng: 0 },
      { lat: NaN, lng: -122 },
      {},
      null,
    ]) {
      assert.throws(() => LocationSchema.parse(invalid), InputError);
    }
  });

  test('StateCodeSchema validates 2-letter uppercase state and territory codes', () => {
    assert.equal(StateCodeSchema.parse('WA'), 'WA');
    assert.equal(StateCodeSchema.parse('CA'), 'CA');
    assert.equal(StateCodeSchema.parse('DC'), 'DC');
    assert.equal(StateCodeSchema.parse('PR'), 'PR');
    assert.equal(StateCodeSchema.parse('GU'), 'GU');
    assert.equal(StateCodeSchema.parse('VI'), 'VI');
    assert.equal(StateCodeSchema.parse('AS'), 'AS');
    assert.equal(StateCodeSchema.parse('MP'), 'MP');

    for (const bad of ['wa', 'Wa', 'ZZ', 'XX', 'USA', 'W', '12', '', null, undefined]) {
      assert.throws(() => StateCodeSchema.parse(bad), InputError);
    }
  });

  test('TreatmentSearchSchema validates required and optional clinical/payer/accreditation filters', () => {
    const base = TreatmentSearchSchema.parse({
      lat: 48.751934,
      lng: -122.478712,
      radiusMiles: 50,
      kind: 'SA',
      page: 2,
      codes: ['MD', 'BU', 'BU'],
    });
    assert.deepEqual(base, {
      lat: 48.75,
      lng: -122.48,
      radiusMiles: 50,
      kind: 'sa',
      page: 2,
      codes: ['BU', 'MD'],
    });

    const withOptional = TreatmentSearchSchema.parse({
      lat: 47.6062,
      lng: -122.3321,
      payer: 'Apple Health',
      accreditation: 'JC,CARF',
      levelOfCare: 'OTP,IOP',
    });
    assert.equal(withOptional.lat, 47.61);
    assert.equal(withOptional.lng, -122.33);
    assert.equal(withOptional.radiusMiles, 25);
    assert.equal(withOptional.kind, 'sa');
    assert.equal(withOptional.page, 1);
    assert.equal(withOptional.payer, 'Apple Health');
    assert.deepEqual(withOptional.payerCodes.primary, ['MD']);
    assert.deepEqual(withOptional.accreditation, ['CARF', 'JC']);
    assert.deepEqual(withOptional.levelOfCare, ['IOP', 'OTP']);

    // Rejects invalid accreditation or levelOfCare or >8 codes
    assert.throws(
      () => TreatmentSearchSchema.parse({ lat: 48, lng: -122, accreditation: 'BOGUS_ACC' }),
      InputError,
    );
    assert.throws(
      () => TreatmentSearchSchema.parse({ lat: 48, lng: -122, levelOfCare: 'BOGUS_LOC' }),
      InputError,
    );
    assert.throws(
      () => TreatmentSearchSchema.parse({
        lat: 48,
        lng: -122,
        codes: ['BU', 'MU', 'NU', 'MD', 'MC', 'PI', 'SS', 'PA', 'TELE'],
      }),
      InputError,
    );
  });

  test('ProviderSearchSchema validates type, radiusMiles, and dataset-specific filters', () => {
    assert.deepEqual(
      ProviderSearchSchema.parse({ type: 'va', radiusMiles: 50, filter: 'vetcenter' }),
      { type: 'va', radiusMiles: 50, filter: 'vetcenter' },
    );
    assert.deepEqual(
      ProviderSearchSchema.parse(q('type=ihs&radius=100&filter=sud&lat=35.534&lng=-108.742')),
      { type: 'ihs', radiusMiles: 100, filter: 'sud', lat: 35.53, lng: -108.74 },
    );
    assert.deepEqual(
      ProviderSearchSchema.parse({ type: 'er' }),
      { type: 'er', radiusMiles: 25, filter: null },
    );

    assert.throws(() => ProviderSearchSchema.parse({ type: 'invalid' }), InputError);
    assert.throws(() => ProviderSearchSchema.parse({ type: 'va', radiusMiles: 15 }), InputError);
    assert.throws(() => ProviderSearchSchema.parse({ type: 'va', filter: 'sud' }), InputError);
    assert.throws(() => ProviderSearchSchema.parse({ type: 'rhc', filter: 'health' }), InputError);
  });
});

describe('Insurance & In-Network Compatibility Engine', () => {
  test('resolvePayerCodes maps partial and regional insurance policy names to SAMHSA payment codes', () => {
    // State Medicaid aliases
    for (const alias of [
      'Medicaid', 'Washington Apple Health', 'Medi-Cal', 'MassHealth', 'TennCare',
      'AHCCCS', 'HUSKY Health', 'BadgerCare Plus', 'SoonerCare', 'PeachCare',
      'Texas STAR', 'CHIP', 'Medicaid MCO',
    ]) {
      const res = resolvePayerCodes(alias);
      assert.equal(res.category, 'medicaid', `Expected medicaid for "${alias}"`);
      assert.deepEqual(res.primary, ['MD']);
      assert.deepEqual(res.fallback, ['SF', 'PA']);
      assert.equal(res.recognized, true);
    }

    // Medicare aliases
    for (const alias of [
      'Medicare', 'Medicare Part A', 'Part B', 'Part D', 'Medicare Advantage', 'Dual Eligible Special Needs Plan',
    ]) {
      const res = resolvePayerCodes(alias);
      assert.equal(res.category, 'medicare', `Expected medicare for "${alias}"`);
      assert.deepEqual(res.primary, ['MC']);
      assert.deepEqual(res.fallback, ['MD', 'SF', 'PA']);
      assert.equal(res.recognized, true);
    }

    // Commercial / Private insurance aliases
    for (const alias of [
      'Private insurance', 'Commercial plan', 'Blue Cross Blue Shield', 'BCBS of Texas',
      'Anthem Blue Cross', 'Aetna Choice POS', 'Cigna Behavioral', 'UnitedHealthcare',
      'UHC Choice Plus', 'Optum Behavioral', 'Humana', 'Kaiser Permanente',
      'Molina Marketplace', 'Centene', 'Ambetter', 'Regence BlueShield', 'Premera',
      'Employer PPO', 'HMO', 'EPO',
    ]) {
      const res = resolvePayerCodes(alias);
      assert.equal(res.category, 'private', `Expected private for "${alias}"`);
      assert.deepEqual(res.primary, ['PI']);
      assert.deepEqual(res.fallback, ['SF', 'PA']);
      assert.equal(res.recognized, true);
    }

    // Military / Veteran aliases
    for (const alias of ['TRICARE West', 'VA Health Care', 'CHAMPVA', 'Military Insurance', 'Veteran Benefits']) {
      const res = resolvePayerCodes(alias);
      assert.equal(res.category, 'military', `Expected military for "${alias}"`);
      assert.deepEqual(res.primary, ['MI']);
      assert.deepEqual(res.fallback, ['SF', 'PA']);
      assert.equal(res.recognized, true);
    }

    // Tribal / IHS aliases
    for (const alias of ['IHS', 'Indian Health Service', 'Tribal Health', 'ITU Funds', 'Urban Indian Health']) {
      const res = resolvePayerCodes(alias);
      assert.equal(res.category, 'tribal', `Expected tribal for "${alias}"`);
      assert.deepEqual(res.primary, ['ITU']);
      assert.deepEqual(res.fallback, ['SF', 'PA']);
      assert.equal(res.recognized, true);
    }

    // Uninsured / Self-pay / Sliding scale aliases
    for (const alias of [
      'Uninsured', 'No insurance', 'Self-pay', 'Self pay', 'Cash only',
      'Sliding scale', 'Sliding fee', 'Charity care', 'SAMHSA Grant', 'Free', 'Payment assistance',
    ]) {
      const res = resolvePayerCodes(alias);
      assert.equal(res.category, 'uninsured', `Expected uninsured for "${alias}"`);
      assert.deepEqual(res.primary, ['SF', 'PA', 'NP', 'SAMF']);
      assert.deepEqual(res.fallback, ['SF', 'PA']);
      assert.equal(res.recognized, true);
    }
  });

  test('matchInsuranceCompatibility handles in-network, safety-net-eligible, out-of-network,unspecified, and unknown carriers', () => {
    const medicaidFacility = { codes: ['BU', 'MD', 'SF'] };
    const safetyNetOnlyFacility = { codes: ['BU', 'SF', 'PA'] };
    const privateOnlyFacility = { codes: ['BU', 'PI'] };
    const cashNoSafetyNetFacility = { codes: ['BU'] };

    // 1. Direct in-network match
    const inNet = matchInsuranceCompatibility(medicaidFacility, 'Apple Health');
    assert.equal(inNet.status, 'in-network');
    assert.deepEqual(inNet.matchedCodes, ['MD']);
    assert.deepEqual(inNet.fallbackCodes, ['SF']);

    // 2. Facility without MD or PI that offers SF/PA returns 'safety-net-eligible'
    const safetyNet = matchInsuranceCompatibility(safetyNetOnlyFacility, 'Medi-Cal');
    assert.equal(safetyNet.status, 'safety-net-eligible');
    assert.deepEqual(safetyNet.matchedCodes, []);
    assert.deepEqual(safetyNet.fallbackCodes, ['SF', 'PA']);

    // 3. Facility with only PI when searching Medicaid returns 'out-of-network'
    const outNet = matchInsuranceCompatibility(privateOnlyFacility, 'MassHealth');
    assert.equal(outNet.status, 'out-of-network');
    assert.deepEqual(outNet.matchedCodes, []);
    assert.deepEqual(outNet.fallbackCodes, []);

    // 4. Empty or null payerInput returns 'unspecified'
    assert.equal(matchInsuranceCompatibility(medicaidFacility, '').status, 'unspecified');
    assert.equal(matchInsuranceCompatibility(medicaidFacility, null).status, 'unspecified');
    assert.equal(matchInsuranceCompatibility(medicaidFacility, undefined).status, 'unspecified');

    // 5. Unknown insurance carrier checks PI (in-network) or SF/PA (safety-net-eligible) or out-of-network
    const unknownWithPi = matchInsuranceCompatibility(privateOnlyFacility, 'Regional Care Cooperative Plan');
    assert.equal(unknownWithPi.status, 'in-network');
    assert.deepEqual(unknownWithPi.matchedCodes, ['PI']);

    const unknownWithSafetyNet = matchInsuranceCompatibility(safetyNetOnlyFacility, 'Regional Care Cooperative Plan');
    assert.equal(unknownWithSafetyNet.status, 'safety-net-eligible');
    assert.deepEqual(unknownWithSafetyNet.fallbackCodes, ['SF', 'PA']);

    const unknownOut = matchInsuranceCompatibility(cashNoSafetyNetFacility, 'Regional Care Cooperative Plan');
    assert.equal(unknownOut.status, 'out-of-network');
  });

  test('normalizeFacility extracts paymentCodes and accreditationCodes and integrates with parseTreatmentQuery', () => {
    const seaMar = normalizeFacility(sample.rows[0], taxonomy);
    assert.ok(Array.isArray(seaMar.paymentCodes));
    assert.ok(Array.isArray(seaMar.accreditationCodes));
    assert.ok(seaMar.paymentCodes.every((c) => PAYMENT_CODES.includes(c)));
    assert.ok(seaMar.accreditationCodes.every((c) => ACCREDITATION_CODES.includes(c)));
    assert.deepEqual(seaMar.accreditationCodes, ['FQHC', 'JC']);

    // Synthetic facility with full payment and accreditation codes
    const synthetic = normalizeFacility(
      { name1: 'Harbor Recovery', codes: ['MD', 'PI', 'SF', 'PA', 'CARF', 'SOTP', 'BU'] },
      taxonomy,
    );
    assert.deepEqual(synthetic.paymentCodes, ['MD', 'PA', 'PI', 'SF']);
    assert.deepEqual(synthetic.accreditationCodes, ['CARF', 'SOTP']);

    // parseTreatmentQuery supports optional payer parameter while keeping existing behavior intact
    const queryWithPayer = parseTreatmentQuery(
      q('lat=48.7519&lng=-122.4787&radius=25&codes=BU&payer=BCBS'),
      taxonomy,
    );
    assert.equal(queryWithPayer.payer, 'BCBS');
    assert.deepEqual(queryWithPayer.payerCodes.primary, ['PI']);
  });
});

describe('scoreFacilityMatch, createQueryMemoizer, and taxonomy.searchServices', () => {
  test('scoreFacilityMatch ranks facilities deterministically by clinical fit, insurance, accreditation, and distance', () => {
    const ideal = {
      name: 'Ideal Clinic',
      miles: 2.5,
      codes: ['BU', 'OTP', 'TELE', 'MD', 'SF', 'JC', 'CARF'],
    };
    const partial = {
      name: 'Partial Clinic',
      miles: 12.0,
      codes: ['BU', 'SF'],
    };
    const poor = {
      name: 'Distant Out-of-Network Clinic',
      miles: 80.0,
      codes: ['PI'],
    };

    const criteria = {
      codes: ['BU', 'OTP'],
      levelsOfCare: ['TELE'],
      payer: 'Apple Health',
      accreditations: ['JC'],
    };

    const sIdeal = scoreFacilityMatch(ideal, criteria);
    const sPartial = scoreFacilityMatch(partial, criteria);
    const sPoor = scoreFacilityMatch(poor, criteria);

    assert.deepEqual(sIdeal.matchedCodes, ['BU', 'OTP', 'TELE']);
    assert.deepEqual(sIdeal.missingCodes, []);
    assert.deepEqual(sIdeal.accreditationCodes, ['JC']);
    assert.equal(sIdeal.insuranceMatch.status, 'in-network');

    assert.deepEqual(sPartial.matchedCodes, ['BU']);
    assert.deepEqual(sPartial.missingCodes, ['OTP', 'TELE']);
    assert.equal(sPartial.insuranceMatch.status, 'safety-net-eligible');

    assert.deepEqual(sPoor.matchedCodes, []);
    assert.equal(sPoor.insuranceMatch.status, 'out-of-network');

    assert.ok(sIdeal.score > sPartial.score, `Expected ${sIdeal.score} > ${sPartial.score}`);
    assert.ok(sPartial.score > sPoor.score, `Expected ${sPartial.score} > ${sPoor.score}`);

    // Empty filter state handles gracefully
    const emptyScore = scoreFacilityMatch(ideal, {});
    assert.deepEqual(emptyScore.matchedCodes, []);
    assert.deepEqual(emptyScore.missingCodes, []);
    assert.deepEqual(emptyScore.accreditationCodes, ['JC', 'CARF']);
    assert.equal(emptyScore.insuranceMatch.status, 'unspecified');
    assert.ok(emptyScore.score > 0);
  });

  test('createQueryMemoizer enforces LRU eviction and TTL expiration', () => {
    let clock = 1000;
    const memo = createQueryMemoizer({ maxEntries: 3, ttlMs: 500, now: () => clock });

    let computeCount = 0;
    const fn = memo.memoize((x) => {
      computeCount++;
      return x * 10;
    });

    assert.equal(fn(1), 10);
    assert.equal(fn(1), 10);
    assert.equal(computeCount, 1, 'second call served from memoizer');
    assert.equal(memo.hits, 1);

    assert.equal(fn(2), 20);
    assert.equal(fn(3), 30);
    assert.equal(memo.size, 3);

    // Touch key [1] so key [2] becomes least-recently-used
    assert.equal(fn(1), 10);
    // Insert key [4], evicting key [2]
    assert.equal(fn(4), 40);
    assert.equal(memo.size, 3);
    assert.equal(memo.has('[2]'), false);
    assert.equal(memo.has('[1]'), true);

    // Advance clock past TTL
    clock += 600;
    assert.equal(memo.get('[1]'), undefined);
    assert.equal(memo.size, 0);
  });

  test('taxonomy.searchServices supports exact code, partial keyword, multi-token, and fuzzy lookups', () => {
    const exactCode = taxonomy.searchServices('BU');
    assert.ok(exactCode.length > 0);
    assert.equal(exactCode[0].code, 'BU');

    const partial = taxonomy.searchServices('buprenorphine');
    assert.ok(partial.some((s) => s.code === 'BU'));
    assert.ok(partial.some((s) => s.code === 'BUM'));

    const multiToken = taxonomy.searchServices('sliding scale');
    assert.ok(multiToken.some((s) => s.code === 'SS'));

    const fuzzy = taxonomy.searchServices('buprenorphin');
    assert.ok(fuzzy.some((s) => s.code === 'BU'));

    assert.deepEqual(taxonomy.searchServices(''), []);
    assert.deepEqual(taxonomy.searchServices(null), []);
  });
});
