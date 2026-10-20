import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

export function readJson(file) {
  return JSON.parse(readFileSync(file, 'utf8'));
}

// Only http(s) URLs survive; bare domains ("www.example.org") get https://.
export function normalizeWebsite(raw) {
  const v = typeof raw === 'string' ? raw.trim() : '';
  if (!v || /\s/.test(v)) return null;
  const withScheme = /^https?:\/\//i.test(v) ? v : `https://${v}`;
  try {
    const u = new URL(withScheme);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
    if (!u.hostname.includes('.')) return null;
    return u.toString();
  } catch {
    return null;
  }
}

export function stableId(...parts) {
  return createHash('sha1').update(parts.map((p) => String(p ?? '')).join('|')).digest('hex').slice(0, 16);
}

export function clean(v) {
  if (v === null || v === undefined) return null;
  const s = String(v).replace(/\s+/g, ' ').trim();
  return s === '' ? null : s;
}

export function toFiniteNumber(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
