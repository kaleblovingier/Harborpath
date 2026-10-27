// Review tool for data/virtual-providers.json (see docs/PROVIDER_DATA.md).
//
//   node scripts/registry-review.mjs                 list records and their status
//   node scripts/registry-review.mjs show <id>       everything a reviewer must check
//   node scripts/registry-review.mjs approve <id> --by "<name>" --sources-checked [--date YYYY-MM-DD]
//   node scripts/registry-review.mjs revoke <id>     send a record back to pending review
//
// Approving does not verify anything by itself: it records that a person
// opened every cited page and confirmed every field. --sources-checked is a
// required, explicit statement of that. The result must pass the same
// validator the server uses, or nothing is written.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { validateProvider } from '../src/virtualProviders.js';

const REGISTRY = new URL('../data/virtual-providers.json', import.meta.url);
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export class ReviewError extends Error {}

const today = () => new Date().toISOString().slice(0, 10);

function find(registry, id) {
  const record = registry.providers.find((p) => p.id === id);
  if (!record) throw new ReviewError(`No record with id "${id}"`);
  return record;
}

/** A copy of the registry with one record approved, or a ReviewError. */
export function approve(registry, id, { by, date = today(), sourcesChecked = false } = {}) {
  if (!sourcesChecked) {
    throw new ReviewError('Open every cited source and confirm each field first, then pass --sources-checked');
  }
  if (typeof by !== 'string' || !by.trim()) throw new ReviewError('--by "<reviewer name>" is required');
  if (!DATE_RE.test(date) || Number.isNaN(Date.parse(date))) throw new ReviewError('--date must be YYYY-MM-DD');
  if (Date.parse(date) > Date.now()) throw new ReviewError('--date cannot be in the future');
  const next = structuredClone(registry);
  const record = find(next, id);
  record.reviewStatus = 'approved';
  record.reviewedBy = by.trim();
  record.reviewedAt = date;
  // The reviewer re-read every source today, so that is when it was accessed.
  for (const s of record.sources ?? []) s.accessedAt = date;
  const errors = validateProvider(record);
  if (errors.length) throw new ReviewError(`Record is not valid, nothing written:\n  ${errors.join('\n  ')}`);
  return next;
}

/** A copy of the registry with one record sent back to pending review. */
export function revoke(registry, id) {
  const next = structuredClone(registry);
  const record = find(next, id);
  record.reviewStatus = 'pending-review';
  record.reviewedBy = null;
  record.reviewedAt = null;
  return next;
}

/** Plain-text checklist for one record. */
export function describe(record) {
  const lines = [
    `${record.name} (${record.id}): ${record.reviewStatus}${record.reviewedBy ? ` by ${record.reviewedBy} on ${record.reviewedAt}` : ''}`,
    '',
    'Open each source and confirm every field below against it:',
    ...(record.sources ?? []).map((s, i) => `  [${i}] ${s.url}  (${s.type}, read ${s.accessedAt})`),
    '',
    `  officialUrl:   ${record.officialUrl}`,
    `  enrollUrl:     ${record.enrollUrl ?? '(none)'}`,
    `  phone:         ${record.phone ?? '(none)'}`,
    `  conditions:    ${(record.conditions ?? []).join(', ') || '(none)'}`,
    `  services:      ${(record.services ?? []).join(', ') || '(none)'}`,
    `  ageMin:        ${record.ageMin ?? '(unknown)'}`,
    `  serviceStates: ${record.serviceStates ? record.serviceStates.join(', ') : '(unknown: shown as "check your state")'}`,
    `  languages:     ${(record.languages ?? []).join(', ') || '(unknown)'}`,
    '  insurance claims:',
    ...((record.insurance?.claims ?? []).map((c) => `    - ${c.payer}${c.states ? ` [${c.states.join(', ')}]` : ''}: ${c.detail ?? ''}  (source ${c.sourceIndex})`)),
    `  self-pay:      ${record.insurance?.selfPay?.available ? record.insurance.selfPay.price ?? 'available, price not published' : '(not stated)'}`,
    `  enrollment:    ${record.enrollmentProcess ?? '(none)'}`,
  ];
  if (record.unknowns?.length) lines.push('', 'Could not be confirmed:', ...record.unknowns.map((u) => `  - ${u}`));
  if (record.notes) lines.push('', `Notes and conflicts: ${record.notes}`);
  lines.push('', 'Correct or null anything a source does not say. Then approve with --sources-checked.');
  return lines.join('\n');
}

function parseArgs(argv) {
  const [command = 'list', id, ...rest] = argv;
  const flags = {};
  for (let i = 0; i < rest.length; i++) {
    if (rest[i] === '--sources-checked') flags.sourcesChecked = true;
    else if (rest[i] === '--by') flags.by = rest[++i];
    else if (rest[i] === '--date') flags.date = rest[++i];
    else throw new ReviewError(`Unknown option ${rest[i]}`);
  }
  return { command, id, flags };
}

function main() {
  const registry = JSON.parse(readFileSync(REGISTRY, 'utf8'));
  const { command, id, flags } = parseArgs(process.argv.slice(2));
  const save = (next) => writeFileSync(REGISTRY, `${JSON.stringify(next, null, 2)}\n`);
  switch (command) {
    case 'list':
      for (const p of registry.providers) console.log(`${p.reviewStatus.padEnd(15)} ${p.id.padEnd(24)} ${p.name}`);
      console.log(`\n${registry.providers.filter((p) => p.reviewStatus === 'approved').length} of ${registry.providers.length} approved. Only approved records are shown to visitors.`);
      break;
    case 'show':
      console.log(describe(find(registry, id)));
      break;
    case 'approve':
      save(approve(registry, id, flags));
      console.log(`Approved ${id}. Run npm test, then commit data/virtual-providers.json.`);
      break;
    case 'revoke':
      save(revoke(registry, id));
      console.log(`${id} is pending review again and will not be shown.`);
      break;
    default:
      throw new ReviewError(`Unknown command ${command}. Use list, show, approve, or revoke.`);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  try {
    main();
  } catch (err) {
    console.error(err instanceof ReviewError ? err.message : err);
    process.exit(1);
  }
}
