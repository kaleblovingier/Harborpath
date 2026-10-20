# HarborPath Architecture, Clinical Standards & 42 CFR Part 2 Compliance Blueprint

## 1. Executive Overview
HarborPath is a privacy-first addiction treatment and outpatient counseling discovery platform grounded in:
- **Clinical Placement**: [The ASAM Criteria 4th Edition](https://www.asam.org/asam-criteria/asam-criteria-4th-edition) (`Level 1.0` Outpatient Counseling through `Level 3.7/4.0` Medically Managed Withdrawal Management) and FDA-approved Medications for Opioid & Alcohol Use Disorders ([Buprenorphine](https://www.samhsa.gov/substance-use/treatment/options/buprenorphine), [Methadone](https://www.samhsa.gov/substance-use/treatment/options), [Naltrexone](https://www.samhsa.gov/substance-use/treatment/options/naltrexone)).
- **Federal & Nonprofit Quality Alignment**: [SAMHSA FindTreatment.gov](https://findtreatment.gov/), [Shatterproof Treatment Atlas](https://treatmentatlas.org/about-data), [NIAAA Alcohol Treatment Navigator](https://alcoholtreatment.niaaa.nih.gov/FAQs-searching-alcohol-treatment), and [NIDA Words Matter](https://nida.nih.gov/research-topics/addiction-science/words-matter-preferred-language-talking-about-addiction).
- **Strict Confidentiality & Anti-Brokering**: Full compliance with the [HHS 42 CFR Part 2 Final Rule (89 FR 12472)](https://www.federalregister.gov/documents/2024/02/16/2024-02544/confidentiality-of-substance-use-disorder-sud-patient-records) (mandatory compliance date February 16, 2026), [HIPAA Privacy & Security Rules](https://www.hhs.gov/hipaa/for-professionals/security/laws-regulations/index.html), the [HHS OCR Online Tracking Bulletin](https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/hipaa-online-tracking/index.html), the [FTC Health Breach Notification Rule (89 FR 47028)](https://www.federalregister.gov/documents/2024/05/30/2024-10855/health-breach-notification-rule), the [Eliminating Kickbacks in Recovery Act (EKRA, 18 U.S.C. § 220)](https://nccriminallaw.sog.unc.edu/2024/10/07/what-is-patient-brokering/), [NAATP Code of Ethics Section V](https://www.naatp.org/code-ethics), and [LegitScript Addiction Treatment Certification Standards](https://www.legitscript.com/addiction-treatment-certification-standards).

## 2. Two-Zone Privacy Architecture
1. **Anonymous Zero-Knowledge Discovery Zone (Client Browser RAM)**:
   - Evaluates the 6 dimensions of the ASAM 4th Edition assessment locally in browser memory.
   - Zero third-party tracking pixels, cookies, or ad networks.
   - Includes a `<50ms` **Quick-Exit (`Esc×2`)** panic handler and **Cloak Screen** disguise mode.
2. **Isolated HIPAA / 42 CFR Part 2 Vault Zone (`part2_vault`)**:
   - Activated only when a patient explicitly signs a granular `42 CFR § 2.31` Consent Artifact.
   - Supports both **Named Provider Specific Consent** and the 2024/2026 Final Rule **Single TPO Consent**, while keeping **SUD Counseling Notes** isolated behind a separate consent toggle and attaching the statutory `42 CFR § 2.32 Notice Prohibiting Redisclosure`.
