import { createServer } from 'node:http';
import { createApp } from './src/app.js';

const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || '0.0.0.0';

const handler = createApp({
  // Behind a load balancer, rate limiting must key on the client IP from
  // X-Forwarded-For. Vercel always sets it; elsewhere opt in with TRUST_PROXY=1.
  // TRUST_PROXY is the number of proxies that append to X-Forwarded-For.
  trustProxy: Number.parseInt(process.env.TRUST_PROXY, 10) > 0
    ? Number.parseInt(process.env.TRUST_PROXY, 10)
    : Boolean(process.env.VERCEL),
});

createServer(handler).listen(port, host, () => {
  console.log(`HarborPath listening on http://localhost:${port}`);
});
