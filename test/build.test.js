import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deflateRawSync } from 'node:zlib';
import { encodeTable, decodeTable, isTable } from '../src/columns.js';
import { parseCsv } from '../scripts/lib/csv.mjs';
import { readDbf } from '../scripts/lib/dbf.mjs';
import { readZipEntries } from '../scripts/lib/unzip.mjs';
import { cleanPlaceNames } from '../scripts/sources/places.mjs';
import { compactCategories, spanishNamesModule } from '../scripts/sources/service-codes.mjs';

test('parseCsv handles quotes, escaped quotes, commas, and CRLF', () => {
  const rows = parseCsv('\uFEFFName,Note\r\n"Smith, Jo","said ""hi"""\r\nPlain,\r\n');
  assert.deepEqual(rows, [{ Name: 'Smith, Jo', Note: 'said "hi"' }, { Name: 'Plain', Note: '' }]);
});

test('cleanPlaceNames strips Census descriptors and keeps aliases', () => {
  assert.deepEqual(cleanPlaceNames('Bellingham city'), ['Bellingham']);
  assert.deepEqual(cleanPlaceNames('Boise City city'), ['Boise City']);
  assert.deepEqual(cleanPlaceNames('Indianapolis city (balance)'), ['Indianapolis']);
  assert.deepEqual(cleanPlaceNames('San Buenaventura (Ventura) city'), ['San Buenaventura', 'Ventura']);
  assert.deepEqual(cleanPlaceNames('Nashville-Davidson metropolitan government (balance)'), ['Nashville-Davidson']);
});

test('readZipEntries reads a deflated single-file archive', () => {
  const name = Buffer.from('a.txt');
  const content = Buffer.from('GEOID|INTPTLAT\n98225|48.75\n');
  const data = deflateRawSync(content);

  const local = Buffer.alloc(30);
  local.writeUInt32LE(0x04034b50, 0);
  local.writeUInt16LE(8, 8);
  local.writeUInt32LE(data.length, 18);
  local.writeUInt32LE(content.length, 22);
  local.writeUInt16LE(name.length, 26);

  const central = Buffer.alloc(46);
  central.writeUInt32LE(0x02014b50, 0);
  central.writeUInt16LE(8, 10);
  central.writeUInt32LE(data.length, 20);
  central.writeUInt32LE(content.length, 24);
  central.writeUInt16LE(name.length, 28);
  central.writeUInt32LE(0, 42);

  const cdOffset = local.length + name.length + data.length;
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(1, 8);
  eocd.writeUInt16LE(1, 10);
  eocd.writeUInt32LE(central.length + name.length, 12);
  eocd.writeUInt32LE(cdOffset, 16);

  const zip = Buffer.concat([local, name, data, central, name, eocd]);
  const [entry] = readZipEntries(zip);
  assert.equal(entry.name, 'a.txt');
  assert.equal(entry.read().toString(), content.toString());
});

test('encodeTable and decodeTable round-trip plain, dict, bits, fixed-point, and delta columns', () => {
  const rows = [
    { name: 'Alpha', state: 'WA', mobile: false, zip: 98225, lat: 48.7519 },
    { name: 'Beta', state: 'WA', mobile: true, zip: 98226, lat: 48.7912 },
  ];
  const encoded = encodeTable(rows, {
    name: 'plain',
    state: 'dict',
    mobile: 'bits',
    zip: { decimals: 0, delta: true },
    lat: { decimals: 4 },
  });
  assert.equal(isTable(encoded), true);
  const decoded = decodeTable(encoded);
  assert.equal(decoded.count, 2);
  assert.deepEqual(decoded.columns.name, ['Alpha', 'Beta']);
  assert.deepEqual(decoded.columns.state, ['WA', 'WA']);
  assert.deepEqual(decoded.columns.mobile, [false, true]);
  assert.deepEqual(Array.from(decoded.columns.zip), [98225, 98226]);
  assert.deepEqual(Array.from(decoded.columns.lat), [48.7519, 48.7912]);
});

test('compactCategories cleans Spanish names and generates es-services module', () => {
  const cats = compactCategories([{
    categoryCode: 'TC',
    categoryName: 'Type of Care',
    spanishCategoryName: 'Tipo de atención (p. ej., ambulatorio)',
    saCategory: 'Y',
    mhCategory: 'N',
    serviceCodeList: [{
      serviceCode: 'SA',
      serviceName: 'Substance use treatment',
      serviceSpanishName: 'Tratamiento de abuso de sustancias',
      saCode: 'Y',
      mhCode: 'N',
    }],
  }]);
  assert.equal(cats[0].es, 'Tipo de atención');
  assert.equal(cats[0].services[0].es, 'Tratamiento de abuso de sustancias');
  assert.match(spanishNamesModule(cats), /export default /);
});

test('readDbf parses UTF-8 dBASE attribute records', () => {
  const header = Buffer.alloc(32 + 32 + 1);
  header.writeUInt32LE(1, 4); // 1 record
  header.writeUInt16LE(header.length, 8);
  header.writeUInt16LE(1 + 10, 10); // deletion flag + 10-byte field
  header.write('NAME', 32, 'latin1');
  header[32 + 16] = 10;
  header[64] = 0x0d;
  const record = Buffer.alloc(11, 0x20);
  record.write('Hagåtña', 1, 'utf8');
  const rows = readDbf(Buffer.concat([header, record]));
  assert.deepEqual(rows, [{ NAME: 'Hagåtña' }]);
});
