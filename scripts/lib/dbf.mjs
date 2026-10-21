// Minimal dBASE (.dbf) reader for the attribute tables inside Census TIGER/Line
// shapefile archives. TIGER/Line declares UTF-8 in its .cpg file, so text is
// decoded as UTF-8 (place names such as "Hagåtña" keep their diacritics).
export function readDbf(buf) {
  const count = buf.readUInt32LE(4);
  const headerLength = buf.readUInt16LE(8);
  const recordLength = buf.readUInt16LE(10);
  const fields = [];
  for (let p = 32; buf[p] !== 0x0d; p += 32) {
    fields.push({ name: buf.toString('latin1', p, p + 11).replace(/\0.*$/s, ''), length: buf[p + 16] });
  }
  const rows = [];
  for (let i = 0; i < count; i++) {
    const start = headerLength + i * recordLength;
    if (buf[start] === 0x2a) continue; // deleted record
    let p = start + 1;
    const row = {};
    for (const f of fields) {
      row[f.name] = buf.toString('utf8', p, p + f.length).trim();
      p += f.length;
    }
    rows.push(row);
  }
  return rows;
}
