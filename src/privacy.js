// Privacy, data minimization, and confidentiality guardrails for HarborPath.
//
// HarborPath serves people seeking substance use treatment, withdrawal support,
// and overdose prevention tools. Under 42 CFR Part 2 principles and strict
// data minimization, the server must never accept, log, cache, or forward
// personally identifiable information (PII), protected health information (PHI),
// ad-tech tracking tokens, or uncoarsened GPS coordinates.

export const ROUTE_PARAM_ALLOWLIST = Object.freeze({
  '/api/health': Object.freeze([]),
  '/api/meta': Object.freeze([]),
  '/api/geocode': Object.freeze(['q']),
  '/api/region': Object.freeze(['zip', 'lat', 'lng']),
  '/api/states': Object.freeze([]),
  '/api/state': Object.freeze(['code']),
  '/api/telehealth': Object.freeze(['state', 'kind', 'codes', 'page', 'lat', 'lng']),
  '/api/treatment': Object.freeze(['lat', 'lng', 'radius', 'kind', 'codes', 'page', 'payer']),
  '/api/health-centers': Object.freeze(['lat', 'lng', 'radius']),
  '/api/providers': Object.freeze(['type', 'lat', 'lng', 'radius', 'filter']),
  '/api/nearby-summary': Object.freeze(['lat', 'lng', 'radius']),
});

export const FORBIDDEN_PII_PARAM_NAMES = new Set([
  'ssn',
  'social_security',
  'dob',
  'birth',
  'birthdate',
  'date_of_birth',
  'name',
  'first_name',
  'last_name',
  'firstname',
  'lastname',
  'fullname',
  'full_name',
  'email',
  'phone',
  'phone_number',
  'address',
  'street',
  'mrn',
  'patient_id',
  'member_id',
  'policy_number',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'fbclid',
  'gclid',
  'msclkid',
  '_ga',
]);

const SSN_RE = /\b\d{3}-\d{2}-\d{4}\b/g;
const EMAIL_RE = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
const PHONE_RE = /(?:\+?1[-.\s]?)?(?:\(\d{3}\)[-.\s]?|\b\d{3}[-.\s])\d{3}[-.\s]\d{4}\b/g;
const QUERY_STRING_RE = /\?\S+/g;
const HIGH_PRECISION_COORD_RE = /(?<!\w)-?\b\d{1,3}\.\d{3,}\b/g;

function isForbiddenPiiParamName(name) {
  const norm = String(name ?? '').trim().toLowerCase();
  return FORBIDDEN_PII_PARAM_NAMES.has(norm) || norm.startsWith('utm_');
}

function scrubFreeTextPii(value) {
  const raw = String(value ?? '');
  SSN_RE.lastIndex = 0;
  EMAIL_RE.lastIndex = 0;
  PHONE_RE.lastIndex = 0;
  const hasPii = SSN_RE.test(raw) || EMAIL_RE.test(raw) || PHONE_RE.test(raw);
  if (!hasPii) return { value: raw, scrubbed: false };
  const cleaned = raw
    .replace(SSN_RE, '')
    .replace(EMAIL_RE, '')
    .replace(PHONE_RE, '')
    .replace(/\s+/g, ' ')
    .trim();
  return { value: cleaned, scrubbed: true };
}

/**
 * Strip unpermitted query parameters and scrub accidental PII from free-text
 * inputs before any route handler, cache key, or upstream call sees them.
 *
 * @param {string} pathname
 * @param {URLSearchParams | string | Record<string, string>} searchParams
 * @returns {{ cleanParams: URLSearchParams, strippedParams: string[], hadForbiddenPii: boolean }}
 */
export function sanitizeSearchParams(pathname, searchParams) {
  const input = searchParams instanceof URLSearchParams
    ? searchParams
    : new URLSearchParams(searchParams ?? '');

  const hasRouteAllowlist = Object.hasOwn(ROUTE_PARAM_ALLOWLIST, pathname);
  const allowedSet = hasRouteAllowlist ? new Set(ROUTE_PARAM_ALLOWLIST[pathname]) : null;

  const cleanParams = new URLSearchParams();
  const strippedParams = [];
  let hadForbiddenPii = false;

  const markStripped = (key) => {
    if (!strippedParams.includes(key)) strippedParams.push(key);
  };

  for (const [key, rawValue] of input.entries()) {
    const isForbiddenName = isForbiddenPiiParamName(key);
    if (isForbiddenName) {
      hadForbiddenPii = true;
      markStripped(key);
      continue;
    }

    if (allowedSet && !allowedSet.has(key)) {
      markStripped(key);
      continue;
    }

    const { value, scrubbed } = scrubFreeTextPii(rawValue);
    if (scrubbed) hadForbiddenPii = true;
    cleanParams.append(key, value);
  }

  return { cleanParams, strippedParams, hadForbiddenPii };
}

/**
 * Redact SSNs, email addresses, phone numbers, URL query strings, and
 * high-precision coordinates (>2 decimal places) from any log or error text.
 *
 * @param {unknown} text
 * @returns {string}
 */
export function redactSensitiveText(text) {
  const raw = text instanceof Error ? text.message : String(text ?? '');
  return raw
    .replace(QUERY_STRING_RE, '[REDACTED]')
    .replace(SSN_RE, '[REDACTED]')
    .replace(EMAIL_RE, '[REDACTED]')
    .replace(PHONE_RE, '[REDACTED]')
    .replace(HIGH_PRECISION_COORD_RE, '[REDACTED]');
}

/**
 * Wrap a logger so every argument passed to error, warn, info, or log is
 * sanitized through redactSensitiveText() before reaching the sink.
 *
 * @param { Partial< Pick<Console, 'error' | 'warn' | 'info' | 'log'> > } [logger]
 */
export function createPrivacyLogger(logger = console) {
  const formatArg = (arg) => {
    if (arg instanceof Error) return redactSensitiveText(arg.message);
    if (typeof arg === 'string') return redactSensitiveText(arg);
    if (arg && typeof arg === 'object') {
      try {
        return redactSensitiveText(JSON.stringify(arg));
      } catch {
        return '[REDACTED]';
      }
    }
    return redactSensitiveText(String(arg ?? ''));
  };

  const invoke = (method, ...args) => {
    const sanitized = args.map(formatArg);
    if (typeof logger?.[method] === 'function') {
      logger[method](...sanitized);
    } else if (typeof logger?.error === 'function') {
      logger.error(...sanitized);
    }
  };

  return {
    error: (...args) => invoke('error', ...args),
    warn: (...args) => invoke('warn', ...args),
    info: (...args) => invoke('info', ...args),
    log: (...args) => invoke('log', ...args),
  };
}

function normalizeHeaderMap(headers) {
  const map = new Map();
  if (!headers) return map;
  if (Array.isArray(headers)) {
    for (const item of headers) {
      if (item && typeof item.key === 'string') {
        map.set(item.key.toLowerCase(), String(item.value ?? ''));
      }
    }
    return map;
  }
  if (typeof headers.entries === 'function') {
    for (const [k, v] of headers.entries()) {
      map.set(String(k).toLowerCase(), String(v));
    }
    return map;
  }
  if (typeof headers === 'object') {
    for (const [k, v] of Object.entries(headers)) {
      if (v !== undefined && v !== null) {
        map.set(k.toLowerCase(), String(v));
      }
    }
  }
  return map;
}

const REQUIRED_SECURITY_HEADERS = [
  'Content-Security-Policy',
  'Referrer-Policy',
  'X-Content-Type-Options',
  'X-Frame-Options',
  'Cross-Origin-Opener-Policy',
  'Cross-Origin-Resource-Policy',
  'Permissions-Policy',
];

/**
 * Audit a response header map against HarborPath's zero-third-party privacy
 * and security baseline.
 *
 * @param {Record<string, string> | Headers | Array<{key: string, value: string}>} headers
 * @returns {{ ok: boolean, missing: string[], violations: string[] }}
 */
export function auditSecurityHeaders(headers) {
  const map = normalizeHeaderMap(headers);
  const missing = [];
  const violations = [];

  for (const name of REQUIRED_SECURITY_HEADERS) {
    const val = map.get(name.toLowerCase());
    if (!val || !val.trim()) {
      missing.push(name);
    }
  }

  const csp = map.get('content-security-policy');
  if (csp) {
    if (!csp.includes("default-src 'self'")) {
      violations.push("Content-Security-Policy must include default-src 'self'");
    }
    if (!csp.includes("frame-ancestors 'none'")) {
      violations.push("Content-Security-Policy must include frame-ancestors 'none'");
    }
    if (!csp.includes("object-src 'none'")) {
      violations.push("Content-Security-Policy must include object-src 'none'");
    }
    if (/https?:/i.test(csp)) {
      violations.push('Content-Security-Policy must not allow external http(s) origins');
    }
    if (/unsafe-inline|unsafe-eval/i.test(csp)) {
      violations.push('Content-Security-Policy must not allow unsafe-inline or unsafe-eval');
    }
  }

  const referrer = map.get('referrer-policy');
  if (referrer && referrer.trim().toLowerCase() !== 'no-referrer') {
    violations.push('Referrer-Policy must be no-referrer');
  }

  const xcto = map.get('x-content-type-options');
  if (xcto && xcto.trim().toLowerCase() !== 'nosniff') {
    violations.push('X-Content-Type-Options must be nosniff');
  }

  const xfo = map.get('x-frame-options');
  if (xfo && xfo.trim().toUpperCase() !== 'DENY') {
    violations.push('X-Frame-Options must be DENY');
  }

  const coop = map.get('cross-origin-opener-policy');
  if (coop && coop.trim().toLowerCase() !== 'same-origin') {
    violations.push('Cross-Origin-Opener-Policy must be same-origin');
  }

  const corp = map.get('cross-origin-resource-policy');
  if (corp && corp.trim().toLowerCase() !== 'same-origin') {
    violations.push('Cross-Origin-Resource-Policy must be same-origin');
  }

  const perms = map.get('permissions-policy');
  if (perms) {
    if (!perms.includes('camera=()') || !perms.includes('microphone=()')) {
      violations.push('Permissions-Policy must disable camera and microphone');
    }
  }

  return {
    ok: missing.length === 0 && violations.length === 0,
    missing,
    violations,
  };
}
