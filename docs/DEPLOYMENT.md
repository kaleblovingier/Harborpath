# Deployment & operations

## Current setup

- **Host:** Vercel. The live site is https://harborpath.vercel.app (per the README). `vercel.json` uses the Node preset and serves `server.js` as a function. Static files get the same security headers as the server, and a test keeps the two header sets identical.
- **Dependencies:** none at runtime, and no build step. `data/*.json` files are bundled through literal `new URL()` reads in `src/data.js`. A new dataset must be added there the same way, as `virtual-providers.json` was, or Vercel will not ship it.
- **CI:** GitHub Actions runs `npm test` on Node 20 and 22 for pushes to `main` and for pull requests.

## Environment variables

| Var | Default | Notes |
|---|---|---|
| `PORT` | `3000` | |
| `HOST` | `0.0.0.0` | |
| `TRUST_PROXY` | off | The number of proxies in front of the app that append to `X-Forwarded-For`: `1` for one load balancer, `2` for a CDN plus a load balancer. The rate limiter keys on the entry that many places from the right; IPv6 clients are keyed by /64. Leave it unset when nothing sits in front of the app. It is automatic on Vercel. |

There are no secrets. FindTreatment.gov, Census, HRSA, and the other sources need no keys.

## Release checklist

1. Run `npm test`. All suites must pass.
2. Optionally, run `node scripts/e2e-match.mjs /tmp/shots`. It needs Playwright with Chromium.
3. Merge to `main` through a pull request. Vercel builds a preview for the PR; run the smoke test against the preview URL.
4. Promote to production, or let the `main` deploy go out.
5. Run `node scripts/smoke.mjs https://harborpath.vercel.app`. All checks must pass, including the live `/api/treatment` call.

## Rollback

- **Vercel:** in Deployments, pick the previous production deployment and choose **Promote** (or **Instant Rollback**). This is safe because there is no database or migrated state.
- **Git:** revert the merge commit on `main` and push.
- **Registry data only:** set any problem record's `reviewStatus` back to `pending-review` and redeploy. The server stops serving it immediately.

## Monitoring

- **Logs:** the server logs only the route and the failure type. It never logs query strings, locations, or upstream bodies. Watch for `[api] /api/treatment failed` (upstream outage) and `[virtual-providers] skipped` (an invalid registry record).
- **Upstream outages** degrade gracefully. The server serves stale cache for up to an hour, then returns a 502 that includes the FindTreatment.gov link and the SAMHSA helpline.
- **Rate limiting:** the in-memory limiter runs per instance. On serverless hosts, add a platform firewall or rate-limit rule for `/api/treatment` and `/api/telehealth` (security review finding 1).
- **Error monitoring:** no third-party error tracker is used, because it would conflict with the no-third-party CSP and the privacy promises. If one is added, it must run server-side only and must scrub query strings.

## Release status

Rounds 1 and 2 were fast-forwarded to `main` on 2026-10-27 at the owner's request, after 148/148 tests, the e2e walkthrough, and the axe re-scan all passed. If Vercel is connected to the repository, the push to `main` starts the production deploy. Then run `node scripts/smoke.mjs https://harborpath.vercel.app` and confirm that all checks pass, including the live `/api/treatment` call. That call could not be tested from the development sandbox.
