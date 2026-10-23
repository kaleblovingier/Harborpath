# Phase 1 Clinical Helpers

`public/js/views/populationHelpers.js` holds pure functions that return recommended SAMHSA codes and direct `#/treatment?codes=...` links. Everything runs in the browser; no answers leave the tab.

## Population presets

`ALL_POPULATION_RECOMMENDERS` returns codes, a finder link, and a one-line note for:

- Pregnancy/postpartum (ACOG-aligned; no detox `DT` code, per ACOG Committee Opinion 711)
- Adolescents / young adults
- Justice-involved / reentry
- Older adults
- Stimulant use
- Xylazine / medetomidine
- Co-occurring serious mental illness

## Care routes in the navigator

After the ASAM assessment, the Clinical Care Navigator (`#/navigator`) shows a "Care routes for your situation" block when the answers point to one of these populations:

| Route | Triggered by | Finder links (codes) |
| --- | --- | --- |
| Pregnancy & postpartum | Dimension 2 = pregnant or postpartum | `PW`; with opioids `PW,BU` and `OTP`; with severe withdrawal, or moderate alcohol/sedative withdrawal, `PW,HI` |
| Teens & young adults | Dimension 6 program = `ADOL` or `YA` | `ADOL` or `YA`, plus `+BU` (opioids), `+MHSU` (mental health), `+TELE` (telehealth) |
| Re-entry after incarceration | Dimension 6 program = `CJ` | Codes from `evaluateTransitionRisk({ event: 'post_release' })`: `CJ,BU`, `NOE`, `CJ,PEER`, plus `OTP` |
| Xylazine / medetomidine | Substance = xylazine | `BU`, `OTP`, `NOE`; plus `HI` when withdrawal is moderate or severe or an infection is reported |

Functions:

- `detectCareRoutes(answers)` lists the route ids that apply.
- `buildCareRoutes(answers, { transition })` builds each route: title, what kind of care fits, the reasons, finder links, related pages, and sources.
- `buildTreatmentHref(codes)` makes a code-only finder link (deduplicated, at most 8 codes, matching the finder and server limit).
- `getPopulationCareRoutes(answers)` in `navigator.js` checks the population against the navigator's own options and passes in the re-entry transition result.

### Privacy

Links carry only SAMHSA service codes, the same way as the finder's own presets (for example `#/treatment?codes=PW`) and the navigator's existing search link. Answers, ages, and other flags never go into the URL. `test/population-routes.test.js` checks every link across all answer combinations: each code must be a real SAMHSA substance use code and a filter the finder shows.

### Clinical sources

Each statement has a source comment next to it in the code:

- ACOG Committee Opinion 711 (2017), *Opioid Use and Opioid Use Disorder in Pregnancy*
- SAMHSA (2018), *Clinical Guidance for Treating Pregnant and Parenting Women With Opioid Use Disorder and Their Infants*
- ASAM (2020), *Clinical Practice Guideline on Alcohol Withdrawal Management*
- ASAM (2020), *National Practice Guideline for the Treatment of Opioid Use Disorder* (focused update; adolescents section)
- NIDA (2014), *Principles of Adolescent Substance Use Disorder Treatment*
- 42 CFR Part 2 § 2.14 (minor patients)
- NIDA, *Criminal Justice DrugFacts*; SAMHSA (2019), *Use of Medication-Assisted Treatment for Opioid Use Disorder in Criminal Justice Settings*
- CDC, *What You Should Know About Xylazine*
- CDC MMWR 2025;74(15), Notes from the Field on medetomidine withdrawal

The routes include no medication doses or schedules. They point to the medication guide (`#/medications`) and to clinicians instead. Pregnancy routes never suggest stopping or tapering buprenorphine or methadone. The SAMHSA helpline (1-800-662-4357) and 988 appear in every route block, along with the existing red-flag escalations.

Next: plain-language variants, and routes for older adults, stimulants, and co-occurring serious mental illness.
