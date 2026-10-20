import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createApp } from './src/app.js';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || '0.0.0.0';

const handler = createApp({
  rootDir,
  // Set TRUST_PROXY=1 behind a load balancer so rate limiting sees client IPs.
  trustProxy: process.env.TRUST_PROXY === '1',
});

createServer(handler).listen(port, host, () => {
  console.log(`HarborPath listening on http://localhost:${port}`);
});
