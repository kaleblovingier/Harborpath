import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  TELEHEALTH_CODE,
  TELEHEALTH_FLEXIBILITIES,
  parseTelehealthQuery,
  buildTelehealthUrl,
  evaluateTelehealthEligibility,
  matchesCrossStateLicensure,
} from '../src/telehealth.js';
import { createTaxonomy } from '../src/taxonomy.js';
import { createRegions } from '../src/regions.js';
import { createVirtualProviders, validateProvider } from '../src/virtualProviders.js';
import { fromFacility, fromVirtualProvider } from '../public/js/match/engine.js';
import { readJson } from '../src/util.js';
import { InputError } from '../src/findtreatment.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const taxonomy = createTaxonomy(readJson(path.join(here, '..', 'data', 'service-codes.json')));
const regions = createRegions({
  zcta: readJson(path.join(here, '..', 'data', 'zcta.json')),
  places: readJson(path.join(here, '..', 'data', 'places.json')),
  zipStates: readJson(path.join(here, '..', 'data', 'zip-states.json')),
});

const q = (s) => new URLSearchParams(s);

describe('Tele-Prescribing Flexibilities & Federal Regulations', () => {
  it('validates TELEHEALTH_FLEXIBILITIES regulatory rules for buprenorphine, methadone, and counseling', () => {
    assert.ok(TELEHEALTH_FLEXIBILITIES.buprenorphine);
    assert.ok(TELEHEALTH_FLEXIBILITIES.methadone);
    assert.ok(TELEHEALTH_FLEXIBILITIES.counseling);

    // Buprenorphine: No in-person requirement, no X-waiver, audio-only permitted
    const bup = TELEHEALTH_FLEXIBILITIES.buprenorphine;
    assert.equal(bup.inPersonExamRequired, false);
    assert.equal(bup.xWaiverRequired, false);
    assert.equal(bup.audioOnlyPermitted, true);
    assert.equal(bup.audioVisualPermitted, true);
    assert.equal(bup.otpRequired, false);
    assert.match(bup.authority, /DEA \/ SAMHSA Telemedicine Flexibilities/);
    assert.match(bup.authority, /89 FR 12472/);

    // Methadone: Audio-visual allowed under 2024 Final Rule, audio-only prohibited for initiation, accelerated take-homes
    const methadone = TELEHEALTH_FLEXIBILITIES.methadone;
    assert.equal(methadone.inPersonExamRequired, false);
    assert.equal(methadone.audioOnlyPermitted, false);
    assert.equal(methadone.audioVisualPermitted, true);
    assert.equal(methadone.otpRequired, true);
    assert.equal(methadone.takeHomeFlexibilities.days1To14, 7);
    assert.equal(methadone.takeHomeFlexibilities.days15To30, 14);
    assert.equal(methadone.takeHomeFlexibilities.days31Plus, 28);
    assert.match(methadone.authority, /42 CFR Part 8/);
    assert.match(methadone.authority, /89 FR 12472/);

    // Counseling: Audio-video and audio-only permitted
    const counseling = TELEHEALTH_FLEXIBILITIES.counseling;
    assert.equal(counseling.inPersonExamRequired, false);
    assert.equal(counseling.audioOnlyPermitted, true);
    assert.equal(counseling.audioVisualPermitted, true);
  });

  it('evaluates buprenorphine tele-prescribing without prior in-person exam', () => {
    const res = evaluateTelehealthEligibility({
      patientState: 'WA',
      medication: 'buprenorphine',
      hasBroadbandVideo: true,
    });
    assert.equal(res.eligible, true);
    assert.equal(res.medication, 'Buprenorphine');
    assert.equal(res.modality, 'audio-visual');
    assert.equal(res.inPersonExamRequired, false);
    assert.equal(res.audioOnlyFallbackAllowed, true);
    assert.equal(res.isCrossState, false);
    assert.match(res.authority, /Telemedicine Flexibilities/);
  });
});

describe('Audio-Only Fallback & Broadband Equity Logic', () => {
  it('allows audio-only telephone fallback for buprenorphine when broadband video is unavailable', () => {
    const audioOnlyBup = evaluateTelehealthEligibility({
      patientState: 'AK',
      medication: 'buprenorphine',
      hasBroadbandVideo: false,
    });
    assert.equal(audioOnlyBup.eligible, true);
    assert.equal(audioOnlyBup.modality, 'audio-only');
    assert.equal(audioOnlyBup.audioOnlyFallbackAllowed, true);
    assert.equal(audioOnlyBup.inPersonExamRequired, false);
  });

  it('prohibits audio-only phone initiation for methadone under federal 42 CFR Part 8 rules', () => {
    // With broadband video: eligible for audio-visual telehealth
    const videoMethadone = evaluateTelehealthEligibility({
      patientState: 'OR',
      medication: 'methadone',
      hasBroadbandVideo: true,
    });
    assert.equal(videoMethadone.eligible, true);
    assert.equal(videoMethadone.modality, 'audio-visual');
    assert.equal(videoMethadone.audioOnlyFallbackAllowed, false);

    // Without broadband video: audio-only initiation is rejected with clinical/legal justification
    const audioMethadone = evaluateTelehealthEligibility({
      patientState: 'OR',
      medication: 'methadone',
      hasBroadbandVideo: false,
    });
    assert.equal(audioMethadone.eligible, false);
    assert.equal(audioMethadone.modality, 'none');
    assert.match(audioMethadone.reason, /audio-visual telehealth under federal law/i);
    assert.match(audioMethadone.reason, /audio-only phone appointments are not permitted/i);
    assert.match(audioMethadone.authority, /42 CFR Part 8/);
  });

  it('supports audio-only and audio-video delivery for outpatient counseling', () => {
    const videoCounseling = evaluateTelehealthEligibility({
      patientState: 'ID',
      medication: 'counseling',
      hasBroadbandVideo: true,
    });
    assert.equal(videoCounseling.eligible, true);
    assert.equal(videoCounseling.modality, 'audio-visual');

    const audioCounseling = evaluateTelehealthEligibility({
      patientState: 'ID',
      medication: 'counseling',
      hasBroadbandVideo: false,
    });
    assert.equal(audioCounseling.eligible, true);
    assert.equal(audioCounseling.modality, 'audio-only');
  });

  it('handles unknown medications or services gracefully', () => {
    const unknown = evaluateTelehealthEligibility({
      patientState: 'WA',
      medication: 'experimental_therapy_xyz',
      hasBroadbandVideo: true,
    });
    assert.equal(unknown.eligible, false);
    assert.match(unknown.reason, /Unknown medication/);
  });
});

describe('Cross-State Licensure & Telehealth Matching', () => {
  it('matches cross-state provider licensure accurately', () => {
    // Provider licensed in WA and OR; patient in WA
    const matchInState = matchesCrossStateLicensure(['WA', 'OR'], 'WA');
    assert.equal(matchInState.matched, true);
    assert.equal(matchInState.status, 'licensed');
    assert.match(matchInState.note, /licensed to provide telehealth care in WA/);

    // Provider licensed only in WA and OR; patient in CA
    const matchOutOfState = matchesCrossStateLicensure(['WA', 'OR'], 'CA');
    assert.equal(matchOutOfState.matched, false);
    assert.equal(matchOutOfState.status, 'out-of-state');
    assert.match(matchOutOfState.note, /only licensed in \[WA, OR\], not in CA/);

    // Provider with null serviceStates (unknown state coverage requiring verification)
    const matchUnknown = matchesCrossStateLicensure(null, 'MT');
    assert.equal(matchUnknown.matched, true);
    assert.equal(matchUnknown.status, 'unknown-verify');
    assert.match(matchUnknown.note, /verify directly with the clinic/);

    // Invalid arguments
    assert.equal(matchesCrossStateLicensure(['WA'], '').matched, false);
    assert.equal(matchesCrossStateLicensure('not-an-array', 'WA').matched, false);
  });

  it('evaluates cross-state flags in evaluateTelehealthEligibility when providerState is specified', () => {
    const inState = evaluateTelehealthEligibility({
      patientState: 'WA',
      providerState: 'WA',
      medication: 'buprenorphine',
    });
    assert.equal(inState.isCrossState, false);

    const crossState = evaluateTelehealthEligibility({
      patientState: 'ID',
      providerState: 'WA',
      medication: 'buprenorphine',
    });
    assert.equal(crossState.isCrossState, true);
  });

  it('validates parseTelehealthQuery parameters, jurisdiction restrictions, and URL construction', () => {
    assert.equal(TELEHEALTH_CODE, 'TELE');

    // Valid query with state and service code
    const parsed = parseTelehealthQuery(q('state=wa&codes=BU'), { taxonomy, anchorFor: regions.anchor });
    assert.equal(parsed.state, 'WA');
    assert.equal(parsed.byDistance, false);
    assert.deepEqual(parsed.codes, ['BU', 'TELE']);

    const urlStr = buildTelehealthUrl(parsed);
    const url = new URL(urlStr);
    assert.equal(url.searchParams.get('stateCode'), "'WA'");
    assert.equal(url.searchParams.get('limitType'), '2');
    assert.equal(url.searchParams.get('sort'), '2'); // sort by name when no distance
    assert.equal(url.searchParams.get('sCodes'), 'BU,TELE');

    // With explicit visitor coordinates
    const withPoint = parseTelehealthQuery(q('state=wa&lat=47.6062&lng=-122.3321'), { taxonomy, anchorFor: regions.anchor });
    assert.equal(withPoint.byDistance, true);
    assert.equal(withPoint.lat, 47.61); // coarsened
    assert.equal(withPoint.lng, -122.33);

    const pointUrl = new URL(buildTelehealthUrl(withPoint));
    assert.equal(pointUrl.searchParams.get('sort'), '0'); // sort by distance

    // Invalid states
    assert.throws(() => parseTelehealthQuery(q('state=ZZ'), { taxonomy, anchorFor: regions.anchor }), InputError);
    assert.throws(() => parseTelehealthQuery(q('state=AE'), { taxonomy, anchorFor: regions.anchor }), InputError); // military
    assert.throws(() => parseTelehealthQuery(q('state=FM'), { taxonomy, anchorFor: regions.anchor }), InputError); // freely-associated

    // Invalid kind or out-of-range page
    assert.throws(() => parseTelehealthQuery(q('state=WA&kind=invalid'), { taxonomy, anchorFor: regions.anchor }), InputError);
    assert.throws(() => parseTelehealthQuery(q('state=WA&page=0'), { taxonomy, anchorFor: regions.anchor }), InputError);
    assert.throws(() => parseTelehealthQuery(q('state=WA&page=99'), { taxonomy, anchorFor: regions.anchor }), InputError);

    // Too many extra codes (> 7)
    assert.throws(() => parseTelehealthQuery(q('state=WA&codes=BU,NU,OTP,PW,CBT,MI,TRC,FT'), { taxonomy, anchorFor: regions.anchor }), InputError);
  });

  it('converts facility and virtual provider records for matching engine with state licensure boundaries', () => {
    // Facility candidate with address
    const fac = fromFacility({
      id: 'ft-wa-101',
      name: 'Cascadia Health Center',
      address: { state: 'WA' },
      codes: ['TELE', 'BU', 'OP'],
      miles: 15.2,
    });
    assert.equal(fac.kind, 'facility');
    assert.equal(fac.telehealth, true);
    assert.equal(fac.virtualOnly, false);
    assert.deepEqual(fac.serviceStates, ['WA']);

    // Virtual provider candidate
    const vp = fromVirtualProvider({
      id: 'telehealth-direct',
      name: 'Telehealth Direct',
      serviceStates: ['WA', 'OR', 'ID'],
      services: ['moud-buprenorphine', 'counseling'],
      conditions: ['opioid'],
      sources: [{ accessedAt: '2026-10-27' }],
    });
    assert.equal(vp.kind, 'virtual');
    assert.equal(vp.virtualOnly, true);
    assert.equal(vp.telehealth, true);
    assert.deepEqual(vp.serviceStates, ['WA', 'OR', 'ID']);
    assert.ok(vp.codes.has('BU'));
    assert.ok(vp.codes.has('TELE'));
  });

  it('filters virtual provider registry by state and flags unknown state coverage', () => {
    const fixtureRegistry = {
      generatedAt: '2026-10-27',
      providers: [
        {
          id: 'program-wa-only',
          name: 'WA Care Telehealth',
          officialUrl: 'https://wa.example.org/',
          enrollUrl: null,
          phone: null,
          conditions: ['opioid'],
          services: ['moud-buprenorphine'],
          serviceStates: ['WA'],
          sources: [{ url: 'https://wa.example.org/about', accessedAt: '2026-10-27', type: 'official' }],
          verificationStatus: 'provider-reported',
          reviewStatus: 'approved',
          reviewedBy: 'fixture-reviewer',
          reviewedAt: '2026-10-27',
        },
        {
          id: 'program-national-unknown',
          name: 'National Telehealth App',
          officialUrl: 'https://app.example.org/',
          enrollUrl: null,
          phone: null,
          conditions: ['opioid'],
          services: ['counseling'],
          serviceStates: null, // unknown coverage
          sources: [{ url: 'https://app.example.org/about', accessedAt: '2026-10-27', type: 'official' }],
          verificationStatus: 'provider-reported',
          reviewStatus: 'approved',
          reviewedBy: 'fixture-reviewer',
          reviewedAt: '2026-10-27',
        },
      ],
    };

    const vpEngine = createVirtualProviders(fixtureRegistry, { logger: { error: () => {} } });

    // Search for WA: includes WA-specific program and national program with unknown state flag
    const waSearch = vpEngine.search(q('state=WA'));
    assert.equal(waSearch.results.length, 2);
    const waOnly = waSearch.results.find((p) => p.id === 'program-wa-only');
    assert.equal(waOnly.statesUnknown, false);
    const national = waSearch.results.find((p) => p.id === 'program-national-unknown');
    assert.equal(national.statesUnknown, true);

    // Search for OR: excludes WA-only program, includes national unknown program
    const orSearch = vpEngine.search(q('state=OR'));
    assert.equal(orSearch.results.length, 1);
    assert.equal(orSearch.results[0].id, 'program-national-unknown');
    assert.equal(orSearch.results[0].statesUnknown, true);
  });
});
