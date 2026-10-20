import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deflateRawSync } from 'node:zlib';
import { parseCsv } from '../scripts/lib/csv.mjs';
import { readZipEntries } from '../scripts/lib/unzip.mjs';
import { cleanPlaceNames } from '../scripts/sources/places.mjs';

test('parseCsv handles quotes, escaped quotes, commas, and CRLF', () => {
  const rows = parseCsv('﻿Name,Note\r\n"Smith, Jo","said ""hi"""\r\nPlain,\r\n');
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
