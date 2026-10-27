# Legacy prototype

These files are the first HarborPath prototype, kept for reference. They are not served or deployed by the current app.

**No compliance claim.** The prototype was designed with HIPAA and 42 CFR Part 2 concepts in mind, but it was never assessed for compliance with those or any other laws. Statements in these files such as "compliant" or "full compliance" are historical design goals, not facts, and must not be reused in marketing or user-facing text.

- `harbor_recovery_platform.html`: single-file demo covering 12 hand-entered Washington providers, a mock consent vault, and a revenue blueprint. It loads Tailwind, Chart.js, and Google Fonts from third-party CDNs.
- `db/schema.sql`: a proposed two-zone PostgreSQL schema for a future 42 CFR Part 2 consent vault.
- `ARCHITECTURE_AND_COMPLIANCE.md`: the original design write-up (historical; makes no compliance claim).

The current platform replaces the hand-entered listings with live SAMHSA and HRSA data and stores no patient information. See `../docs/ARCHITECTURE.md`.
