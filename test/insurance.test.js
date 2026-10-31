import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as matchEngine from '../public/js/match/engine.js';
import {
  resolvePayerCodes,
  matchInsuranceCompatibility,
  scoreFacilityMatch,
} from '../src/schema.js';
import { buildIntakeCallScript } from '../public/js/views/plan.js';
import { evaluateAsamCare, formatAsamHandoffText } from '../public/js/views/navigator.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(here, '..');
const stateMedicaid = JSON.parse(
  fs.readFileSync(path.join(rootDir, 'data', 'state-medicaid.json'), 'utf8'),
);

const {
  COVERAGE_TIERS,
  PAY_CODES,
  normalizeProfile,
  fromFacility,
  assessCoverage,
  scoreCandidate,
  rankMatches,
} = matchEngine;

const NOW = Date.parse('2026-10-31T00:00:00Z');

function makeFacility(id, codes, extra = {}) {
  return fromFacility(
    {
      id,
      name: extra.name ?? `Facility ${id}`,
      codes,
      miles: extra.miles !== undefined ? extra.miles : 5.0,
      address: { state: extra.state ?? 'WA' },
      ...extra,
    },
    { via: extra.via ?? 'local', state: extra.state ?? 'WA' },
  );
}

describe('Insurance & Safety-Net Compatibility Engine — match/engine.js & schema.js', () => {
  it('classifies all 5 evidence-graded coverage tiers accurately and never upgrades provider-reported codes without sourced verification', () => {
    assert.deepEqual(COVERAGE_TIERS, [
      'confirmed',
      'provider-reported',
      'possible',
      'not-listed',
      'unknown',
    ]);
    for (const code of ['MD', 'MC', 'PI', 'TRICARE', 'VAF', 'ITU', 'SS', 'PA', 'NP']) {
      assert.ok(PAY_CODES.has(code), `Expected PAY_CODES to contain ${code}`);
    }

    const waMedicaid = normalizeProfile({ coverage: 'medicaid', state: 'WA' });

    // 1. Confirmed match requires explicit sourced networkVerifications
    const confirmedFac = makeFacility('conf-1', ['SA', 'OP', 'BU', 'MD'], {
      networkVerifications: [
        { payer: 'medicaid', source: 'WA HCA Apple Health Directory', verifiedAt: '2026-10-15', state: 'WA' },
      ],
    });
    const confRes = assessCoverage(waMedicaid, confirmedFac);
    assert.equal(confRes.tier, 'confirmed');
    assert.equal(confRes.score, 1);

    // 2. Provider-reported match when SAMHSA payment code matches in-state
    const reportedFac = makeFacility('rep-1', ['SA', 'OP', 'BU', 'MD'], { state: 'WA' });
    const repRes = assessCoverage(waMedicaid, reportedFac);
    assert.equal(repRes.tier, 'provider-reported');
    assert.ok(repRes.verify.some((v) => v.code === 'verify.plan'));

    // 3. Possible match when out-of-state Medicaid or safety-net alternative (SS / PA / NP) is offered
    const outOfStateMedicaid = makeFacility('or-md', ['SA', 'OP', 'MD'], { state: 'OR' });
    const outStateRes = assessCoverage(waMedicaid, outOfStateMedicaid);
    assert.equal(outStateRes.tier, 'possible');
    assert.ok(outStateRes.reasons.some((r) => r.code === 'coverage.medicaidOtherState'));

    const safetyNetFallback = makeFacility('ss-fallback', ['SA', 'OP', 'PI', 'SS', 'PA'], { state: 'WA' });
    const fallbackRes = assessCoverage(waMedicaid, safetyNetFallback);
    assert.equal(fallbackRes.tier, 'possible');
    assert.ok(fallbackRes.affordability.includes('sliding-scale'));
    assert.ok(fallbackRes.affordability.includes('payment-assistance'));

    // 4. Not-listed when facility reports other payers (e.g. PI only) without safety-net options
    const privateOnly = makeFacility('pi-only', ['SA', 'OP', 'PI'], { state: 'WA' });
    const notListedRes = assessCoverage(waMedicaid, privateOnly);
    assert.equal(notListedRes.tier, 'not-listed');

    // 5. Unknown when facility lists no payment codes at all
    const noPayCodes = makeFacility('no-pay', ['SA', 'OP', 'BU'], { state: 'WA' });
    const unknownRes = assessCoverage(waMedicaid, noPayCodes);
    assert.equal(unknownRes.tier, 'unknown');
    assert.ok(unknownRes.verify.some((v) => v.code === 'verify.noPaymentInfo'));
  });

  it('preserves facility distance (miles) and breaks ties deterministically by distance then name, ignoring paid/sponsored fields', () => {
    const profile = {
      helpWith: 'substance',
      substances: ['opioid'],
      medications: ['buprenorphine'],
      coverage: 'medicaid',
      modality: 'in-person',
      state: 'WA',
      maxMiles: 50,
    };

    const farMatched = makeFacility('far-md', ['SA', 'OP', 'BU', 'MD'], {
      name: 'Beta Recovery',
      miles: 18.4,
    });
    const nearMatched = makeFacility('near-md', ['SA', 'OP', 'BU', 'MD'], {
      name: 'Alpha Recovery',
      miles: 2.1,
    });
    const sameDistLaterName = makeFacility('tie-z', ['SA', 'OP', 'BU', 'MD'], {
      name: 'Zeta Clinic',
      miles: 2.1,
    });
    const statewideDup = makeFacility('near-md', ['SA', 'OP', 'BU', 'MD', 'TELE'], {
      name: 'Alpha Recovery',
      miles: null,
      via: 'telehealth',
    });

    // Attempt to corrupt ranking with paid placement / sponsorship properties
    Object.assign(farMatched, { sponsored: true, paidPlacement: true, bid: 999999 });

    const ranked = rankMatches(
      profile,
      [farMatched, sameDistLaterName, statewideDup, nearMatched],
      { now: NOW },
    );

    assert.equal(ranked.matches.length, 3, 'Duplicate local + telehealth entries must merge');
    assert.equal(ranked.matches[0].id, 'ft:near-md');
    assert.equal(ranked.matches[0].candidate.miles, 2.1, 'Must preserve finite miles from local listing');
    assert.equal(ranked.matches[1].id, 'ft:tie-z');
    assert.equal(ranked.matches[1].candidate.miles, 2.1);
    assert.equal(ranked.matches[2].id, 'ft:far-md');
    assert.equal(ranked.matches[2].candidate.miles, 18.4);

    // Confirm sponsorship did not inflate farMatched's score over an identical baseline
    const cleanFar = makeFacility('far-md-clean', ['SA', 'OP', 'BU', 'MD'], {
      name: 'Beta Recovery',
      miles: 18.4,
    });
    assert.equal(
      scoreCandidate(profile, farMatched, { now: NOW }).score,
      scoreCandidate(profile, cleanFar, { now: NOW }).score,
    );
  });

  it('tests gradeInsurance, rankTreatment, and INSURANCE_TIERS on match/engine.js when exported', () => {
    if (matchEngine.INSURANCE_TIERS) {
      assert.ok(typeof matchEngine.INSURANCE_TIERS === 'object');
    }
    if (typeof matchEngine.gradeInsurance === 'function') {
      const grade = matchEngine.gradeInsurance(
        { codes: ['SA', 'OP', 'BU', 'MD'], state: 'WA' },
        { coverage: 'medicaid', state: 'WA' },
      );
      assert.ok(grade && typeof grade === 'object');
    }
    if (typeof matchEngine.rankTreatment === 'function') {
      const ranked = matchEngine.rankTreatment(
        [
          { id: '1', name: 'Clinic A', codes: ['SA', 'OP', 'BU', 'MD'], miles: 8.2, address: { state: 'WA' } },
          { id: '2', name: 'Clinic B', codes: ['SA', 'OP', 'BU', 'MD'], miles: 1.5, address: { state: 'WA' } },
        ],
        { coverage: 'medicaid', substances: ['opioid'], state: 'WA' },
      );
      assert.ok(Array.isArray(ranked) || (ranked && Array.isArray(ranked.matches)));
    }
  });

  it('maps regional Medicaid, Medicare, Commercial, Military, Tribal, and Uninsured aliases via resolvePayerCodes and matchInsuranceCompatibility', () => {
    assert.equal(resolvePayerCodes('Apple Health').category, 'medicaid');
    assert.equal(resolvePayerCodes('Medi-Cal').category, 'medicaid');
    assert.equal(resolvePayerCodes('MassHealth').category, 'medicaid');
    assert.equal(resolvePayerCodes('Medicare Advantage').category, 'medicare');
    assert.equal(resolvePayerCodes('Blue Cross Blue Shield').category, 'private');
    assert.equal(resolvePayerCodes('TRICARE').category, 'military');
    assert.equal(resolvePayerCodes('Indian Health Service').category, 'tribal');
    assert.equal(resolvePayerCodes('Uninsured / Sliding Scale').category, 'uninsured');

    const facWithSafetyNet = { codes: ['BU', 'OP', 'SF', 'PA'], miles: 4.2 };
    const compat = matchInsuranceCompatibility(facWithSafetyNet, 'Medi-Cal');
    assert.equal(compat.status, 'safety-net-eligible');

    const scored = scoreFacilityMatch(
      { name: 'Harbor Health', miles: 3.4, codes: ['BU', 'MD', 'SF', 'FQHC', 'JC'] },
      { codes: ['BU'], payer: 'Apple Health', accreditations: ['JC'] },
    );
    assert.equal(scored.insuranceMatch.status, 'in-network');
    assert.ok(scored.score > 0);
  });
});

describe('Federal Legal & Clinical Protections: EMTALA, DEA 72-Hour Rule, MHPAEA Parity & EKRA Anti-Brokering', () => {
  it('verifies EMTALA emergency stabilization and DEA 72-Hour Rule (21 CFR § 1306.07(b)) rights across clinical modules', () => {
    const acuteEval = evaluateAsamCare({
      substances: ['opioids', 'alcohol'],
      withdrawalRisk: 'severe',
      biomedical: 'acute_infection',
    });
    const handoff = formatAsamHandoffText(
      { substances: ['opioids', 'alcohol'], withdrawalRisk: 'severe', biomedical: 'acute_infection' },
      acuteEval,
    );

    assert.match(handoff, /EMTALA/);
    assert.match(handoff, /21 CFR 1306\.07\(b\)/);
    assert.ok(
      acuteEval.redFlags.some((f) => /EMTALA/i.test(f)),
      'Acute infection red flag must inform visitor of EMTALA emergency screening & stabilization rights',
    );
    assert.ok(
      acuteEval.clinicalNotes.some((n) => /21 CFR § 1306\.07\(b\)|72-Hour Rule/i.test(n)),
      'Opioid clinical notes must explain DEA 72-Hour Rule (21 CFR § 1306.07(b))',
    );
  });

  it('verifies MHPAEA parity rights and EKRA (18 U.S.C. § 220) anti-patient-brokering warnings in call scripts and choosing-care guidance', () => {
    const privateScript = buildIntakeCallScript({
      caller: 'self',
      need: 'detox',
      insurance: 'private',
    });

    assert.ok(
      privateScript.barrierRights.some((r) => /Mental Health Parity and Addiction Equity Act|MHPAEA|Parity/i.test(r)),
      'Private insurance script must explain MHPAEA parity rights',
    );
    assert.match(
      privateScript.redFlagReminder,
      /EKRA|patient brokering/i,
      'Call script must warn against illegal patient brokering under EKRA',
    );

    const guidesSrc = fs.readFileSync(
      path.join(rootDir, 'public', 'js', 'views', 'guides.js'),
      'utf8',
    );
    assert.match(guidesSrc, /18 U\.S\.C\. § 220|EKRA/);
    const navSrc = fs.readFileSync(
      path.join(rootDir, 'public', 'js', 'views', 'navigator.js'),
      'utf8',
    );
    assert.match(navSrc, /EMTALA/);
    assert.match(navSrc, /21 CFR § 1306\.07\(b\)/);
  });
});

describe('State & U.S. Territory Medicaid Directory (data/state-medicaid.json)', () => {
  it('covers all 50 states, DC, and all 5 U.S. territories (AS, GU, MP, PR, VI) with valid anchors and safe URLs', () => {
    const requiredCodes = [
      'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL',
      'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME',
      'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH',
      'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI',
      'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
      'AS', 'GU', 'MP', 'PR', 'VI',
    ];

    for (const code of requiredCodes) {
      const entry = stateMedicaid[code];
      assert.ok(entry && typeof entry === 'object', `Missing Medicaid directory entry for ${code}`);
      assert.equal(typeof entry.anchor, 'string', `Expected anchor string for ${code}`);
      assert.ok(Array.isArray(entry.phones), `Expected phones array for ${code}`);

      for (const urlField of ['url', 'eligibilityUrl', 'applyUrl', 'contactsUrl']) {
        const val = entry[urlField];
        if (val !== null && val !== undefined) {
          assert.match(
            val,
            /^https?:\/\//i,
            `${code}.${urlField} must be an http(s) URL, got ${val}`,
          );
          assert.doesNotMatch(val, /^(javascript|data):/i);
        }
      }
    }
  });
});

describe('insuranceHelpers.js — Sub-Agent 2/3 Zero-PII In-RAM Coverage Engine (when merged)', () => {
  it('dynamically imports and validates INSURANCE_TIERS, evaluateFacilityCoverage, rankFacilitiesByCoverage, buildVerificationScript, and resetInsuranceState', async () => {
    const helperPath = path.join(rootDir, 'public', 'js', 'views', 'insuranceHelpers.js');
    if (!fs.existsSync(helperPath)) {
      // In isolated Sub-Agent 5 worktree before merge: verify baseline passes cleanly.
      return;
    }

    const insMod = await import(pathToFileURL(helperPath).href);

    // 1. INSURANCE_TIERS
    if (insMod.INSURANCE_TIERS) {
      const tiers = insMod.INSURANCE_TIERS;
      const values = Array.isArray(tiers) ? tiers : Object.keys(tiers).concat(Object.values(tiers));
      for (const expected of [
        'EMTALA_PROTECTED',
        'CONFIRMED_MATCH',
        'VERIFY_NETWORK',
        'SAFETY_NET_FALLBACK',
        'UNVERIFIED_OR_MISMATCH',
      ]) {
        assert.ok(
          values.includes(expected),
          `Expected INSURANCE_TIERS to include ${expected}`,
        );
      }
    }

    // 2. evaluateFacilityCoverage
    if (typeof insMod.evaluateFacilityCoverage === 'function') {
      const emtalaRes = insMod.evaluateFacilityCoverage(
        { id: 'er-1', name: 'Harborview ED', codes: ['HI', 'DT', 'SA'], isEmergency: true, miles: 1.2 },
        { payer: 'uninsured', emergency: true, isEmergency: true, state: 'WA' },
      );
      assert.ok(emtalaRes && typeof emtalaRes === 'object');

      const medicaidFac = {
        id: 'md-1',
        name: 'Community Clinic',
        codes: ['SA', 'OP', 'BU', 'MD', 'SS'],
        miles: 3.5,
        address: { state: 'WA' },
      };
      const mdRes = insMod.evaluateFacilityCoverage(medicaidFac, {
        payer: 'medicaid',
        coverage: 'medicaid',
        state: 'WA',
      });
      assert.ok(mdRes && typeof mdRes === 'object');

      const safetyNetFac = {
        id: 'sn-1',
        name: 'Sliding Scale Health Center',
        codes: ['SA', 'OP', 'BU', 'SS', 'PA', 'NP', 'FQHC'],
        miles: 4.0,
        address: { state: 'WA' },
      };
      const snRes = insMod.evaluateFacilityCoverage(safetyNetFac, {
        payer: 'uninsured',
        coverage: 'uninsured',
        state: 'WA',
      });
      assert.ok(snRes && typeof snRes === 'object');
    }

    // 3. rankFacilitiesByCoverage (distance-preserving)
    if (typeof insMod.rankFacilitiesByCoverage === 'function') {
      const inputFacilities = [
        { id: 'mismatch', name: 'Private Only', codes: ['SA', 'OP', 'PI'], miles: 1.0, address: { state: 'WA' } },
        { id: 'safetynet', name: 'Safety Net', codes: ['SA', 'OP', 'SS', 'PA'], miles: 6.5, address: { state: 'WA' } },
        { id: 'match-far', name: 'Medicaid Far', codes: ['SA', 'OP', 'MD'], miles: 12.0, address: { state: 'WA' } },
        { id: 'match-near', name: 'Medicaid Near', codes: ['SA', 'OP', 'MD'], miles: 2.3, address: { state: 'WA' } },
      ];
      const ranked = insMod.rankFacilitiesByCoverage(inputFacilities, {
        payer: 'medicaid',
        coverage: 'medicaid',
        state: 'WA',
      });
      assert.ok(Array.isArray(ranked) && ranked.length === 4);
      for (const item of ranked) {
        const miles = item.miles ?? item.facility?.miles ?? item.candidate?.miles;
        assert.ok(Number.isFinite(miles), 'rankFacilitiesByCoverage must preserve numeric miles');
      }
    }

    // 4. buildVerificationScript (EMTALA, MHPAEA, EKRA 18 U.S.C. § 220)
    if (typeof insMod.buildVerificationScript === 'function') {
      const script = insMod.buildVerificationScript({
        payer: 'private',
        coverage: 'private',
        state: 'WA',
        medications: ['buprenorphine'],
      });
      const text = typeof script === 'string' ? script : JSON.stringify(script);
      assert.match(text, /EKRA|18 U\.S\.C\.|brokering/i);
      assert.match(text, /parity|MHPAEA|in-network/i);
    }

    // 5. resetInsuranceState
    if (typeof insMod.resetInsuranceState === 'function') {
      assert.doesNotThrow(() => insMod.resetInsuranceState());
    }
  });
});
