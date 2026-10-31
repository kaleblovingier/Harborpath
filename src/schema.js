// Zero-dependency declarative schema validation toolkit, insurance compatibility
// matching engine, multi-criteria facility scorer, and LRU query memoizer.
import { DATA_LOADERS } from './data.js';
import { STATES, coarsen, isValidLatLng } from './geo.js';
import { createTaxonomy } from './taxonomy.js';

export const RADII_MILES = [5, 10, 25, 50, 100, 200, 250];
export const KINDS = ['sa', 'mh'];
export const PROVIDER_TYPES = ['va', 'ihs', 'rhc', 'er'];
export const MAX_CODES = 8;
export const MAX_PAGE = 40;

export const PAYMENT_CODES = ['MD', 'MC', 'PI', 'MI', 'ITU', 'SF', 'PA', 'NP', 'SAMF'];
export const ACCREDITATION_CODES = ['JC', 'CARF', 'NCQA', 'COA', 'HFAP', 'SOTP', 'FQHC', 'FED'];
export const LEVEL_OF_CARE_CODES = [
  'SA', 'DT', 'HH', 'MH', 'HI', 'OP', 'PHP', 'RES', 'HID', 'HIT',
  'OD', 'ODT', 'IOP', 'OMB', 'ORT', 'RD', 'RL', 'RS', 'OTP', 'TELE',
];

const PAYMENT_CODE_SET = new Set(PAYMENT_CODES);
const ACCREDITATION_CODE_SET = new Set(ACCREDITATION_CODES);
const LEVEL_OF_CARE_SET = new Set(LEVEL_OF_CARE_CODES);

const PROVIDER_FILTERS = {
  va: ['health', 'vetcenter'],
  ihs: ['bh', 'sud'],
  rhc: [],
  er: [],
};

let defaultTaxonomy = null;
function getDefaultTaxonomy() {
  return (defaultTaxonomy ??= createTaxonomy(DATA_LOADERS.serviceCodes()));
}

export class InputError extends Error {
  constructor(message, issues = []) {
    super(message);
    this.name = 'InputError';
    this.issues = issues;
  }
}

function pathLabel(path) {
  return path && path.length ? path.join('.') : 'value';
}

function strictFiniteNumber(val) {
  if (typeof val === 'number') return Number.isFinite(val) ? val : null;
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed) return null;
    const n = Number(trimmed);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

class BaseSchema {
  constructor(runner, { isOptional = false, hasDefault = false, defaultValue = undefined } = {}) {
    this._runner = runner;
    this._isOptional = isOptional;
    this._hasDefault = hasDefault;
    this._defaultValue = defaultValue;
  }

  _parse(value, path = []) {
    let current = value;
    if (current === undefined && this._hasDefault) {
      current = typeof this._defaultValue === 'function' ? this._defaultValue() : this._defaultValue;
    }
    if (current === undefined && this._isOptional) {
      return undefined;
    }
    return this._runner(current, path);
  }

  parse(input) {
    return this._parse(input, []);
  }

  safeParse(input) {
    try {
      const data = this.parse(input);
      return { success: true, data };
    } catch (err) {
      const error = err instanceof InputError ? err : new InputError(err?.message ?? 'Validation failed');
      return { success: false, error };
    }
  }

  optional() {
    return new BaseSchema((val, path) => this._parse(val, path), {
      isOptional: true,
      hasDefault: this._hasDefault,
      defaultValue: this._defaultValue,
    });
  }

  nullable() {
    return new BaseSchema((val, path) => (val === null ? null : this._parse(val, path)), {
      isOptional: this._isOptional,
      hasDefault: this._hasDefault,
      defaultValue: this._defaultValue,
    });
  }

  default(defaultValue) {
    return new BaseSchema((val, path) => this._parse(val, path), {
      isOptional: this._isOptional,
      hasDefault: true,
      defaultValue,
    });
  }

  refine(predicate, message = 'Invalid value') {
    return new BaseSchema((val, path) => {
      const parsed = this._parse(val, path);
      if (parsed === undefined && this._isOptional) return undefined;
      if (!predicate(parsed)) {
        const msg = typeof message === 'function'
          ? message(parsed)
          : typeof message === 'object' && message !== null && message.message
            ? message.message
            : String(message);
        throw new InputError(msg, [{ path, message: msg }]);
      }
      return parsed;
    }, {
      isOptional: this._isOptional,
      hasDefault: this._hasDefault,
      defaultValue: this._defaultValue,
    });
  }

  transform(fn) {
    return new BaseSchema((val, path) => {
      const parsed = this._parse(val, path);
      if (parsed === undefined && this._isOptional) return undefined;
      return fn(parsed);
    }, {
      isOptional: this._isOptional,
      hasDefault: this._hasDefault,
      defaultValue: this._defaultValue,
    });
  }
}

class StringSchema extends BaseSchema {
  constructor(runner, opts) {
    super(runner, opts);
  }

  _chain(step) {
    return new StringSchema((val, path) => step(this._parse(val, path), path), {
      isOptional: this._isOptional,
      hasDefault: this._hasDefault,
      defaultValue: this._defaultValue,
    });
  }

  trim() {
    return this._chain((val) => (typeof val === 'string' ? val.trim() : val));
  }

  toLowerCase() {
    return this._chain((val) => (typeof val === 'string' ? val.toLowerCase() : val));
  }

  toUpperCase() {
    return this._chain((val) => (typeof val === 'string' ? val.toUpperCase() : val));
  }

  min(len, message) {
    return this._chain((val, path) => {
      if (typeof val === 'string' && val.length < len) {
        const msg = message ?? `${pathLabel(path)} must be at least ${len} characters`;
        throw new InputError(msg, [{ path, message: msg }]);
      }
      return val;
    });
  }

  max(len, message) {
    return this._chain((val, path) => {
      if (typeof val === 'string' && val.length > len) {
        const msg = message ?? `${pathLabel(path)} must be at most ${len} characters`;
        throw new InputError(msg, [{ path, message: msg }]);
      }
      return val;
    });
  }

  length(len, message) {
    return this._chain((val, path) => {
      if (typeof val === 'string' && val.length !== len) {
        const msg = message ?? `${pathLabel(path)} must be exactly ${len} characters`;
        throw new InputError(msg, [{ path, message: msg }]);
      }
      return val;
    });
  }

  nonempty(message) {
    return this.min(1, message ?? 'String cannot be empty');
  }

  regex(pattern, message) {
    return this._chain((val, path) => {
      if (typeof val === 'string' && !pattern.test(val)) {
        const msg = message ?? `${pathLabel(path)} has an invalid format`;
        throw new InputError(msg, [{ path, message: msg }]);
      }
      return val;
    });
  }
}

class NumberSchema extends BaseSchema {
  constructor(runner, opts) {
    super(runner, opts);
  }

  _chain(step) {
    return new NumberSchema((val, path) => step(this._parse(val, path), path), {
      isOptional: this._isOptional,
      hasDefault: this._hasDefault,
      defaultValue: this._defaultValue,
    });
  }

  int(message) {
    return this._chain((val, path) => {
      if (typeof val === 'number' && !Number.isInteger(val)) {
        const msg = message ?? `${pathLabel(path)} must be an integer`;
        throw new InputError(msg, [{ path, message: msg }]);
      }
      return val;
    });
  }

  min(n, message) {
    return this._chain((val, path) => {
      if (typeof val === 'number' && val < n) {
        const msg = message ?? `${pathLabel(path)} must be at least ${n}`;
        throw new InputError(msg, [{ path, message: msg }]);
      }
      return val;
    });
  }

  max(n, message) {
    return this._chain((val, path) => {
      if (typeof val === 'number' && val > n) {
        const msg = message ?? `${pathLabel(path)} must be at most ${n}`;
        throw new InputError(msg, [{ path, message: msg }]);
      }
      return val;
    });
  }

  positive(message) {
    return this._chain((val, path) => {
      if (typeof val === 'number' && val <= 0) {
        const msg = message ?? `${pathLabel(path)} must be positive`;
        throw new InputError(msg, [{ path, message: msg }]);
      }
      return val;
    });
  }

  nonnegative(message) {
    return this.min(0, message ?? 'Number must be non-negative');
  }

  finite(message) {
    return this._chain((val, path) => {
      if (typeof val === 'number' && !Number.isFinite(val)) {
        const msg = message ?? `${pathLabel(path)} must be finite`;
        throw new InputError(msg, [{ path, message: msg }]);
      }
      return val;
    });
  }
}

class ArraySchema extends BaseSchema {
  constructor(runner, opts) {
    super(runner, opts);
  }

  _chain(step) {
    return new ArraySchema((val, path) => step(this._parse(val, path), path), {
      isOptional: this._isOptional,
      hasDefault: this._hasDefault,
      defaultValue: this._defaultValue,
    });
  }

  min(len, message) {
    return this._chain((val, path) => {
      if (Array.isArray(val) && val.length < len) {
        const msg = message ?? `${pathLabel(path)} must contain at least ${len} items`;
        throw new InputError(msg, [{ path, message: msg }]);
      }
      return val;
    });
  }

  max(len, message) {
    return this._chain((val, path) => {
      if (Array.isArray(val) && val.length > len) {
        const msg = message ?? `${pathLabel(path)} must contain at most ${len} items`;
        throw new InputError(msg, [{ path, message: msg }]);
      }
      return val;
    });
  }

  nonempty(message) {
    return this.min(1, message ?? 'Array cannot be empty');
  }
}

class ObjectSchema extends BaseSchema {
  constructor(shape, { isOptional = false, hasDefault = false, defaultValue = undefined, mode = 'strip', message } = {}) {
    const runner = (val, path) => {
      const raw = val instanceof URLSearchParams ? Object.fromEntries(val.entries()) : val;
      if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
        const msg = message ?? `${pathLabel(path)} must be an object`;
        throw new InputError(msg, [{ path, message: msg }]);
      }
      if (mode === 'strict') {
        for (const key of Object.keys(raw)) {
          if (!Object.hasOwn(shape, key)) {
            const msg = `Unrecognized key: ${key}`;
            throw new InputError(msg, [{ path: [...path, key], message: msg }]);
          }
        }
      }
      const out = {};
      for (const [key, fieldSchema] of Object.entries(shape)) {
        const parsed = fieldSchema._parse(raw[key], [...path, key]);
        if (parsed !== undefined) {
          out[key] = parsed;
        }
      }
      if (mode === 'passthrough') {
        for (const [key, v] of Object.entries(raw)) {
          if (!Object.hasOwn(shape, key)) out[key] = v;
        }
      }
      return out;
    };
    super(runner, { isOptional, hasDefault, defaultValue });
    this.shape = shape;
    this._mode = mode;
    this._message = message;
  }

  strict() {
    return new ObjectSchema(this.shape, {
      isOptional: this._isOptional,
      hasDefault: this._hasDefault,
      defaultValue: this._defaultValue,
      mode: 'strict',
      message: this._message,
    });
  }

  passthrough() {
    return new ObjectSchema(this.shape, {
      isOptional: this._isOptional,
      hasDefault: this._hasDefault,
      defaultValue: this._defaultValue,
      mode: 'passthrough',
      message: this._message,
    });
  }

  partial() {
    const partialShape = {};
    for (const [k, s] of Object.entries(this.shape)) {
      partialShape[k] = s.optional();
    }
    return new ObjectSchema(partialShape, {
      isOptional: this._isOptional,
      hasDefault: this._hasDefault,
      defaultValue: this._defaultValue,
      mode: this._mode,
      message: this._message,
    });
  }
}

export const z = {
  string({ message, coerce = false } = {}) {
    return new StringSchema((val, path) => {
      const v = coerce && val !== null && val !== undefined ? String(val) : val;
      if (typeof v !== 'string') {
        const msg = message ?? `${pathLabel(path)} must be a string`;
        throw new InputError(msg, [{ path, message: msg }]);
      }
      return v;
    });
  },

  number({ message, coerce = false } = {}) {
    return new NumberSchema((val, path) => {
      const n = coerce ? strictFiniteNumber(val) : (typeof val === 'number' && Number.isFinite(val) ? val : null);
      if (n === null) {
        const msg = message ?? `${pathLabel(path)} must be a finite number`;
        throw new InputError(msg, [{ path, message: msg }]);
      }
      return n;
    });
  },

  boolean({ message, coerce = false } = {}) {
    return new BaseSchema((val, path) => {
      let b = val;
      if (coerce && typeof val === 'string') {
        const lower = val.trim().toLowerCase();
        if (lower === 'true' || lower === '1') b = true;
        else if (lower === 'false' || lower === '0') b = false;
      }
      if (typeof b !== 'boolean') {
        const msg = message ?? `${pathLabel(path)} must be a boolean`;
        throw new InputError(msg, [{ path, message: msg }]);
      }
      return b;
    });
  },

  enum(values, { message } = {}) {
    if (!Array.isArray(values) || values.length === 0) {
      throw new Error('z.enum requires a non-empty array of values');
    }
    const allowed = new Set(values);
    const schema = new BaseSchema((val, path) => {
      if (!allowed.has(val)) {
        const msg = message ?? `${pathLabel(path)} must be one of ${values.join(', ')}`;
        throw new InputError(msg, [{ path, message: msg }]);
      }
      return val;
    });
    schema.options = [...values];
    schema.enum = Object.fromEntries(values.map((v) => [v, v]));
    return schema;
  },

  array(itemSchema, { message } = {}) {
    return new ArraySchema((val, path) => {
      if (!Array.isArray(val)) {
        const msg = message ?? `${pathLabel(path)} must be an array`;
        throw new InputError(msg, [{ path, message: msg }]);
      }
      return val.map((item, idx) => itemSchema._parse(item, [...path, idx]));
    });
  },

  object(shape, opts = {}) {
    return new ObjectSchema(shape, opts);
  },

  coerce: {
    string: (opts) => z.string({ ...opts, coerce: true }),
    number: (opts) => z.number({ ...opts, coerce: true }),
    boolean: (opts) => z.boolean({ ...opts, coerce: true }),
  },
};

function toPlainInput(input) {
  if (input instanceof URLSearchParams) return Object.fromEntries(input.entries());
  if (input !== null && typeof input === 'object' && !Array.isArray(input)) return input;
  return null;
}

/**
 * Validates lat (-90..90) and lng (-180..180) and coarsens coordinates to 0.01 deg
 * (~1 km) so precise user locations never leave the validation boundary.
 */
export const LocationSchema = new BaseSchema((input, path) => {
  const obj = toPlainInput(input);
  if (!obj) throw new InputError('A valid location is required.', [{ path, message: 'A valid location is required.' }]);
  const lat = strictFiniteNumber(obj.lat);
  const lng = strictFiniteNumber(obj.lng);
  if (lat === null || lng === null || !isValidLatLng(lat, lng)) {
    throw new InputError('A valid location is required.', [{ path, message: 'A valid location is required.' }]);
  }
  return { lat: coarsen(lat), lng: coarsen(lng) };
});

/**
 * Validates 2-letter uppercase U.S. state, DC, or territory codes.
 */
export const StateCodeSchema = z
  .string({ message: 'state must be a 2-letter uppercase state or territory code' })
  .regex(/^[A-Z]{2}$/, 'state must be a 2-letter uppercase state or territory code')
  .refine((code) => Object.hasOwn(STATES, code), 'Unknown state or territory code');

function parseCodeList(raw) {
  if (raw === undefined || raw === null || raw === '') return [];
  if (Array.isArray(raw)) {
    return [...new Set(raw.map((c) => String(c ?? '').trim()).filter(Boolean))];
  }
  if (typeof raw === 'string') {
    return [...new Set(raw.split(',').map((c) => c.trim()).filter(Boolean))];
  }
  throw new InputError('codes must be an array or comma-separated string');
}

/**
 * Validates treatment search queries including location coarsening, radiusMiles,
 * kind, page, SAMHSA service codes (max 8), and optional payer / accreditation /
 * levelOfCare filters.
 */
export function createTreatmentSearchSchema(taxonomy) {
  return new BaseSchema((input) => {
    const obj = toPlainInput(input);
    if (!obj) throw new InputError('A valid location is required.');

    const loc = LocationSchema.parse(obj);

    const rawRadius = obj.radiusMiles !== undefined ? obj.radiusMiles : (obj.radius ?? 25);
    const radiusMiles = strictFiniteNumber(rawRadius);
    if (radiusMiles === null || !RADII_MILES.includes(radiusMiles)) {
      throw new InputError(`radius must be one of ${RADII_MILES.join(', ')}`);
    }

    const rawKind = obj.kind ?? 'sa';
    const kind = typeof rawKind === 'string' ? rawKind.trim().toLowerCase() : '';
    if (!KINDS.includes(kind)) {
      throw new InputError('kind must be "sa" or "mh"');
    }

    const rawPage = obj.page ?? 1;
    const page = strictFiniteNumber(rawPage);
    if (page === null || !Number.isInteger(page) || page < 1 || page > MAX_PAGE) {
      throw new InputError('page is out of range');
    }

    const activeTaxonomy = taxonomy ?? getDefaultTaxonomy();
    const codes = parseCodeList(obj.codes);
    if (codes.length > MAX_CODES) {
      throw new InputError(`At most ${MAX_CODES} filters at once`);
    }
    for (const c of codes) {
      if (!activeTaxonomy.hasService(c) && !PAYMENT_CODE_SET.has(c) && !ACCREDITATION_CODE_SET.has(c)) {
        throw new InputError(`Unknown service code: ${c}`);
      }
      if (taxonomy && !taxonomy.hasService(c)) {
        throw new InputError(`Unknown service code: ${c}`);
      }
    }

    const out = {
      ...loc,
      radiusMiles,
      kind,
      page,
      codes: codes.sort(),
    };

    if (obj.payer !== undefined && obj.payer !== null && String(obj.payer).trim() !== '') {
      if (typeof obj.payer !== 'string') throw new InputError('payer must be a string');
      const payerText = obj.payer.trim();
      out.payer = payerText;
      out.payerCodes = resolvePayerCodes(payerText);
    }

    if (obj.accreditation !== undefined && obj.accreditation !== null && String(obj.accreditation).trim() !== '') {
      const accList = parseCodeList(obj.accreditation).map((c) => c.toUpperCase());
      for (const acc of accList) {
        if (!ACCREDITATION_CODE_SET.has(acc)) {
          throw new InputError(`Unknown accreditation code: ${acc}`);
        }
      }
      out.accreditation = accList.sort();
    }

    if (obj.levelOfCare !== undefined && obj.levelOfCare !== null && String(obj.levelOfCare).trim() !== '') {
      const locList = parseCodeList(obj.levelOfCare).map((c) => c.toUpperCase());
      for (const l of locList) {
        if (!LEVEL_OF_CARE_SET.has(l) && !activeTaxonomy.hasService(l)) {
          throw new InputError(`Unknown level of care code: ${l}`);
        }
      }
      out.levelOfCare = locList.sort();
    }

    return out;
  });
}

export const TreatmentSearchSchema = createTreatmentSearchSchema();

/**
 * Validates provider search queries: type (['va', 'ihs', 'rhc', 'er']),
 * radiusMiles, and type-specific filter.
 */
export const ProviderSearchSchema = new BaseSchema((input) => {
  const obj = toPlainInput(input);
  if (!obj) throw new InputError(`type must be one of ${PROVIDER_TYPES.join(', ')}`);

  const type = typeof obj.type === 'string' ? obj.type.trim() : '';
  if (!Object.hasOwn(PROVIDER_FILTERS, type)) {
    throw new InputError(`type must be one of ${PROVIDER_TYPES.join(', ')}`);
  }

  const rawRadius = obj.radiusMiles !== undefined ? obj.radiusMiles : (obj.radius ?? 25);
  const radiusMiles = strictFiniteNumber(rawRadius);
  if (radiusMiles === null || !RADII_MILES.includes(radiusMiles)) {
    throw new InputError(`radius must be one of ${RADII_MILES.join(', ')}`);
  }

  const rawFilter = obj.filter ?? null;
  const filter = typeof rawFilter === 'string' && rawFilter.trim() !== '' ? rawFilter.trim() : null;
  if (filter !== null) {
    const allowed = PROVIDER_FILTERS[type];
    if (!allowed.includes(filter)) {
      throw new InputError(
        allowed.length ? `filter must be one of ${allowed.join(', ')}` : `filter is not supported for ${type}`,
      );
    }
  }

  const out = { type, radiusMiles, filter };
  if (obj.lat !== undefined || obj.lng !== undefined) {
    const loc = LocationSchema.parse(obj);
    out.lat = loc.lat;
    out.lng = loc.lng;
  }
  return out;
});

// ---------------------------------------------------------------------------
// Insurance & In-Network Compatibility Engine
// ---------------------------------------------------------------------------

const PAYER_CATEGORIES = [
  {
    category: 'uninsured',
    primary: ['SF', 'PA', 'NP', 'SAMF'],
    fallback: ['SF', 'PA'],
    phrases: [
      'uninsured', 'no insurance', 'self-pay', 'self pay', 'sliding scale',
      'sliding', 'charity', 'grant', 'payment assistance',
    ],
    words: ['cash', 'free', 'sf', 'ss', 'pa', 'np', 'samf', 'samhsa'],
  },
  {
    category: 'military',
    primary: ['MI'],
    fallback: ['SF', 'PA'],
    phrases: ['tricare', 'champva', 'military', 'veteran'],
    words: ['va', 'mi'],
  },
  {
    category: 'tribal',
    primary: ['ITU'],
    fallback: ['SF', 'PA'],
    phrases: ['indian health', 'tribal', 'urban indian'],
    words: ['ihs', 'itu'],
  },
  {
    category: 'medicare',
    primary: ['MC'],
    fallback: ['MD', 'SF', 'PA'],
    phrases: ['medicare advantage', 'dual eligible', 'medicare', 'part a', 'part b', 'part d'],
    words: ['mc'],
  },
  {
    category: 'medicaid',
    primary: ['MD'],
    fallback: ['SF', 'PA'],
    phrases: [
      'medicaid', 'apple health', 'medi-cal', 'masshealth', 'tenncare',
      'ahcccs', 'husky', 'badgercare', 'soonercare', 'peachcare',
    ],
    words: ['star', 'chip', 'mco', 'md'],
  },
  {
    category: 'private',
    primary: ['PI'],
    fallback: ['SF', 'PA'],
    phrases: [
      'private', 'commercial', 'blue cross', 'blue shield', 'bcbs', 'anthem',
      'aetna', 'cigna', 'united', 'optum', 'humana', 'kaiser', 'molina',
      'centene', 'ambetter', 'regence', 'premera', 'employer',
    ],
    words: ['uhc', 'ppo', 'hmo', 'epo', 'pi'],
  },
];

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Maps free-text or partial insurance policy names to SAMHSA payment codes
 * (MD, MC, PI, MI, ITU, SF, PA, NP, SAMF) with primary and safety-net fallback codes.
 */
export function resolvePayerCodes(payerInput) {
  const raw = typeof payerInput === 'string' ? payerInput.trim() : '';
  if (!raw) {
    return {
      category: 'unspecified',
      primary: [],
      fallback: [],
      codes: [],
      recognized: false,
    };
  }

  const normalized = raw.toLowerCase().replace(/\s+/g, ' ');
  const wordTokens = normalized.replace(/[^a-z0-9]+/g, ' ').trim();

  for (const rule of PAYER_CATEGORIES) {
    const matchedPhrase = rule.phrases.some((p) => normalized.includes(p));
    const matchedWord = !matchedPhrase && rule.words.some((w) => {
      const re = new RegExp(`\\b${escapeRegex(w)}\\b`, 'i');
      return re.test(wordTokens);
    });
    if (matchedPhrase || matchedWord) {
      const primary = [...rule.primary];
      const fallback = [...rule.fallback];
      return {
        category: rule.category,
        primary,
        fallback,
        codes: [...new Set([...primary, ...fallback])],
        recognized: true,
      };
    }
  }

  // Unrecognized carrier name: check Private Insurance (PI) as primary and
  // Sliding Fee (SF) / Payment Assistance (PA) as safety-net fallback.
  return {
    category: 'unknown',
    primary: ['PI'],
    fallback: ['SF', 'PA'],
    codes: ['PI', 'SF', 'PA'],
    recognized: false,
  };
}

/**
 * Extracts canonical SAMHSA payment codes from a facility's codes, paymentCodes,
 * and services array. Handles both canonical codes (SF, MI, SAMF) and
 * FindTreatment.gov taxonomy equivalents (SS, TRICARE, SAMHSA) while avoiding
 * false positives with Motivational Interviewing ('MI' under category 'TAP').
 */
function extractFacilityPaymentCodes(facility) {
  if (!facility || typeof facility !== 'object') return new Set();
  const rawCodes = new Set([
    ...(Array.isArray(facility.codes) ? facility.codes : []),
    ...(Array.isArray(facility.paymentCodes) ? facility.paymentCodes : []),
  ]);
  const services = Array.isArray(facility.services) ? facility.services : [];

  // Determine if 'MI' in facility.codes is purely from Treatment Approaches (Motivational interviewing)
  let hasTapMi = false;
  let hasPayMilitary = false;
  for (const svc of services) {
    const cat = String(svc?.category ?? svc?.f2 ?? '').toUpperCase();
    const itemsText = Array.isArray(svc?.items)
      ? svc.items.join('; ').toLowerCase()
      : String(svc?.f3 ?? '').toLowerCase();
    if (cat === 'TAP' && itemsText.includes('motivational interviewing')) {
      hasTapMi = true;
    }
    if (cat === 'PAY' && (itemsText.includes('military') || itemsText.includes('tricare'))) {
      hasPayMilitary = true;
    }
  }

  const out = new Set();
  for (const code of rawCodes) {
    if (code === 'MI' && hasTapMi && !hasPayMilitary && !(Array.isArray(facility.paymentCodes) && facility.paymentCodes.includes('MI') && services.length === 0)) {
      continue;
    }
    if (PAYMENT_CODE_SET.has(code)) out.add(code);
    if (code === 'SS') out.add('SF');
    if (code === 'TRICARE' || code === 'VAF') out.add('MI');
    if (code === 'SAMHSA' || code === 'FSA') out.add('SAMF');
  }

  for (const svc of services) {
    const cat = String(svc?.category ?? svc?.f2 ?? '').toUpperCase();
    if (cat && cat !== 'PAY' && cat !== 'PYAS') continue;
    const itemsText = Array.isArray(svc?.items)
      ? svc.items.join('; ').toLowerCase()
      : String(svc?.f3 ?? '').toLowerCase();
    if (!itemsText) continue;
    if (itemsText.includes('medicaid')) out.add('MD');
    if (itemsText.includes('medicare')) out.add('MC');
    if (itemsText.includes('private health insurance') || itemsText.includes('private insurance')) out.add('PI');
    if (itemsText.includes('military') || itemsText.includes('tricare')) out.add('MI');
    if (itemsText.includes('ihs') || itemsText.includes('tribal') || itemsText.includes('itu')) out.add('ITU');
    if (itemsText.includes('sliding fee')) out.add('SF');
    if (itemsText.includes('payment assistance')) out.add('PA');
    if (itemsText.includes('no payment accepted')) out.add('NP');
    if (itemsText.includes('samhsa funding') || itemsText.includes('block grant')) out.add('SAMF');
  }

  return out;
}

/**
 * Evaluates a facility's insurance and safety-net compatibility against a payer query.
 * Returns { status, matchedCodes, fallbackCodes, note }.
 */
export function matchInsuranceCompatibility(facility, payerInput) {
  const resolved = resolvePayerCodes(payerInput);
  if (resolved.category === 'unspecified') {
    return {
      status: 'unspecified',
      matchedCodes: [],
      fallbackCodes: [],
      note: 'No insurance or payment filter specified.',
    };
  }

  const facilityPay = extractFacilityPaymentCodes(facility);
  const matchedCodes = resolved.primary.filter((c) => facilityPay.has(c));
  const fallbackCodes = resolved.fallback.filter((c) => facilityPay.has(c));

  if (matchedCodes.length > 0) {
    const note = resolved.recognized
      ? `Facility lists matching coverage (${matchedCodes.join(', ')}). Confirm plan network status at intake.`
      : `Plan name not in directory, but facility accepts Private Insurance (${matchedCodes.join(', ')}). Verify carrier network with intake.`;
    return {
      status: 'in-network',
      matchedCodes,
      fallbackCodes,
      note,
    };
  }

  if (fallbackCodes.length > 0) {
    return {
      status: 'safety-net-eligible',
      matchedCodes: [],
      fallbackCodes,
      note: `Facility does not list ${resolved.primary.join('/')} directly, but offers safety-net financial assistance (${fallbackCodes.join(', ')}).`,
    };
  }

  return {
    status: 'out-of-network',
    matchedCodes: [],
    fallbackCodes: [],
    note: `Facility does not list ${resolved.primary.join('/')} or sliding-scale/payment assistance (${resolved.fallback.join('/')}).`,
  };
}

// ---------------------------------------------------------------------------
// Multi-Criteria Facility Scoring & Query Memoizer
// ---------------------------------------------------------------------------

/**
 * Computes a deterministic match score and breakdown for ranking facilities
 * by clinical fit, level of care, accreditations, insurance compatibility, and proximity.
 */
export function scoreFacilityMatch(
  facility,
  { codes = [], payer = '', accreditations = [], levelsOfCare = [] } = {},
) {
  const facilityCodes = new Set(Array.isArray(facility?.codes) ? facility.codes : []);
  const reqCodes = parseCodeList(codes);
  const reqLevels = parseCodeList(levelsOfCare).map((c) => c.toUpperCase());
  const reqAccreditations = parseCodeList(accreditations).map((c) => c.toUpperCase());

  const combinedRequested = [...new Set([...reqCodes, ...reqLevels])];
  const matchedCodes = combinedRequested.filter((c) => facilityCodes.has(c));
  const missingCodes = combinedRequested.filter((c) => !facilityCodes.has(c));

  const facilityAccreditations = ACCREDITATION_CODES.filter((c) => facilityCodes.has(c));
  const accreditationCodes = reqAccreditations.length > 0
    ? facilityAccreditations.filter((c) => reqAccreditations.includes(c))
    : facilityAccreditations;

  const insuranceMatch = matchInsuranceCompatibility(facility, payer);

  let score = 0;

  // Clinical & level-of-care code score
  score += matchedCodes.length * 25;
  if (combinedRequested.length > 0 && missingCodes.length === 0) {
    score += 15; // Full clinical match bonus
  }

  // Insurance match score
  if (insuranceMatch.status === 'in-network') {
    score += 30;
  } else if (insuranceMatch.status === 'safety-net-eligible') {
    score += 15;
  }

  // Accreditation score
  if (reqAccreditations.length > 0) {
    score += accreditationCodes.length * 10;
  } else {
    score += Math.min(3, facilityAccreditations.length) * 3;
  }

  // Proximity tie-breaker bonus (0..20 points)
  const miles = typeof facility?.miles === 'number' && Number.isFinite(facility.miles) && facility.miles >= 0
    ? facility.miles
    : null;
  if (miles !== null) {
    const proximityBonus = Math.max(0, 20 - Math.min(20, miles / 5));
    score += Math.round(proximityBonus * 100) / 100;
  }

  score = Math.round(score * 100) / 100;

  return {
    matchedCodes,
    missingCodes,
    accreditationCodes,
    insuranceMatch,
    score,
  };
}

/**
 * High-speed synchronous LRU memoizer with TTL expiration.
 * Can be used as a key-value cache (.get/.set/.has/.delete/.clear),
 * as a function wrapper (.memoize(fn, keyFn)), or called directly:
 * - memo(key, computeFn)
 * - memo(fn, keyFn)
 */
export function createQueryMemoizer({ maxEntries = 256, ttlMs = 60_000, now = Date.now } = {}) {
  const limit = Math.max(1, Number.isInteger(maxEntries) ? maxEntries : 256);
  const ttl = Math.max(1, Number.isFinite(ttlMs) ? ttlMs : 60_000);
  const store = new Map();
  let hits = 0;
  let misses = 0;

  function get(key) {
    const entry = store.get(key);
    if (!entry) {
      misses++;
      return undefined;
    }
    if (now() >= entry.expiresAt) {
      store.delete(key);
      misses++;
      return undefined;
    }
    // Refresh LRU order
    store.delete(key);
    store.set(key, entry);
    hits++;
    return entry.value;
  }

  function set(key, value) {
    if (store.has(key)) store.delete(key);
    store.set(key, { value, expiresAt: now() + ttl });
    while (store.size > limit) {
      const oldestKey = store.keys().next().value;
      store.delete(oldestKey);
    }
    return value;
  }

  function has(key) {
    const entry = store.get(key);
    if (!entry) return false;
    if (now() >= entry.expiresAt) {
      store.delete(key);
      return false;
    }
    return true;
  }

  function del(key) {
    return store.delete(key);
  }

  function clear() {
    store.clear();
    hits = 0;
    misses = 0;
  }

  function memoize(fn, keyFn = (...args) => JSON.stringify(args)) {
    return function memoized(...args) {
      const key = String(keyFn(...args));
      const existing = store.get(key);
      const t = now();
      if (existing && t < existing.expiresAt) {
        store.delete(key);
        store.set(key, existing);
        hits++;
        return existing.value;
      }
      if (existing) store.delete(key);
      misses++;
      const result = fn(...args);
      set(key, result);
      return result;
    };
  }

  function callable(first, second) {
    if (typeof first === 'function') {
      return memoize(first, second);
    }
    if (typeof second === 'function') {
      const key = String(first);
      const existing = store.get(key);
      const t = now();
      if (existing && t < existing.expiresAt) {
        store.delete(key);
        store.set(key, existing);
        hits++;
        return existing.value;
      }
      if (existing) store.delete(key);
      misses++;
      const result = second();
      set(key, result);
      return result;
    }
    return get(first);
  }

  callable.get = get;
  callable.set = set;
  callable.has = has;
  callable.delete = del;
  callable.clear = clear;
  callable.memoize = memoize;
  callable.wrap = memoize;
  Object.defineProperty(callable, 'size', {
    get() {
      const t = now();
      for (const [k, v] of store) {
        if (t >= v.expiresAt) store.delete(k);
      }
      return store.size;
    },
  });
  Object.defineProperty(callable, 'hits', { get: () => hits });
  Object.defineProperty(callable, 'misses', { get: () => misses });

  return callable;
}
