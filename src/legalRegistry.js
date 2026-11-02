// Legal & Harm Reduction Statutory Registry for HarborPath.
// Provides fast, zero-allocation, memoized lookups for Good Samaritan overdose laws,
// naloxone access policies, and harm reduction equipment statutes across all 50 US
// states, Washington D.C., and Puerto Rico (52 jurisdictions).
//
// Zero npm dependencies (Node 20+ built-ins only). Strictly confidential: queries
// operate purely on state codes with zero collection or retention of PII.

import { readFileSync } from 'node:fs';

/**
 * Plain-language statutory disclaimer exported for API consumers and UI presentation.
 * Explicitly notes that data is unverified by a licensed attorney, statutes change,
 * users should confirm with linked sources or local legal aid / harm reduction programs,
 * and ALWAYS call 911 first during an overdose emergency.
 */
export const LEGAL_DISCLAIMER =
  'Statutory information presented here is unverified by a licensed attorney. Statutes change frequently and enforcement varies across jurisdictions. Confirm current statutory protections with linked authoritative sources or local legal aid / harm reduction programs. In any suspected overdose emergency, ALWAYS call 911 first to save a life — medical resuscitation is the first and most critical priority.';

/**
 * @typedef {Object} LegalSource
 * @property {string} name
 * @property {string} url
 */

/**
 * @typedef {Object} GoodSamaritanProtection
 * @property {boolean} hasProtection
 * @property {boolean} arrestImmunity
 * @property {boolean} chargeImmunity
 * @property {boolean} prosecutionImmunity
 * @property {boolean} protectsParoleProbation
 * @property {boolean} protectsParaphernalia
 * @property {boolean} protectsUnderageAlcohol
 * @property {string} statuteCitation
 */

/**
 * @typedef {Object} NaloxoneAccess
 * @property {boolean} standingOrder
 * @property {boolean} thirdPartyPrescribing
 * @property {boolean} layResponderImmunity
 * @property {string} statuteCitation
 */

/**
 * @typedef {Object} HarmReductionEquipment
 * @property {boolean} fentanylTestStripsLegal
 * @property {boolean} xylazineTestStripsLegal
 * @property {boolean} sspStatutoryProtection
 * @property {string} statuteNotes
 */

/**
 * @typedef {Object} JurisdictionLegalRecord
 * @property {string} stateCode
 * @property {string} stateName
 * @property {string} reviewStatus
 * @property {string|null} lastReviewed
 * @property {ReadonlyArray<LegalSource>} sources
 * @property {string} disclaimer
 * @property {GoodSamaritanProtection} goodSamaritan
 * @property {NaloxoneAccess} naloxoneAccess
 * @property {HarmReductionEquipment} harmReductionEquipment
 */

/**
 * Deep freezes an object and its nested properties to guarantee immutability.
 * @template T
 * @param {T} obj
 * @returns {Readonly<T>}
 */
function deepFreeze(obj) {
  if (obj === null || typeof obj !== 'object' || Object.isFrozen(obj)) {
    return obj;
  }
  Object.freeze(obj);
  for (const key of Object.keys(obj)) {
    deepFreeze(obj[key]);
  }
  return obj;
}

// In-memory cache structures for zero-allocation hot-path queries.
let cachedRegistryList = null;
let cachedRegistryMap = null;
let cachedSummaryMap = null;

/**
 * Generate a pre-computed plain-language summary for a legal record.
 * @param {JurisdictionLegalRecord} record
 * @returns {Object}
 */
function buildJurisdictionSummary(record) {
  const gs = record.goodSamaritan;
  const nx = record.naloxoneAccess;
  const hr = record.harmReductionEquipment;

  // Build Good Samaritan summary sentence
  let gsSummary;
  if (!gs.hasProtection) {
    gsSummary = `${record.stateName} does not have a comprehensive Good Samaritan overdose protection law.`;
  } else {
    const immunities = [];
    if (gs.arrestImmunity) immunities.push('arrest');
    if (gs.chargeImmunity) immunities.push('charge');
    if (gs.prosecutionImmunity) immunities.push('prosecution');

    const immunityText = immunities.length > 0
      ? `Immunity from ${immunities.join(', ')} for personal drug possession`
      : 'Affirmative defense / mitigation for personal drug possession';

    const extra = [];
    if (gs.protectsParaphernalia) extra.push('drug paraphernalia');
    if (gs.protectsUnderageAlcohol) extra.push('underage alcohol consumption');

    const extraText = extra.length > 0 ? `; also covers ${extra.join(' and ')}` : '';
    const paroleText = gs.protectsParoleProbation
      ? ' Protects individuals on parole or probation from supervision revocation for calling.'
      : ' Does NOT explicitly protect against probation or parole violations.';

    gsSummary = `${immunityText}${extraText}.${paroleText} (${gs.statuteCitation})`;
  }

  // Build Naloxone access summary
  const nxParts = [];
  if (nx.standingOrder) nxParts.push('statewide standing order (available at pharmacies without individual prescription)');
  if (nx.thirdPartyPrescribing) nxParts.push('third-party prescribing / distribution authorized');
  if (nx.layResponderImmunity) nxParts.push('civil and criminal immunity for lay responders administering naloxone in good faith');
  const nxSummary = nxParts.length > 0
    ? `Naloxone access supported by ${nxParts.join('; ')}. (${nx.statuteCitation})`
    : `Naloxone access governed by ${nx.statuteCitation}.`;

  // Build Harm Reduction equipment summary
  const ftsText = hr.fentanylTestStripsLegal
    ? 'Fentanyl test strips (FTS) are legal / decriminalized.'
    : 'Fentanyl test strips remain classified as illegal drug paraphernalia under state statute.';
  const xtsText = hr.xylazineTestStripsLegal
    ? 'Xylazine test strips are legal / exempted.'
    : 'Xylazine test strips lack explicit statutory exemption.';
  const sspText = hr.sspStatutoryProtection
    ? 'Syringe Services Programs (SSPs) are explicitly authorized by statute.'
    : 'Syringe Services Programs lack explicit statewide statutory authorization.';
  const hrSummary = `${ftsText} ${xtsText} ${sspText} ${hr.statuteNotes}`;

  const plainLanguageNotice = `${record.stateName} overdose response summary: Calling 911 for an overdose is protected under ${gs.statuteCitation}. ` +
    `Naloxone is accessible via pharmacy standing order (${nx.statuteCitation}). ${ftsText}`;

  return deepFreeze({
    stateCode: record.stateCode,
    stateName: record.stateName,
    reviewStatus: record.reviewStatus ?? 'unverified',
    lastReviewed: record.lastReviewed ?? null,
    sources: record.sources ?? [],
    disclaimer: LEGAL_DISCLAIMER,
    goodSamaritan: {
      hasProtection: gs.hasProtection,
      arrestImmunity: gs.arrestImmunity,
      chargeImmunity: gs.chargeImmunity,
      prosecutionImmunity: gs.prosecutionImmunity,
      protectsParoleProbation: gs.protectsParoleProbation,
      protectsParaphernalia: gs.protectsParaphernalia,
      protectsUnderageAlcohol: gs.protectsUnderageAlcohol,
      statuteCitation: gs.statuteCitation,
      summary: gsSummary,
    },
    naloxoneAccess: {
      standingOrder: nx.standingOrder,
      thirdPartyPrescribing: nx.thirdPartyPrescribing,
      layResponderImmunity: nx.layResponderImmunity,
      statuteCitation: nx.statuteCitation,
      summary: nxSummary,
    },
    harmReductionEquipment: {
      fentanylTestStripsLegal: hr.fentanylTestStripsLegal,
      xylazineTestStripsLegal: hr.xylazineTestStripsLegal,
      sspStatutoryProtection: hr.sspStatutoryProtection,
      statuteNotes: hr.statuteNotes,
      summary: hrSummary,
    },
    plainLanguageNotice,
    confidentialityNotice: 'This legal registry query is strictly confidential with zero-PII tracking. HarborPath does not collect, log, or transmit any personal identifiable information or visitor location.',
    citations: [gs.statuteCitation, nx.statuteCitation].filter(Boolean),
  });
}

/**
 * Initializes and caches the legal registry from data/state-legal.json.
 * Memoized: subsequent invocations return cached records with zero disk/JSON parsing overhead.
 *
 * @param {Object} [options]
 * @param {boolean} [options.reload=false] Force reloading and re-caching data from disk.
 * @returns {ReadonlyArray<JurisdictionLegalRecord>}
 */
export function loadLegalRegistry(options = {}) {
  const reload = options?.reload === true;
  if (!reload && cachedRegistryList && cachedRegistryMap) {
    return cachedRegistryList;
  }

  const rawJson = readFileSync(new URL('../data/state-legal.json', import.meta.url), 'utf8');
  const parsed = JSON.parse(rawJson);

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error('Failed to load legal registry: data/state-legal.json is empty or invalid.');
  }

  const map = new Map();
  const summaryMap = new Map();
  const frozenList = [];

  for (const item of parsed) {
    if (!item?.stateCode || typeof item.stateCode !== 'string') {
      throw new Error('Malformed jurisdiction record missing stateCode.');
    }
    const code = item.stateCode.trim().toUpperCase();
    const frozenRecord = deepFreeze({
      ...item,
      stateCode: code,
      reviewStatus: item.reviewStatus ?? 'unverified',
      lastReviewed: item.lastReviewed ?? null,
      sources: item.sources ?? [],
      disclaimer: LEGAL_DISCLAIMER,
    });
    map.set(code, frozenRecord);
    summaryMap.set(code, buildJurisdictionSummary(frozenRecord));
    frozenList.push(frozenRecord);
  }

  cachedRegistryList = deepFreeze(frozenList);
  cachedRegistryMap = map;
  cachedSummaryMap = summaryMap;

  return cachedRegistryList;
}

// Eagerly initialize cache on module load for instant O(1) lookups.
loadLegalRegistry();

/**
 * Normalizes and validates a 2-letter jurisdiction code.
 *
 * @param {unknown} rawCode
 * @returns {string|null} 2-letter uppercase code, or null if invalid.
 * @throws {TypeError} if rawCode is non-null/non-undefined and not a string.
 */
export function normalizeStateCode(rawCode) {
  if (rawCode === null || rawCode === undefined) {
    return null;
  }
  if (typeof rawCode !== 'string') {
    throw new TypeError(`stateCode must be a string, received ${typeof rawCode}`);
  }
  const trimmed = rawCode.trim().toUpperCase();
  return /^[A-Z]{2}$/.test(trimmed) ? trimmed : null;
}

/**
 * Check if a code represents a valid supported US jurisdiction in the registry.
 *
 * @param {unknown} rawCode
 * @returns {boolean}
 */
export function isSupportedJurisdiction(rawCode) {
  try {
    const code = normalizeStateCode(rawCode);
    return code !== null && cachedRegistryMap.has(code);
  } catch {
    return false;
  }
}

/**
 * Returns legal protections for a jurisdiction. Fast, zero-allocation memoized lookup.
 *
 * @param {string} stateCode 2-letter US jurisdiction code (case-insensitive).
 * @param {Object} [options]
 * @param {boolean} [options.strict=false] Throw an Error if code is unknown instead of returning null.
 * @returns {Readonly<JurisdictionLegalRecord>|null}
 */
export function getLegalProtections(stateCode, options = {}) {
  const code = normalizeStateCode(stateCode);
  if (!code) {
    if (options?.strict) {
      throw new Error(`Invalid or missing jurisdiction stateCode: ${JSON.stringify(stateCode)}`);
    }
    return null;
  }

  const record = cachedRegistryMap.get(code) ?? null;
  if (!record && options?.strict) {
    throw new Error(`Jurisdiction code '${code}' not found in 52-jurisdiction registry.`);
  }
  return record;
}

/**
 * Filter states by statutory protections and harm reduction equipment legality.
 * Supports both shorthand criteria and exact schema properties.
 *
 * @param {Object} [filters]
 * @param {boolean} [filters.ftsLegal] Fentanyl test strips legal / decriminalized.
 * @param {boolean} [filters.fentanylTestStripsLegal] Alias for ftsLegal.
 * @param {boolean} [filters.sspLegal] Syringe services programs explicitly authorized.
 * @param {boolean} [filters.sspStatutoryProtection] Alias for sspLegal.
 * @param {boolean} [filters.paroleProtected] Protects against parole/probation violations.
 * @param {boolean} [filters.protectsParoleProbation] Alias for paroleProtected.
 * @param {boolean} [filters.xylazineLegal] Xylazine test strips legal / exempted.
 * @param {boolean} [filters.xylazineTestStripsLegal] Alias for xylazineLegal.
 * @param {boolean} [filters.goodSamaritan] Has Good Samaritan overdose protection.
 * @param {boolean} [filters.hasProtection] Alias for goodSamaritan.
 * @param {boolean} [filters.arrestImmunity] Good Samaritan law explicitly protects against arrest.
 * @param {boolean} [filters.chargeImmunity] Good Samaritan law protects against criminal charges.
 * @param {boolean} [filters.prosecutionImmunity] Good Samaritan law protects against prosecution.
 * @param {boolean} [filters.paraphernaliaProtected] Protects against paraphernalia charges.
 * @param {boolean} [filters.protectsParaphernalia] Alias for paraphernaliaProtected.
 * @param {boolean} [filters.underageAlcoholProtected] Amnesty covers underage alcohol possession.
 * @param {boolean} [filters.protectsUnderageAlcohol] Alias for underageAlcoholProtected.
 * @param {boolean} [filters.standingOrder] Statewide naloxone standing order in place.
 * @param {boolean} [filters.layResponderImmunity] Naloxone lay responder immunity in place.
 * @returns {ReadonlyArray<JurisdictionLegalRecord>}
 */
export function filterStatesByProtection(filters = {}) {
  if (!filters || typeof filters !== 'object') {
    return cachedRegistryList;
  }

  // Resolve filters supporting both shorthand and schema keys
  const ftsExpected = filters.ftsLegal ?? filters.fentanylTestStripsLegal;
  const sspExpected = filters.sspLegal ?? filters.sspStatutoryProtection;
  const paroleExpected = filters.paroleProtected ?? filters.protectsParoleProbation;
  const xylExpected = filters.xylazineLegal ?? filters.xylazineTestStripsLegal;
  const gsExpected = filters.goodSamaritan ?? filters.hasProtection;
  const arrestExpected = filters.arrestImmunity;
  const chargeExpected = filters.chargeImmunity;
  const prosExpected = filters.prosecutionImmunity;
  const paraExpected = filters.paraphernaliaProtected ?? filters.protectsParaphernalia;
  const alcoholExpected = filters.underageAlcoholProtected ?? filters.protectsUnderageAlcohol;
  const soExpected = filters.standingOrder;
  const layExpected = filters.layResponderImmunity;

  return cachedRegistryList.filter((record) => {
    const gs = record.goodSamaritan;
    const nx = record.naloxoneAccess;
    const hr = record.harmReductionEquipment;

    if (ftsExpected !== undefined && hr.fentanylTestStripsLegal !== ftsExpected) return false;
    if (sspExpected !== undefined && hr.sspStatutoryProtection !== sspExpected) return false;
    if (paroleExpected !== undefined && gs.protectsParoleProbation !== paroleExpected) return false;
    if (xylExpected !== undefined && hr.xylazineTestStripsLegal !== xylExpected) return false;
    if (gsExpected !== undefined && gs.hasProtection !== gsExpected) return false;
    if (arrestExpected !== undefined && gs.arrestImmunity !== arrestExpected) return false;
    if (chargeExpected !== undefined && gs.chargeImmunity !== chargeExpected) return false;
    if (prosExpected !== undefined && gs.prosecutionImmunity !== prosExpected) return false;
    if (paraExpected !== undefined && gs.protectsParaphernalia !== paraExpected) return false;
    if (alcoholExpected !== undefined && gs.protectsUnderageAlcohol !== alcoholExpected) return false;
    if (soExpected !== undefined && nx.standingOrder !== soExpected) return false;
    if (layExpected !== undefined && nx.layResponderImmunity !== layExpected) return false;

    return true;
  });
}

/**
 * Returns a pre-computed plain-language legal summary for a jurisdiction.
 * Zero-allocation memoized lookup.
 *
 * @param {string} stateCode 2-letter US jurisdiction code (case-insensitive).
 * @param {Object} [options]
 * @param {boolean} [options.strict=false] Throw an Error if jurisdiction is invalid/unknown.
 * @returns {Object|null}
 */
export function getJurisdictionSummary(stateCode, options = {}) {
  const code = normalizeStateCode(stateCode);
  if (!code) {
    if (options?.strict) {
      throw new Error(`Invalid jurisdiction code: ${JSON.stringify(stateCode)}`);
    }
    return null;
  }

  const summary = cachedSummaryMap.get(code) ?? null;
  if (!summary && options?.strict) {
    throw new Error(`Jurisdiction code '${code}' not found in registry.`);
  }
  return summary;
}

/**
 * Returns all 52 supported jurisdiction 2-letter codes.
 *
 * @returns {string[]}
 */
export function getAllJurisdictionCodes() {
  return Array.from(cachedRegistryMap.keys());
}

/**
 * Returns all 52 jurisdiction legal records.
 *
 * @returns {ReadonlyArray<JurisdictionLegalRecord>}
 */
export function getAllJurisdictions() {
  return cachedRegistryList;
}

/**
 * Pure helper: Check if a jurisdiction has Good Samaritan protection.
 *
 * @param {string} stateCode
 * @returns {boolean}
 */
export function hasGoodSamaritanProtection(stateCode) {
  const rec = getLegalProtections(stateCode);
  return Boolean(rec?.goodSamaritan?.hasProtection);
}

/**
 * Pure helper: Check if a jurisdiction provides arrest immunity under Good Samaritan law.
 *
 * @param {string} stateCode
 * @returns {boolean}
 */
export function hasArrestImmunity(stateCode) {
  const rec = getLegalProtections(stateCode);
  return Boolean(rec?.goodSamaritan?.arrestImmunity);
}

/**
 * Pure helper: Check if Good Samaritan law protects individuals on parole or probation.
 *
 * @param {string} stateCode
 * @returns {boolean}
 */
export function hasParoleProbationProtection(stateCode) {
  const rec = getLegalProtections(stateCode);
  return Boolean(rec?.goodSamaritan?.protectsParoleProbation);
}

/**
 * Pure helper: Check if fentanyl test strips are legal / decriminalized.
 *
 * @param {string} stateCode
 * @returns {boolean}
 */
export function hasFentanylTestStripProtection(stateCode) {
  const rec = getLegalProtections(stateCode);
  return Boolean(rec?.harmReductionEquipment?.fentanylTestStripsLegal);
}

/**
 * Pure helper: Check if xylazine test strips are legal / exempted.
 *
 * @param {string} stateCode
 * @returns {boolean}
 */
export function hasXylazineTestStripProtection(stateCode) {
  const rec = getLegalProtections(stateCode);
  return Boolean(rec?.harmReductionEquipment?.xylazineTestStripsLegal);
}

/**
 * Pure helper: Check if syringe services programs are explicitly protected by state statute.
 *
 * @param {string} stateCode
 * @returns {boolean}
 */
export function hasSyringeProgramProtection(stateCode) {
  const rec = getLegalProtections(stateCode);
  return Boolean(rec?.harmReductionEquipment?.sspStatutoryProtection);
}

/**
 * Pure helper: Compares protections between two jurisdictions side by side.
 *
 * @param {string} codeA
 * @param {string} codeB
 * @returns {{ stateA: JurisdictionLegalRecord|null, stateB: JurisdictionLegalRecord|null, differences: string[] }}
 */
export function compareJurisdictions(codeA, codeB) {
  const stateA = getLegalProtections(codeA);
  const stateB = getLegalProtections(codeB);

  const differences = [];
  if (!stateA || !stateB) {
    return { stateA, stateB, differences: ['One or both jurisdiction codes are invalid.'] };
  }

  if (stateA.goodSamaritan.arrestImmunity !== stateB.goodSamaritan.arrestImmunity) {
    differences.push(
      `Arrest immunity: ${stateA.stateCode}=${stateA.goodSamaritan.arrestImmunity}, ${stateB.stateCode}=${stateB.goodSamaritan.arrestImmunity}`
    );
  }
  if (stateA.goodSamaritan.protectsParoleProbation !== stateB.goodSamaritan.protectsParoleProbation) {
    differences.push(
      `Parole/probation protection: ${stateA.stateCode}=${stateA.goodSamaritan.protectsParoleProbation}, ${stateB.stateCode}=${stateB.goodSamaritan.protectsParoleProbation}`
    );
  }
  if (stateA.goodSamaritan.protectsParaphernalia !== stateB.goodSamaritan.protectsParaphernalia) {
    differences.push(
      `Paraphernalia protection: ${stateA.stateCode}=${stateA.goodSamaritan.protectsParaphernalia}, ${stateB.stateCode}=${stateB.goodSamaritan.protectsParaphernalia}`
    );
  }
  if (stateA.harmReductionEquipment.fentanylTestStripsLegal !== stateB.harmReductionEquipment.fentanylTestStripsLegal) {
    differences.push(
      `Fentanyl test strips: ${stateA.stateCode}=${stateA.harmReductionEquipment.fentanylTestStripsLegal}, ${stateB.stateCode}=${stateB.harmReductionEquipment.fentanylTestStripsLegal}`
    );
  }
  if (stateA.harmReductionEquipment.xylazineTestStripsLegal !== stateB.harmReductionEquipment.xylazineTestStripsLegal) {
    differences.push(
      `Xylazine test strips: ${stateA.stateCode}=${stateA.harmReductionEquipment.xylazineTestStripsLegal}, ${stateB.stateCode}=${stateB.harmReductionEquipment.xylazineTestStripsLegal}`
    );
  }
  if (stateA.harmReductionEquipment.sspStatutoryProtection !== stateB.harmReductionEquipment.sspStatutoryProtection) {
    differences.push(
      `Syringe services statutory protection: ${stateA.stateCode}=${stateA.harmReductionEquipment.sspStatutoryProtection}, ${stateB.stateCode}=${stateB.harmReductionEquipment.sspStatutoryProtection}`
    );
  }

  return { stateA, stateB, differences };
}
