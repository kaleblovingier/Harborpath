// Column-oriented encoding for the large files in data/. Storing each field
// once as a column, instead of repeating object keys on every row, roughly
// halves the files, and fixed-point integers parse about twice as fast as
// decimals. That shortens cold starts and the server bundle.
//
// A table is { count, columns: { field: column } }. Each column is one of:
//   [value, ...]                                  plain JSON values
//   { "scale": 10000, "values": [int, ...] }      fixed point: value = int / scale
//   { "scale": 1, "delta": true, "values": [...] } fixed point, each stored as the
//                                                 difference from the previous row
//   { "dict": [value, ...], "values": [i, ...] }  dictionary: value = dict[i]
//   { "bits": "0110..." }                         booleans
//
// Builders (scripts/sources/) encode with encodeTable(); the server decodes
// with decodeTable(). Decoding is exact: every fixed-point value comes back as
// the same double the builder rounded it to.

/**
 * rows: array of objects. spec: { field: encoding } in output order, where an
 * encoding is 'plain', 'dict', 'bits', or { decimals, delta? } for numbers.
 */
export function encodeTable(rows, spec) {
  const columns = {};
  for (const [field, enc] of Object.entries(spec)) {
    columns[field] = encodeColumn(rows.map((r) => r[field]), enc, field);
  }
  return { count: rows.length, columns };
}

function encodeColumn(values, enc, field) {
  if (enc === 'plain') return values;
  if (enc === 'bits') return { bits: values.map((v) => (v ? '1' : '0')).join('') };
  if (enc === 'dict') {
    const dict = [...new Set(values)];
    const index = new Map(dict.map((v, i) => [v, i]));
    return { dict, values: values.map((v) => index.get(v)) };
  }
  const scale = 10 ** enc.decimals;
  let prev = 0;
  const out = values.map((v) => {
    const n = Math.round(v * scale);
    // Refuse to silently lose precision: the value must already be rounded.
    if (!Number.isFinite(v) || n / scale !== v) throw new Error(`${field}: ${v} does not fit ${enc.decimals} decimals`);
    const stored = enc.delta ? n - prev : n;
    prev = n;
    return stored;
  });
  return enc.delta ? { scale, delta: true, values: out } : { scale, values: out };
}

/** Decode a column to an array (Float64Array for fixed-point numbers). */
export function decodeColumn(col) {
  if (Array.isArray(col)) return col;
  if (typeof col.bits === 'string') return Array.from(col.bits, (c) => c === '1');
  if (Array.isArray(col.dict)) return col.values.map((i) => col.dict[i]);
  const out = new Float64Array(col.values.length);
  let acc = 0;
  for (let i = 0; i < col.values.length; i++) {
    acc = col.delta ? acc + col.values[i] : col.values[i];
    out[i] = acc / col.scale;
  }
  return out;
}

/** { count, columns } -> { count, columns: { field: decoded array } } */
export function decodeTable(table) {
  const columns = {};
  for (const [field, col] of Object.entries(table.columns)) {
    columns[field] = decodeColumn(col);
    if (columns[field].length !== table.count) throw new Error(`column ${field} has ${columns[field].length} rows, expected ${table.count}`);
  }
  return { count: table.count, columns };
}

export function isTable(value) {
  return Boolean(value) && typeof value === 'object' && Number.isInteger(value.count) && typeof value.columns === 'object';
}
