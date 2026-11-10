# Quality and maintenance controls

This repository deliberately uses native browser modules and has **zero runtime npm dependencies**.
Do not migrate it to React, shadcn/ui, or Storybook just to match another project.
The site serves sensitive addiction-treatment journeys: the security header prohibits
third-party scripts, fonts, analytics, and trackers. Do not add PostHog, Sentry browser
SDKs, full-session replay, or external RUM without a separate privacy review.

## On pull requests

- Existing CI: Node 20/22 syntax and built-in unit/integration suites, build and lint.
- Browser and performance quality: Chromium renders five routes on mobile and desktop;
  axe-core reports WCAG-tagged violations and fails on serious/critical findings.
- Lighthouse CI collects local-only audits of home, matching, and treatment. Initial
  budgets are **warnings** until a measured baseline is reviewed. Reports are stored
  as a short-lived Actions artifact, not uploaded to public Lighthouse storage.
- Security analysis: CodeQL plus an offline scan of common committed credential
  patterns; neither substitutes for provider-side secret scanning or a security audit.
- Dependabot opens update PRs for GitHub Actions. No automatic merging.

## After deployment (not triggered by this PR)

- The scheduled uptime workflow probes only the public `/api/health` endpoint.
  GitHub Actions failure alerts depend on the repository owner's notification settings.
- Browser/operator analytics remain first-party, in-memory, aggregate-only;
  do not send searches, location, answers, or health data to external telemetry.
- Set a unique `HARBORPATH_ADMIN_KEY` as a server-side secret for operator metrics.
  Without it, the admin metrics endpoint is intentionally inaccessible.
  Rotate any key exposed in source history and check deployment environment values.
- Enable GitHub secret scanning and push protection in repository security settings
  where available. Require CI/security/browser jobs before merging through branch rules.
- Review generated reports, then tighten Lighthouse thresholds and fix any
  known accessibility findings. Manual screen reader, keyboard, and mobile testing
  is required; axe cannot prove WCAG conformance.

## Review checklist

- [ ] Unit suites pass and no existing privacy protections regress
- [ ] Key routes render on desktop and mobile; critical workflows tested manually
- [ ] No sensitive query values appear in URLs, analytics, logs, or screenshots
- [ ] Check dependency update PRs and security alerts weekly
- [ ] Verify preview deployment before permitting a production release
