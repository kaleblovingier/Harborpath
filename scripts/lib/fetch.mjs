import { readZipEntries } from './unzip.mjs';

export async function download(url, { headers } = {}) {
  const res = await fetch(url, { headers: { 'User-Agent': 'HarborPath data builder', ...headers } });
  if (!res.ok) throw new Error(`GET ${url} -> HTTP ${res.status}`);
  return { buf: Buffer.from(await res.arrayBuffer()), lastModified: res.headers.get('last-modified') };
}

export const round = (n, d = 4) => Math.round(n * 10 ** d) / 10 ** d;

export function parsePipeTable(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  const header = lines[0].split('|').map((h) => h.trim());
  return lines.slice(1).map((l) => {
    const cells = l.split('|');
    return Object.fromEntries(header.map((h, i) => [h, (cells[i] ?? '').trim()]));
  });
}

/** Download a single-file Census Gazetteer zip and parse its pipe-delimited table. */
export async function readGazetteer(url) {
  const { buf } = await download(url);
  const [entry] = readZipEntries(buf);
  return parsePipeTable(entry.read().toString('utf8'));
}
