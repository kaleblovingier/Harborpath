import { readFileSync } from 'node:fs';

// Each read is a literal readFileSync(new URL(..., import.meta.url)) so that
// bundlers which trace file reads (such as Vercel's) ship these files with the
// server. Don't wrap or compute these paths: tracing would stop finding them.
export function loadData() {
  return {
    serviceCodes: JSON.parse(readFileSync(new URL('../data/service-codes.json', import.meta.url), 'utf8')),
    zcta: JSON.parse(readFileSync(new URL('../data/zcta.json', import.meta.url), 'utf8')),
    places: JSON.parse(readFileSync(new URL('../data/places.json', import.meta.url), 'utf8')),
    healthCenters: JSON.parse(readFileSync(new URL('../data/health-centers.json', import.meta.url), 'utf8')),
    meta: JSON.parse(readFileSync(new URL('../data/meta.json', import.meta.url), 'utf8')),
  };
}

export const PUBLIC_DIR = new URL('../public/', import.meta.url);
