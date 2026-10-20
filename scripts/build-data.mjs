#!/usr/bin/env node
// Downloads the public datasets HarborPath relies on and compacts them into
// ./data. Each dataset is a module in scripts/sources/ (see index.mjs).
//
//   npm run data:build                     rebuild everything
//   npm run data:build -- --only zcta,places   rebuild some datasets
//
// meta.json keeps one entry per dataset, so partial rebuilds preserve the rest.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { SOURCES } from './sources/index.mjs';

const DATA_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'data');

async function readMeta() {
  try {
    return JSON.parse(await readFile(path.join(DATA_DIR, 'meta.json'), 'utf8'));
  } catch {
    return { sources: {} };
  }
}

async function main(argv) {
  const onlyArg = argv.find((a) => a.startsWith('--only'));
  const only = onlyArg ? (onlyArg.includes('=') ? onlyArg.split('=')[1] : argv[argv.indexOf(onlyArg) + 1]).split(',') : null;
  const selected = only ? SOURCES.filter((s) => only.includes(s.id)) : SOURCES;
  if (only && selected.length !== only.length) {
    const known = SOURCES.map((s) => s.id).join(', ');
    throw new Error(`Unknown dataset in --only ${only.join(',')}. Known: ${known}`);
  }

  await mkdir(DATA_DIR, { recursive: true });
  const meta = await readMeta();
  meta.sources ??= {};

  for (const source of selected) {
    console.log(`Building ${source.id} -> data/${source.file}`);
    const { data, meta: sourceMeta } = await source.build();
    await writeFile(path.join(DATA_DIR, source.file), JSON.stringify(data));
    meta.sources[source.id] = { ...sourceMeta, builtAt: new Date().toISOString() };
  }

  meta.builtAt = new Date().toISOString();
  await writeFile(path.join(DATA_DIR, 'meta.json'), JSON.stringify(meta, null, 2) + '\n');
  console.log(JSON.stringify(meta, null, 2));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
