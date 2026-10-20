// Minimal ZIP reader for the single-file archives published by the Census
// Bureau. Reads the central directory so it works even when the local headers
// use data descriptors. Supports "stored" (0) and "deflate" (8) entries only.
import { inflateRawSync } from 'node:zlib';

const EOCD_SIG = 0x06054b50;
const CEN_SIG = 0x02014b50;
const LOC_SIG = 0x04034b50;

export function readZipEntries(buf) {
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65557); i--) {
    if (buf.readUInt32LE(i) === EOCD_SIG) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error('Not a zip archive (no end-of-central-directory record)');

  const count = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);
  const entries = [];
  for (let n = 0; n < count; n++) {
    if (buf.readUInt32LE(p) !== CEN_SIG) throw new Error('Corrupt central directory');
    const method = buf.readUInt16LE(p + 10);
    const compSize = buf.readUInt32LE(p + 20);
    const nameLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const commentLen = buf.readUInt16LE(p + 32);
    const localOffset = buf.readUInt32LE(p + 42);
    const name = buf.toString('utf8', p + 46, p + 46 + nameLen);
    entries.push({ name, method, compSize, localOffset });
    p += 46 + nameLen + extraLen + commentLen;
  }

  return entries.map((e) => ({
    name: e.name,
    read() {
      const lp = e.localOffset;
      if (buf.readUInt32LE(lp) !== LOC_SIG) throw new Error(`Bad local header for ${e.name}`);
      const start = lp + 30 + buf.readUInt16LE(lp + 26) + buf.readUInt16LE(lp + 28);
      const raw = buf.subarray(start, start + e.compSize);
      if (e.method === 0) return Buffer.from(raw);
      if (e.method === 8) return inflateRawSync(raw);
      throw new Error(`Unsupported zip compression method ${e.method}`);
    },
  }));
}
