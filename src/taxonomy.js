// Wraps SAMHSA's FindTreatment.gov service taxonomy (data/service-codes.json).
// The listing API returns services as human-readable names grouped by category
// code; this maps those names back to stable service codes so the client can
// filter and badge on codes instead of free text.

const normalize = (s) =>
  String(s)
    .toLowerCase()
    .replace(/\(e\.g\.[^)]*\)/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

export function createTaxonomy({ categories }) {
  const categoryByCode = new Map();
  const serviceByCode = new Map();
  const nameIndex = new Map(); // category code -> Map(normalized name -> service code)
  const globalNameIndex = new Map(); // normalized name -> service code (only when unambiguous)
  const ambiguous = new Set();

  for (const cat of categories) {
    categoryByCode.set(cat.code, cat);
    const idx = new Map();
    for (const svc of cat.services) {
      serviceByCode.set(svc.code, { ...svc, category: cat.code });
      const key = normalize(svc.name);
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
  };
}
