// Wraps SAMHSA's FindTreatment.gov service taxonomy (data/service-codes.json).
// The listing API returns services as human-readable names grouped by category
// code; this maps those names back to stable service codes so the client can
// filter and badge on codes instead of free text.

const normalize = (s) =>
  String(s ?? '')
    .toLowerCase()
    .replace(/\(e\.g\.[^)]*\)/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

function isWithinEditDistanceOne(a, b) {
  if (a === b) return true;
  const la = a.length;
  const lb = b.length;
  if (Math.abs(la - lb) > 1) return false;
  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < la && j < lb) {
    if (a[i] === b[j]) {
      i++;
      j++;
    } else {
      edits++;
      if (edits > 1) return false;
      if (la > lb) i++;
      else if (lb > la) j++;
      else {
        i++;
        j++;
      }
    }
  }
  if (i < la || j < lb) edits++;
  return edits <= 1;
}

export function createTaxonomy({ categories }) {
  const categoryByCode = new Map();
  const serviceByCode = new Map();
  const nameIndex = new Map(); // category code -> Map(normalized name -> service code)
  const globalNameIndex = new Map(); // normalized name -> service code (only when unambiguous)
  const ambiguous = new Set();
  const searchEntries = [];

  for (const cat of categories) {
    categoryByCode.set(cat.code, cat);
    const catNorm = normalize(cat.name);
    const idx = new Map();
    for (const svc of cat.services) {
      const entry = { ...svc, category: cat.code };
      serviceByCode.set(svc.code, entry);
      const key = normalize(svc.name);
      const fullNorm = String(svc.name ?? '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
      const esNorm = normalize(svc.es);
      const codeNorm = String(svc.code).toLowerCase();
      const words = fullNorm.split(' ').filter(Boolean);
      searchEntries.push({
        entry,
        codeNorm,
        key,
        fullNorm,
        esNorm,
        catNorm,
        words,
        combined: `${codeNorm} ${fullNorm} ${esNorm} ${catNorm}`,
      });
      idx.set(key, svc.code);
      if (globalNameIndex.has(key) && globalNameIndex.get(key) !== svc.code) ambiguous.add(key);
      else globalNameIndex.set(key, svc.code);
    }
    nameIndex.set(cat.code, idx);
  }
  for (const key of ambiguous) globalNameIndex.delete(key);

  return {
    categories,
    hasService: (code) => serviceByCode.has(code),
    service: (code) => serviceByCode.get(code) ?? null,
    categoryName: (code) => categoryByCode.get(code)?.name?.trim() ?? null,

    /** Map one service name (as it appears in a listing) to its code, or null. */
    codeFor(categoryCode, name) {
      const key = normalize(name);
      return nameIndex.get(categoryCode)?.get(key) ?? globalNameIndex.get(key) ?? null;
    },

    /** Partial and fuzzy search across SAMHSA service codes and names. */
    searchServices(query, { kind, category, limit = 25 } = {}) {
      const qNorm = normalize(query);
      if (!qNorm) return [];
      const tokens = qNorm.split(' ').filter(Boolean);
      const scored = [];

      for (const item of searchEntries) {
        if (category && item.entry.category !== category) continue;
        if (kind === 'sa' && !item.entry.sa) continue;
        if (kind === 'mh' && !item.entry.mh) continue;

        let score = 0;
        if (item.codeNorm === qNorm) {
          score = 100;
        } else if (item.key === qNorm || item.fullNorm === qNorm) {
          score = 90;
        } else if (item.codeNorm.startsWith(qNorm)) {
          score = 80;
        } else if (item.key.startsWith(qNorm) || item.fullNorm.startsWith(qNorm)) {
          score = 75;
        } else if (item.words.some((w) => w.startsWith(qNorm))) {
          score = 70;
        } else if (item.fullNorm.includes(qNorm)) {
          score = 65;
        } else if (item.esNorm.includes(qNorm) || item.catNorm.includes(qNorm)) {
          score = 55;
        } else if (tokens.length > 1 && tokens.every((t) => item.combined.includes(t))) {
          score = 50;
        } else if (
          tokens.every((t) =>
            t.length >= 4 && item.words.some((w) => w.startsWith(t) || (w.length >= 4 && isWithinEditDistanceOne(t, w))),
          )
        ) {
          score = 35;
        }

        if (score > 0) {
          scored.push({ entry: item.entry, score });
        }
      }

      scored.sort(
        (a, b) =>
          b.score - a.score ||
          a.entry.code.length - b.entry.code.length ||
          a.entry.code.localeCompare(b.entry.code),
      );

      return scored.slice(0, limit).map((s) => s.entry);
    },
  };
}
