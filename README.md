# HarborPath — Confidential Addiction Treatment & Counseling Navigation Platform

HarborPath is a privacy-first, non-predatory discovery platform for individuals and families seeking verified addiction treatment centers and outpatient counseling.

## Quick Push to GitHub

This bundle is already initialized as a Git repository with a clean commit history on the `main` branch and includes an automated GitHub Pages deployment workflow (`.github/workflows/deploy-pages.yml`).

To push to your GitHub account after downloading and unzipping:

```bash
cd harborpath-platform
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```

Or using the GitHub CLI (`gh`):

```bash
cd harborpath-platform
gh repo create harborpath-platform --public --source=. --remote=origin --push
```

## Repository Structure

- `index.html` / `harbor_recovery_platform.html` — Self-contained interactive web application (Directory, ASAM 4th Edition Care Matcher, 42 CFR Part 2 Consent Vault, Family CRAFT Hub, and Architecture/Revenue Blueprint).
- `db/schema.sql` — Production two-zone PostgreSQL DDL separating `public_directory` from the envelope-encrypted `part2_vault`.
- `docs/ARCHITECTURE_AND_COMPLIANCE.md` — Regulatory, clinical, and privacy engineering specification with verified citations.
- `.github/workflows/deploy-pages.yml` — Automated GitHub Actions workflow to publish the app to GitHub Pages on push to `main`.
