#!/usr/bin/env node
// Production build readiness and static verification pipeline for HarborPath.
// Validates dataset integrity against data/meta.json, offline service worker
// APP_SHELL coverage and gzipped bundle weights, server/client ES module syntax,
// and strict CSP / DOM security invariants (zero innerHTML, zero inline style=,
// and vercel.json header parity with SECURITY_HEADERS).

import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { gzipSync } from 'node:zlib';
import { decodeTable, isTable } from '../src/columns.js';
import { SECURITY_HEADERS } from '../src/app.js';
import { SOURCES } from './sources/index.mjs';

// Install-time (critical tier) offline budget. Emergency content must stay
// within it; heavier elective tools belong in ELECTIVE_SHELL instead.
export const CRITICAL_GZIP_BUDGET = 350 * 1024;

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const SRC_DIR = path.join(ROOT_DIR, 'src');

const SW_PATH = path.join(PUBLIC_DIR, 'sw.js');
const BUILD_RE = /const BUILD = '([^']*)';/;

/** URLs listed in `const <name> = [ ... ];` inside the service worker source. */
export function shellList(swText, name) {
  const match = swText.match(new RegExp(`const ${name} = \\[([\\s\\S]*?)\\];`));
  return match ? [...match[1].matchAll(/'([^']+)'/g)].map((m) => m[1]) : null;
}

/**
 * Content hash over every offline shell file (APP_SHELL then ELECTIVE_SHELL,
 * each URL with its bytes). The worker carries it in its cache name, so any
 * change to a saved file makes browsers save a fresh, complete copy.
 */
export function computeShellHash(swText = readFileSync(SW_PATH, 'utf8')) {
  const hash = createHash('sha256');
  const seen = new Set();
  for (const urlPath of [...(shellList(swText, 'APP_SHELL') ?? []), ...(shellList(swText, 'ELECTIVE_SHELL') ?? [])]) {
    if (seen.has(urlPath)) continue;
    seen.add(urlPath);
    const full = path.join(PUBLIC_DIR, urlPath === '/' ? 'index.html' : urlPath.replace(/^\//, ''));
    hash.update(`${urlPath}\0`);
    hash.update(existsSync(full) && statSync(full).isFile() ? readFileSync(full) : Buffer.from('\0missing'));
    hash.update('\0');
  }
  return hash.digest('hex').slice(0, 12);
}

/** The BUILD value currently written in public/sw.js, or null. */
export function readSwBuild(swText = readFileSync(SW_PATH, 'utf8')) {
  return swText.match(BUILD_RE)?.[1] ?? null;
}

/** Rewrite `const BUILD = '...'` in public/sw.js to the current shell hash. */
export function stampServiceWorker() {
  const swText = readFileSync(SW_PATH, 'utf8');
  if (!BUILD_RE.test(swText)) throw new Error("public/sw.js has no `const BUILD = '...';` line");
  const build = computeShellHash(swText);
  const next = swText.replace(BUILD_RE, `const BUILD = '${build}';`);
  if (next !== swText) writeFileSync(SW_PATH, next);
  return { build, changed: next !== swText };
}

function walkFiles(dir, extFilter = null) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) {
      out.push(...walkFiles(full, extFilter));
    } else if (!extFilter || extFilter.test(name)) {
      out.push(full);
    }
  }
  return out.sort();
}

export async function runBuildCheck({ silent = false } = {}) {
  const checks = [];
  const record = (name, ok, detail) => {
    checks.push({ name, ok, detail });
  };

  // 1. Verify all required data files in data/ exist, parse as valid JSON, and match data/meta.json.
  let dataFilesCount = 0;
  const metaPath = path.join(DATA_DIR, 'meta.json');
  let meta = null;
  if (!existsSync(metaPath)) {
    record('data:meta.json', false, 'Missing data/meta.json');
  } else {
    try {
      meta = JSON.parse(readFileSync(metaPath, 'utf8'));
      dataFilesCount++;
      record('data:meta.json', Boolean(meta?.builtAt && meta?.sources), `builtAt=${meta?.builtAt ?? 'missing'}`);
    } catch (err) {
      record('data:meta.json', false, `Invalid JSON: ${err.message}`);
    }
  }

  for (const source of SOURCES) {
    const filePath = path.join(DATA_DIR, source.file);
    if (!existsSync(filePath)) {
      record(`data:${source.file}`, false, `Missing data/${source.file}`);
      continue;
    }
    try {
      const raw = readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(raw);
      const srcMeta = meta?.sources?.[source.id];
      if (!srcMeta) {
        record(`data:${source.file}`, false, `Missing meta.sources.${source.id}`);
        continue;
      }

      if (isTable(parsed)) {
        const decoded = decodeTable(parsed);
        const matchesCount = decoded.count === srcMeta.count;
        record(
          `data:${source.file}`,
          matchesCount && decoded.count > 0,
          `${decoded.count} rows (meta=${srcMeta.count})`,
        );
      } else if (source.id === 'serviceCodes') {
        const count = Array.isArray(parsed.categories) ? parsed.categories.length : -1;
        record(
          `data:${source.file}`,
          count === srcMeta.categories && count > 0,
          `${count} categories (meta=${srcMeta.categories})`,
        );
      } else if (source.id === 'zipStates') {
        const count = Object.keys(parsed).length;
        record(
          `data:${source.file}`,
          count === srcMeta.exceptions && count > 0,
          `${count} ZIP state exceptions (meta=${srcMeta.exceptions})`,
        );
      } else {
        const count = Object.keys(parsed).length;
        record(
          `data:${source.file}`,
          count === srcMeta.count && count > 0,
          `${count} entries (meta=${srcMeta.count})`,
        );
      }
      dataFilesCount++;
    } catch (err) {
      record(`data:${source.file}`, false, `Validation failed: ${err.message}`);
    }
  }

  // 2. Verify public/sw.js APP_SHELL assets exist and compute uncompressed & gzipped bundle weights.
  let assetCount = 0;
  let totalBytes = 0;
  let totalGzipBytes = 0;
  let electiveCount = 0;
  let electiveGzipBytes = 0;
  const swPath = path.join(PUBLIC_DIR, 'sw.js');
  if (!existsSync(swPath)) {
    record('app-shell:sw.js', false, 'Missing public/sw.js');
  } else {
    const swText = readFileSync(swPath, 'utf8');
    const match = swText.match(/const APP_SHELL = \[([\s\S]*?)\];/);
    if (!match) {
      record('app-shell:manifest', false, 'Could not parse APP_SHELL in public/sw.js');
    } else {
      const urls = [...match[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
      const missingAssets = [];
      const seenFiles = new Set();

      for (const urlPath of urls) {
        const rel = urlPath === '/' ? 'index.html' : urlPath.replace(/^\//, '');
        const full = path.join(PUBLIC_DIR, rel);
        if (!existsSync(full) || !statSync(full).isFile()) {
          missingAssets.push(urlPath);
          continue;
        }
        if (!seenFiles.has(full)) {
          seenFiles.add(full);
          const buf = readFileSync(full);
          totalBytes += buf.length;
          totalGzipBytes += gzipSync(buf, { level: 9 }).length;
        }
      }
      assetCount = seenFiles.size;
      const overBudget = totalGzipBytes >= CRITICAL_GZIP_BUDGET;
      record(
        'app-shell:assets',
        missingAssets.length === 0 && assetCount >= 20 && !overBudget,
        missingAssets.length > 0
          ? `Missing APP_SHELL files: ${missingAssets.join(', ')}`
          : `${assetCount} critical files (${(totalBytes / 1024).toFixed(1)} KB raw, ${(totalGzipBytes / 1024).toFixed(1)} KB gzip; budget < ${CRITICAL_GZIP_BUDGET / 1024} KB)${overBudget ? ' OVER BUDGET' : ''}`,
      );

      // Elective tier: warmed in the background after activation, so it does not
      // count against the install budget, but every listed file must exist.
      const electiveMatch = swText.match(/const ELECTIVE_SHELL = \[([\s\S]*?)\];/);
      if (electiveMatch) {
        const electiveUrls = [...electiveMatch[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
        const missingElective = [];
        for (const urlPath of electiveUrls) {
          const full = path.join(PUBLIC_DIR, urlPath.replace(/^\//, ''));
          if (!existsSync(full) || !statSync(full).isFile()) {
            missingElective.push(urlPath);
            continue;
          }
          if (seenFiles.has(full)) continue;
          electiveCount += 1;
          electiveGzipBytes += gzipSync(readFileSync(full), { level: 9 }).length;
        }
        record(
          'app-shell:elective',
          missingElective.length === 0,
          missingElective.length === 0
            ? `${electiveCount} elective files (${(electiveGzipBytes / 1024).toFixed(1)} KB gzip, warmed after activation)`
            : `Missing ELECTIVE_SHELL files: ${missingElective.join(', ')}`,
        );
      }

      // Offline cache version: must match the content of the shell files.
      const build = readSwBuild(swText);
      const expected = computeShellHash(swText);
      record(
        'app-shell:build-hash',
        build === expected,
        build === expected
          ? `sw.js BUILD ${build} matches the shell content`
          : `sw.js BUILD is ${build ?? 'missing'} but the shell content hashes to ${expected}; run \`npm run stamp:sw\``,
      );
    }
  }

  // 3. Dynamically import/validate syntax of server modules (src/*.js) and client modules (public/js/**/*.js).
  const serverModules = walkFiles(SRC_DIR, /\.js$/);
  const clientModules = walkFiles(path.join(PUBLIC_DIR, 'js'), /\.js$/);
  const moduleFailures = [];

  for (const modPath of [...serverModules, ...clientModules]) {
    try {
      await import(pathToFileURL(modPath).href);
    } catch (err) {
      const rel = path.relative(ROOT_DIR, modPath).split(path.sep).join('/');
      moduleFailures.push(`${rel}: ${err.message}`);
    }
  }
  record(
    'modules:syntax-and-imports',
    moduleFailures.length === 0,
    moduleFailures.length === 0
      ? `Validated ${serverModules.length} server modules and ${clientModules.length} client modules`
      : moduleFailures.join('; '),
  );

  // 4. Static security & quality invariants across public/ and vercel.json.
  const publicSourceFiles = walkFiles(PUBLIC_DIR, /\.(js|html|svg)$/);
  const innerHtmlViolations = [];
  const inlineStyleViolations = [];

  for (const file of publicSourceFiles) {
    const rel = path.relative(ROOT_DIR, file).split(path.sep).join('/');
    const text = readFileSync(file, 'utf8');
    if (/\.(js|html)$/.test(file) && /\b(innerHTML|outerHTML|insertAdjacentHTML)\b/.test(text)) {
      innerHtmlViolations.push(rel);
    }
    if (/\bstyle\s*=/i.test(text)) {
      inlineStyleViolations.push(rel);
    }
  }

  record(
    'security:no-innerHTML',
    innerHtmlViolations.length === 0,
    innerHtmlViolations.length === 0
      ? `0 innerHTML/outerHTML occurrences across ${publicSourceFiles.length} public files`
      : `Violations in: ${innerHtmlViolations.join(', ')}`,
  );

  record(
    'security:no-inline-style',
    inlineStyleViolations.length === 0,
    inlineStyleViolations.length === 0
      ? `0 inline style= attributes across ${publicSourceFiles.length} public files`
      : `Violations in: ${inlineStyleViolations.join(', ')}`,
  );

  const vercelPath = path.join(ROOT_DIR, 'vercel.json');
  if (!existsSync(vercelPath)) {
    record('security:vercel-headers', false, 'Missing vercel.json');
  } else {
    try {
      const vercelCfg = JSON.parse(readFileSync(vercelPath, 'utf8'));
      const rule = vercelCfg.headers?.find((r) => r.source === '/(.*)');
      const headerMap = rule ? Object.fromEntries(rule.headers.map((h) => [h.key, h.value])) : {};
      const expectedKeys = Object.keys(SECURITY_HEADERS);
      const mismatches = expectedKeys.filter((k) => headerMap[k] !== SECURITY_HEADERS[k]);
      record(
        'security:vercel-headers',
        mismatches.length === 0 && expectedKeys.length === Object.keys(headerMap).length,
        mismatches.length === 0
          ? `All ${expectedKeys.length} SECURITY_HEADERS match vercel.json`
          : `Mismatched headers: ${mismatches.join(', ')}`,
      );
    } catch (err) {
      record('security:vercel-headers', false, `Invalid vercel.json: ${err.message}`);
    }
  }

  const ok = checks.every((c) => c.ok);

  if (!silent) {
    console.log('HarborPath Production Build & Static Verification');
    console.log('=================================================');
    for (const c of checks) {
      console.log(`${c.ok ? '✔' : '✖'} [${c.name}] ${c.detail}`);
    }
    console.log('-------------------------------------------------');
    console.log(
      `Summary: ${checks.filter((c) => c.ok).length}/${checks.length} checks passed | ` +
      `Data files: ${dataFilesCount} | ` +
      `App shell: ${assetCount} assets (${(totalBytes / 1024).toFixed(1)} KB raw / ${(totalGzipBytes / 1024).toFixed(1)} KB gzip)`,
    );
  }

  return {
    ok,
    assetCount,
    totalBytes,
    totalGzipBytes,
    dataFilesCount,
    checks,
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.includes('--fix')) {
    const { build, changed } = stampServiceWorker();
    console.log(`public/sw.js BUILD ${changed ? 'updated to' : 'already'} ${build}`);
  }
  runBuildCheck({ silent: false })
    .then((res) => {
      if (!res.ok) process.exit(1);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
