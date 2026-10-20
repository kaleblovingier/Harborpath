#!/usr/bin/env node
// Downloads the public federal datasets HarborPath relies on and compacts them
// into ./data. Re-run any time to refresh (npm run data:build).
//
//   SAMHSA FindTreatment.gov service taxonomy  -> data/service-codes.json
//   Census Gazetteer ZCTA (ZIP) centroids      -> data/zcta.json
//   Census Gazetteer place (city/town) points  -> data/places.json
//   HRSA health center service delivery sites  -> data/health-centers.json
//
// All sources are U.S. federal government works in the public domain.
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { readZipEntries } from './lib/unzip.mjs';
import { parseCsv } from './lib/csv.mjs';
import { normalizeWebsite } from '../src/util.js';

const DATA_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'data');
const GAZ_YEAR = process.env.GAZETTEER_YEAR || '2025';

const SOURCES = {
  serviceCodes: 'https://findtreatment.gov/locator/serviceCategories.json',
  zcta: `https://www2.census.gov/geo/docs/maps-data/data/gazetteer/${GAZ_YEAR}_Gazetteer/${GAZ_YEAR}_Gaz_zcta_national.zip`,
  places: `https://www2.census.gov/geo/docs/maps-data/data/gazetteer/${GAZ_YEAR}_Gazetteer/${GAZ_YEAR}_Gaz_place_national.zip`,
  healthCenters: 'https://data.hrsa.gov/DataDownload/DD_Files/Health_Center_Service_Delivery_and_LookAlike_Sites.csv',
};

async function download(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'HarborPath data builder' } });
  if (!res.ok) throw new Error(`GET ${url} -> HTTP ${res.status}`);
  return { buf: Buffer.from(await res.arrayBuffer()), lastModified: res.headers.get('last-modified') };
}

const round = (n, d = 4) => Math.round(n * 10 ** d) / 10 ** d;

function parsePipeTable(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  const header = lines[0].split('|').map((h) => h.trim());
  return lines.slice(1).map((l) => {
    const cells = l.split('|');
    return Object.fromEntries(header.map((h, i) => [h, (cells[i] ?? '').trim()]));
  });
}

async function readGazetteer(url) {
  const { buf } = await download(url);
  const [entry] = readZipEntries(buf);
  return parsePipeTable(entry.read().toString('utf8'));
}

// --- SAMHSA service taxonomy -------------------------------------------------
async function buildServiceCodes() {
  const { buf } = await download(SOURCES.serviceCodes);
  const categories = JSON.parse(buf.toString('utf8')).map((c) => ({
    code: c.categoryCode.trim(),
    name: c.categoryName.trim(),
    sa: c.saCategory === 'Y',
    mh: c.mhCategory === 'Y',
    services: c.serviceCodeList.map((s) => ({
      code: s.serviceCode.trim(),
      // The feed contains a few mis-encoded registered-trademark characters.
      name: s.serviceName.replace(/�|®/g, '').replace(/\s+/g, ' ').trim(),
      sa: s.saCode === 'Y',
      mh: s.mhCode === 'Y',
    })),
  }));
  return { categories };
}

// --- Census ZIP centroids ----------------------------------------------------
async function buildZcta() {
  const rows = await readGazetteer(SOURCES.zcta);
  const out = {};
  for (const r of rows) {
    const lat = Number(r.INTPTLAT);
    const lng = Number(r.INTPTLONG);
    if (r.GEOID && Number.isFinite(lat) && Number.isFinite(lng)) out[r.GEOID] = [round(lat), round(lng)];
  }
  return out;
}

// --- Census places (cities, towns, CDPs) -------------------------------------
const PLACE_SUFFIX = new RegExp(
  '\\s+(city and borough|consolidated government|metropolitan government|metro government|' +
    'unified government|urban county|municipality|borough|city|town|township|village|CDP|' +
    'comunidad|zona urbana|corporation)$',
  'i',
);

// "Indianapolis city (balance)" -> ["Indianapolis"]
// "San Buenaventura (Ventura) city" -> ["San Buenaventura", "Ventura"]
export function cleanPlaceNames(name) {
  const base = name.replace(/\s+\(balance\)$/i, '').replace(PLACE_SUFFIX, '').trim();
  const alias = base.match(/^(.+?)\s+\(([^)]+)\)$/);
  return alias ? [alias[1].trim(), alias[2].trim()] : [base];
}

async function buildPlaces() {
  const rows = await readGazetteer(SOURCES.places);
  const byKey = new Map();
  for (const r of rows) {
    const lat = Number(r.INTPTLAT);
    const lng = Number(r.INTPTLONG);
    const area = Number(r.ALAND_SQMI) || 0;
    if (!r.USPS || !r.NAME || !Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    for (const name of cleanPlaceNames(r.NAME)) {
      const key = `${name.toLowerCase()}|${r.USPS}`;
      const prev = byKey.get(key);
      // Keep the larger of same-named places in one state (e.g. a city and a CDP).
      if (!prev || area > prev[4]) byKey.set(key, [name, r.USPS, round(lat), round(lng), round(area, 1)]);
    }
  }
  return [...byKey.values()].sort((a, b) => a[0].localeCompare(b[0]) || a[1].localeCompare(b[1]));
}

// --- HRSA health centers -----------------------------------------------------
// Sites that only serve a closed population (students, residents, people in
// custody) or whose location must stay confidential (DV shelters) are skipped.
const EXCLUDED_SETTINGS = new Set([
  'School',
  'Correctional Facility',
  'Transitional Care in Carceral Setting',
  'Domestic Violence',
  'Nursing Home',
]);

async function buildHealthCenters() {
  const { buf, lastModified } = await download(SOURCES.healthCenters);
  const rows = parseCsv(buf.toString('utf8'));
  const sites = [];
  for (const r of rows) {
    if (r['Site Status Description'] !== 'Active') continue;
    if (r['Health Center Type Description'] === 'Administrative') continue;
    if (EXCLUDED_SETTINGS.has(r['Health Center Service Delivery Site Location Setting Description'])) continue;
    const lat = Number(r['Geocoding Artifact Address Primary Y Coordinate']);
    const lng = Number(r['Geocoding Artifact Address Primary X Coordinate']);
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || (lat === 0 && lng === 0)) continue;
    const locType = r['Health Center Location Type Description'];
    sites.push({
      id: r['BPHC Assigned Number'] || `${r['Health Center Number']}-${sites.length}`,
      name: r['Site Name'],
      org: r['Health Center Name'],
      street: r['Site Address'],
      city: r['Site City'],
      state: r['Site State Abbreviation'],
      zip: (r['Site Postal Code'] || '').slice(0, 5),
      phone: r['Site Telephone Number'] || null,
      website: normalizeWebsite(r['Site Web Address']),
      hours: Number(r['Operating Hours per Week']) || null,
      mobile: locType === 'Mobile Van',
      seasonal: locType === 'Seasonal' || r['Health Center Operating Calendar'] === 'Seasonal',
      lookAlike: /look-?alike/i.test(r['Health Center Type']),
      lat: round(lat, 5),
      lng: round(lng, 5),
    });
  }
  return { sites, lastModified };
}

async function main() {
  await mkdir(DATA_DIR, { recursive: true });
  const write = (name, value) => writeFile(path.join(DATA_DIR, name), JSON.stringify(value));

  console.log('Fetching SAMHSA service taxonomy…');
  const serviceCodes = await buildServiceCodes();
  await write('service-codes.json', serviceCodes);

  console.log('Fetching Census ZIP centroids…');
  const zcta = await buildZcta();
  await write('zcta.json', zcta);

  console.log('Fetching Census places…');
  const places = await buildPlaces();
  await write('places.json', places);

  console.log('Fetching HRSA health center sites…');
  const hc = await buildHealthCenters();
  await write('health-centers.json', hc.sites);

  const meta = {
    builtAt: new Date().toISOString(),
    sources: {
      serviceCodes: { url: SOURCES.serviceCodes, categories: serviceCodes.categories.length },
      zcta: { url: SOURCES.zcta, count: Object.keys(zcta).length },
      places: { url: SOURCES.places, count: places.length },
      healthCenters: { url: SOURCES.healthCenters, count: hc.sites.length, lastModified: hc.lastModified },
    },
  };
  await writeFile(path.join(DATA_DIR, 'meta.json'), JSON.stringify(meta, null, 2) + '\n');
  console.log(JSON.stringify(meta, null, 2));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
