# Legacy prototype

These files are the first HarborPath prototype, kept for reference. They are not served by the current app.

- `harbor_recovery_platform.html`: single-file demo covering 12 hand-entered Washington providers, a mock consent vault, and a revenue blueprint. It loads Tailwind, Chart.js, and Google Fonts from third-party CDNs.
- `db/schema.sql`: a proposed two-zone PostgreSQL schema for a future 42 CFR Part 2 consent vault.
- `ARCHITECTURE_AND_COMPLIANCE.md`: the original compliance write-up.

The current platform replaces the hand-entered listings with live SAMHSA and HRSA data and stores no patient information. See `../docs/ARCHITECTURE.md`.
