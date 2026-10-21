import { h, clear, ext, tel, icon, announce } from '../dom.js';
import { pageHeader, section, p, fine, ul, strong, tocNav, emergencyCallout } from './common.js';
import { t } from '../i18n.js';

export const MEDICATION_CATEGORIES = [
  { id: 'all', label: 'All medications' },
  { id: 'oud', label: 'Opioid Use Disorder (MOUD)' },
  { id: 'aud', label: 'Alcohol Use Disorder (MAUD)' },
  { id: 'reversal', label: 'Overdose Reversal' },
  { id: 'stimulant_nicotine', label: 'Stimulants & Nicotine' },
];

export const MEDICATIONS = [
  // ---------------------------------------------------------------- OUD (MOUD)
  {
    id: 'buprenorphine',
    category: 'oud',
    name: 'Buprenorphine',
    brands: [
      'Suboxone (buprenorphine/naloxone film or tablet)',
      'Zubsolv (buprenorphine/naloxone sublingual tablet)',
      'Subutex / generic buprenorphine mono-product',
      'Sublocade (monthly extended-release subcutaneous injection)',
      'Brixadi (weekly or monthly extended-release subcutaneous injection)',
    ],
    forms: 'Daily sublingual film/tablet (dissolved under the tongue or inside the cheek) or weekly/monthly subcutaneous depot injection given by a clinician.',
    samhsaCodes: ['BU'],
    finderHref: '#/treatment?codes=BU',
    finderLabel: 'Find buprenorphine prescribers & clinics',
    summary: 'An FDA-approved first-line medication for opioid use disorder that stops withdrawal and cravings, cuts fatal overdose risk by more than 50%, and has a built-in ceiling on breathing slowdown.',
    mechanism: 'Partial mu-opioid receptor agonist with very high receptor affinity and slow dissociation, plus kappa-opioid receptor antagonism. Because it partially activates the mu receptor with a plateau ("ceiling effect") on respiratory depression, it stabilizes brain receptor signaling without producing the dangerous breathing suppression of full agonists when taken alone.',
    howToStart: 'Traditional start waits until mild-to-moderate withdrawal begins (12–24+ hours after short-acting opioids) so buprenorphine does not displace full agonists and trigger precipitated withdrawal. For people transitioning from street fentanyl—which stores in body fat and clears slowly—a Low-Dose / Micro-Induction ("Bernese Method") cross-taper starts tiny 0.25–0.5 mg doses while gradually stopping fentanyl, avoiding a painful waiting period.',
    access: 'Any healthcare prescriber with a standard DEA Schedule III registration (primary care doctors, nurse practitioners, physician assistants, psychiatrists, emergency departments, and telehealth clinics) can prescribe buprenorphine. The federal X-waiver requirement was permanently eliminated.',
    clinicalPearls: [
      'Let sublingual films or tablets dissolve completely (usually 5–10 minutes); swallowing buprenorphine drastically lowers absorption due to first-pass liver metabolism.',
      'To protect tooth enamel from acidic sublingual formulations, swish gently with water after the dose has completely dissolved and wait at least 60 minutes before brushing teeth.',
      'Naloxone in combination products (Suboxone, Zubsolv) is poorly absorbed under the tongue and is included only to deter injection or intranasal misuse; both mono-product and combo buprenorphine are safe and effective during pregnancy and breastfeeding.',
      'Extended-release depot injections (Sublocade, Brixadi) maintain steady blood levels for a week or a month—eliminating daily dosing burdens and protecting against fentanyl overdose if a slip occurs.',
    ],
    sources: [
      ['SAMHSA Buprenorphine Guide', 'https://www.samhsa.gov/substance-use/treatment/options/buprenorphine'],
      ['ASAM National Practice Guideline', 'https://www.asam.org/quality-care/clinical-guidelines/national-practice-guideline'],
    ],
  },
  {
    id: 'methadone',
    category: 'oud',
    name: 'Methadone',
    brands: [
      'Methadose (oral liquid concentrate / dispersible tablet)',
      'Dolophine (oral tablet)',
    ],
    forms: 'Daily oral liquid, dissolvable diskette, or tablet dispensed through a certified Opioid Treatment Program (OTP).',
    samhsaCodes: ['OTP', 'MU'],
    finderHref: '#/treatment?codes=OTP',
    finderLabel: 'Find methadone clinics (OTPs)',
    summary: 'A full mu-opioid agonist with decades of gold-standard evidence. Because it has no ceiling effect and never triggers precipitated withdrawal when starting, it is often the most effective option for people with high tolerance from potent synthetic opioids like fentanyl.',
    mechanism: 'Full mu-opioid receptor agonist with additional NMDA glutamate receptor antagonism (which helps blunt opioid tolerance and hyperalgesia). Its long, steady elimination half-life (24–36+ hours once stabilized) prevents the rapid peaks and crashes of short-acting opioids.',
    howToStart: 'Can be started on Day 1 without waiting for severe withdrawal and without any risk of precipitated withdrawal. Because methadone builds up slowly in tissues over 5–7 days ("start low, go slow"), initial doses (typically 20–40 mg on Day 1) are titrated gradually to a personalized dose that fully relieves cravings and blocks illicit fentanyl.',
    access: 'For opioid use disorder, methadone is dispensed through federally certified Opioid Treatment Programs (OTPs) or initiated in hospital/emergency settings for up to 72 hours while linking to an OTP. Under the 2024 SAMHSA 42 CFR Part 8 Final Rule, OTPs can initiate methadone via audio-visual telehealth, waive the old 1-year addiction history rule, and provide accelerated take-home doses (up to 7 days in the first 14 days, 14 days by day 15, and 28 days by day 31 based on clinical stability).',
    clinicalPearls: [
      'Because methadone accumulates over 5–10 days before reaching steady state, never take extra unprescribed opioids or sedatives during the first two weeks of dose adjustments.',
      'Methadone is metabolized primarily by liver enzymes CYP2B6, CYP3A4, and CYP2C19; starting or stopping certain HIV medications, seizure meds (carbamazepine, phenytoin), rifampin, or antifungals/macrolide antibiotics may require a dose adjustment.',
      'High doses or combinations with other QTc-prolonging medications (such as certain antipsychotics, citalopram/escitalopram, ondansetron, or fluoroquinolones) warrant periodic baseline and follow-up ECG heart rhythm checks.',
      'During pregnancy or in fast metabolizers, splitting the daily methadone dose into twice-daily dosing keeps levels steady and prevents evening withdrawal.',
    ],
    sources: [
      ['SAMHSA Methadone Guide', 'https://www.samhsa.gov/substance-use/treatment/options/methadone'],
      ['SAMHSA 42 CFR Part 8 Final Rule (2024)', 'https://www.samhsa.gov/medications-substance-use-disorders/statutes-regulations-guidelines/42-cfr-part-8'],
    ],
  },
  {
    id: 'xr-naltrexone',
    category: 'oud',
    name: 'Extended-Release Naltrexone (for OUD)',
    brands: [
      'Vivitrol (380 mg monthly intramuscular injection)',
    ],
    forms: 'Once-monthly (every 4 weeks) deep intramuscular gluteal injection administered by a healthcare professional.',
    samhsaCodes: ['NU'],
    finderHref: '#/treatment?codes=NU',
    finderLabel: 'Find extended-release naltrexone providers',
    summary: 'A non-opioid, non-controlled medication that completely blocks opioid receptors for 28 days at a time. Ideal for people who have already completed withdrawal and want a monthly receptor blockade without physical dependence.',
    mechanism: 'Competitive mu-opioid receptor antagonist. It binds tightly to opioid receptors without activating them, preventing heroin, fentanyl, or prescription opioids from attaching or producing euphoria or sedation.',
    howToStart: 'Requires a complete opioid-free interval of at least 7–10 days after short-acting opioids, and 10–14+ days after fentanyl, buprenorphine, or methadone. Clinicians often perform a urine screen or a small naloxone/oral naltrexone challenge test first to guarantee that no residual opioids remain, preventing severe precipitated withdrawal.',
    access: 'Can be prescribed and administered by any licensed physician, nurse practitioner, or physician assistant in primary care, psychiatry, or outpatient addiction clinics—no special certification required.',
    clinicalPearls: [
      'Crucial safety note: Naltrexone resets your opioid tolerance back to zero. If you miss a monthly Vivitrol injection or stop treatment and return to opioid use, taking a dose you previously tolerated can cause an immediate, fatal overdose.',
      'Oral naltrexone tablets alone are generally not recommended for Opioid Use Disorder (except during supervised transition) because skipping just 1–2 daily pills drops the blockade while tolerance is low.',
      'Contraindicated in acute hepatitis or liver failure, and cannot be used alongside opioid pain medications (non-opioid or regional pain control must be used in emergencies).',
    ],
    sources: [
      ['SAMHSA Naltrexone Guide', 'https://www.samhsa.gov/substance-use/treatment/options/naltrexone'],
      ['NIDA Medications for OUD', 'https://nida.nih.gov/publications/research-reports/medications-to-treat-opioid-addiction/overview'],
    ],
  },

  // ---------------------------------------------------------------- AUD (MAUD)
  {
    id: 'naltrexone-aud',
    category: 'aud',
    name: 'Naltrexone (Oral & Monthly Injectable for AUD)',
    brands: [
      'ReVia / generic naltrexone (50 mg oral tablet)',
      'Vivitrol (380 mg monthly intramuscular injection)',
    ],
    forms: 'Once-daily 50 mg oral tablet (or targeted dosing prior to drinking) or once-monthly 380 mg intramuscular injection.',
    samhsaCodes: ['NU', 'PMAT'],
    finderHref: '#/treatment?codes=PMAT',
    finderLabel: 'Find alcohol use disorder medication providers',
    summary: 'A first-line FDA-approved medication for alcohol use disorder that blunts the brain’s endorphin reward from alcohol, significantly reducing cravings and heavy drinking days.',
    mechanism: 'Mu-opioid receptor antagonist. Alcohol triggers the release of natural endorphins in the brain’s mesolimbic reward pathway; naltrexone blocks those endorphin receptors so drinking feels less rewarding and the urge to keep drinking after one drink ("loss of control") diminishes.',
    howToStart: 'Unlike disulfiram or acamprosate, you do NOT need to stop drinking before starting naltrexone for alcohol use disorder. It can be taken daily to support complete abstinence or cut back heavy drinking, or taken 1 hour before anticipated drinking ("targeted dosing" / Sinclair Method). However, you must be completely free of all opioids for 7–14 days before starting.',
    access: 'Available by prescription from any primary care provider, telehealth doctor, psychiatrist, or addiction program.',
    clinicalPearls: [
      'Safe to take while actively drinking—naltrexone does not cause sickness if you drink alcohol.',
      'Taking the first few oral doses with food or starting at 25 mg for 2–3 days before increasing to 50 mg minimizes mild stomach upset or headache.',
      'Must be avoided in anyone taking opioid pain medications, buprenorphine, or methadone, or anyone with acute hepatitis or decompensated cirrhosis.',
    ],
    sources: [
      ['NIAAA Alcohol Treatment Navigator', 'https://alcoholtreatment.niaaa.nih.gov/'],
      ['SAMHSA TIP 49: Incorporating Alcohol Pharmacotherapies', 'https://library.samhsa.gov/'],
    ],
  },
  {
    id: 'acamprosate',
    category: 'aud',
    name: 'Acamprosate',
    brands: [
      'Campral / generic acamprosate calcium (333 mg delayed-release tablets)',
    ],
    forms: 'Delayed-release oral tablets, typically two 333 mg tablets (666 mg) taken three times daily.',
    samhsaCodes: ['PMAT'],
    finderHref: '#/treatment?codes=PMAT',
    finderLabel: 'Find AUD medication providers',
    summary: 'An FDA-approved first-line medication that calms the overactive glutamate system after stopping alcohol, easing protracted restlessness, insomnia, and anxiety to help maintain abstinence.',
    mechanism: 'Modulates NMDA glutamate receptor hyperactivity and supports GABAergic balance. Chronic alcohol use upregulates excitatory glutamate receptors; when alcohol is stopped, unopposed glutamate excess causes lingering brain hyperexcitability and cravings that acamprosate helps normalize.',
    howToStart: 'Works best when initiated as soon as acute alcohol withdrawal is complete and the person has achieved initial abstinence. Continue taking it even if a brief slip occurs.',
    access: 'Prescribed by primary care clinicians, psychiatrists, and outpatient treatment programs.',
    clinicalPearls: [
      'Excreted 100% unchanged by the kidneys with zero liver metabolism—making acamprosate the safest first-line FDA-approved AUD medication for people with alcohol-associated liver disease or hepatitis, and safe for people taking opioids.',
      'Requires kidney function check before starting: dose is reduced to one 333 mg tablet three times daily for moderate kidney impairment (CrCl 30–50 mL/min) and avoided in severe kidney disease (CrCl <= 30 mL/min).',
      'Pairing three-times-daily dosing with meals or setting phone alarms helps maintain steady blood levels.',
    ],
    sources: [
      ['NIAAA Healthcare Professional Core Resource', 'https://www.niaaa.nih.gov/health-professionals-communities/core-resource-on-alcohol'],
      ['APA Practice Guideline for AUD Pharmacotherapy', 'https://www.psychiatry.org/psychiatrists/practice/clinical-practice-guidelines'],
    ],
  },
  {
    id: 'disulfiram',
    category: 'aud',
    name: 'Disulfiram',
    brands: [
      'Antabuse / generic disulfiram (250 mg and 500 mg oral tablets)',
    ],
    forms: 'Once-daily oral tablet (typically 250 mg daily).',
    samhsaCodes: ['PMAT'],
    finderHref: '#/treatment?codes=PMAT',
    finderLabel: 'Find AUD medication providers',
    summary: 'An FDA-approved deterrent medication that blocks the breakdown of alcohol, causing an immediate, intensely unpleasant physical reaction if any alcohol is consumed.',
    mechanism: 'Irreversible inhibitor of aldehyde dehydrogenase (ALDH). If alcohol is consumed, toxic acetaldehyde rapidly accumulates in the bloodstream within 10–30 minutes, causing facial flushing, throbbing headache, nausea, vomiting, chest tightness, rapid heart rate, and blood pressure drops.',
    howToStart: 'Requires strict abstinence from alcohol for at least 12–48 hours (and a zero blood alcohol level) before the first dose. Works best for individuals committed to complete abstinence, especially when taken with supportive supervision (such as a partner, pharmacist, or clinic nurse) or before high-risk events.',
    access: 'Available by prescription from primary care providers, psychiatrists, and addiction specialists.',
    clinicalPearls: [
      'Because disulfiram permanently disables the ALDH enzyme until your body synthesizes new enzyme, the alcohol reaction can still happen for up to 14 days after your last pill.',
      'Avoid all hidden alcohol sources: alcohol-based mouthwashes, liquid cold/cough syrups (elixirs), cooking wine, vinegars, kombucha, aftershaves, and certain sauces.',
      'Contraindicated in severe coronary artery disease, psychosis, or decompensated liver cirrhosis; requires baseline and periodic liver function blood tests.',
    ],
    sources: [
      ['NIAAA Medications for AUD', 'https://www.niaaa.nih.gov/publications/brochures-and-fact-sheets/treatment-alcohol-problems-finding-and-getting-help'],
    ],
  },
  {
    id: 'off-label-aud',
    category: 'aud',
    name: 'Evidence-Based Off-Label AUD Pharmacotherapy (Topiramate, Gabapentin, Baclofen)',
    brands: [
      'Topiramate (Topamax)',
      'Gabapentin (Neurontin)',
      'Baclofen (Lioresal / generic)',
    ],
    forms: 'Oral capsules or tablets prescribed individually based on symptoms, liver/kidney health, and goals.',
    samhsaCodes: ['PMAT'],
    finderHref: '#/treatment?codes=PMAT',
    finderLabel: 'Find AUD medication prescribers',
    summary: 'Guideline-supported medications (recommended by the American Psychiatric Association and VA/DoD guidelines) used when first-line FDA-approved options are not tolerated, or to target protracted insomnia, anxiety, or advanced liver disease.',
    mechanism: 'Topiramate enhances GABA activity and antagonizes AMPA/kainate glutamate receptors to reduce dopamine release from alcohol. Gabapentin modulates voltage-gated calcium channels (alpha-2-delta subunit) in the amygdala, calming stress-induced cravings and sleep disruption. Baclofen is a GABA-B receptor agonist that suppresses alcohol cravings.',
    howToStart: 'Can be initiated in primary care or specialty clinics. Topiramate is titrated slowly over several weeks (up to 150–300 mg/day) and can be started while still drinking. Gabapentin (typically 900–1800 mg/day divided) is particularly effective for people with alcohol withdrawal-related insomnia and anxiety.',
    access: 'Widely available generics at any pharmacy with a prescription from a primary care clinician or psychiatrist.',
    clinicalPearls: [
      'Topiramate has strong randomized trial evidence for reducing heavy drinking days and promoting abstinence, and may also reduce cigarette smoking; titrate slowly to avoid word-finding difficulty or tingling in fingers/toes.',
      'Gabapentin relieves protracted withdrawal insomnia and anxiety without hepatic metabolism, but use caution and medical supervision if you also take opioids due to additive respiratory depression risk.',
      'Baclofen is primarily excreted by the kidneys and has randomized trial support specifically in patients with advanced alcohol-associated liver cirrhosis where naltrexone and disulfiram are unsafe.',
    ],
    sources: [
      ['VA/DoD Substance Use Disorder Clinical Practice Guideline', 'https://www.healthquality.va.gov/guidelines/MH/sud/'],
      ['APA Practice Guideline for Alcohol Use Disorder', 'https://www.psychiatry.org/psychiatrists/practice/clinical-practice-guidelines'],
    ],
  },

  // ---------------------------------------------------------------- Overdose Reversal
  {
    id: 'naloxone-nalmefene',
    category: 'reversal',
    name: 'Naloxone & Nalmefene (Opioid Overdose Reversal)',
    brands: [
      'Narcan / RiVive / generic naloxone (3 mg or 4 mg intranasal spray — OTC)',
      'Kloxxado (8 mg intranasal naloxone spray)',
      'Injectable IM Naloxone (0.4 mg/mL single-dose vials + intramuscular syringes)',
      'Zimhi (5 mg/0.5 mL high-dose IM naloxone auto-injector)',
      'Opvee (2.7 mg intranasal nalmefene spray — prescription)',
    ],
    forms: 'Ready-to-use single-step nasal spray or intramuscular (IM) vial/syringe injected into the outer thigh or upper arm.',
    samhsaCodes: ['NOE'],
    finderHref: '#/treatment?codes=NOE',
    finderLabel: 'Find free naloxone & overdose education',
    summary: 'Life-saving competitive mu-opioid receptor antagonists that rapidly displace fentanyl, heroin, and oxycodone from receptors to restore breathing within 2–3 minutes.',
    mechanism: 'Competitive mu-opioid receptor antagonists with higher receptor affinity than full agonists. Standard naloxone acts in 2–3 minutes and lasts 30–90 minutes. Nalmefene (Opvee) is a structural analog with a much longer elimination half-life of 5–11 hours.',
    howToStart: 'Administer immediately if someone is unresponsive with slow, shallow, snoring/gurgling, or stopped breathing. Give 1 spray (or 1 IM dose), support breathing with rescue breaths (1 breath every 5 seconds), and wait a full 2–3 minutes before giving a second dose.',
    access: '4 mg and 3 mg naloxone nasal sprays (Narcan, RiVive, generics) are available Over-The-Counter (OTC) without a prescription at pharmacies, grocery stores, and online, and are distributed for free by harm reduction programs, health departments, and mail-based programs like NEXT Distro.',
    clinicalPearls: [
      'Why clinical toxicologists & harm reduction specialists prefer standard 4 mg naloxone + rescue breathing: The clinical goal of overdose reversal is restoring adequate spontaneous breathing—not waking someone up into agonizing withdrawal. High-dose 8 mg naloxone or ultra-long-acting nalmefene (5–11 hr half-life) carries a significantly higher risk of severe, prolonged precipitated withdrawal (vomiting/aspiration, catecholamine surge, flash pulmonary edema, extreme agitation, and dangerous attempts to use huge amounts of fentanyl to overcome the blockade).',
      'Injectable intramuscular (IM) naloxone (0.4 mg–0.8 mg) offered by syringe services programs allows gentler, titratable reversal that restores breathing with minimal withdrawal.',
      'Xylazine ("tranq") and medetomidine are alpha-2 adrenergic sedatives—NOT opioids. Naloxone reverses the fentanyl component so breathing restarts, but the person may remain deeply sedated from xylazine. Once they are breathing steadily on their own, stop giving extra naloxone, roll them into the recovery position, and continue monitoring airway and breathing.',
    ],
    sources: [
      ['ACMT & AACT Position Statement on Nalmefene vs Naloxone', 'https://www.acmt.net/'],
      ['SAMHSA Overdose Prevention and Response Toolkit', 'https://library.samhsa.gov/product/overdose-prevention-response-toolkit/pep23-03-00-001'],
      ['CDC Clinical Guidance on Xylazine', 'https://www.cdc.gov/overdose-prevention/about/what-you-should-know-about-xylazine.html'],
    ],
  },

  // ---------------------------------------------------------------- Stimulant & Nicotine
  {
    id: 'stimulant-care',
    category: 'stimulant_nicotine',
    name: 'Stimulant Use Disorder Care (Contingency Management & Pharmacotherapy)',
    brands: [
      'Contingency Management (CMI) + CBT / Community Reinforcement',
      'Extended-Release Bupropion + Injectable Naltrexone (ADAPT-2 protocol for methamphetamine)',
      'Mirtazapine (Remeron — off-label for methamphetamine)',
      'Topiramate / Bupropion (off-label for cocaine)',
    ],
    forms: 'Structured incentive-based behavioral therapy combined with targeted off-label oral/injectable medications tailored by an addiction specialist.',
    samhsaCodes: ['CMI'],
    finderHref: '#/treatment?codes=CMI',
    finderLabel: 'Find programs offering contingency management',
    summary: 'While no single medication is yet FDA-approved specifically for methamphetamine or cocaine use disorder, Contingency Management (CMI) paired with evidence-based pharmacotherapy significantly increases abstinence and reduces cravings.',
    mechanism: 'Contingency Management rebuilds natural dopamine reward circuitry through immediate, tangible positive reinforcement. Pharmacologically, combining bupropion (a norepinephrine-dopamine reuptake inhibitor that eases post-stimulant dysphoria and cravings) with extended-release naltrexone (which modulates opioid-mediated reward pathways) produced significant reductions in methamphetamine use in the landmark NEJM ADAPT-2 trial.',
    howToStart: 'Can be started immediately—even during active stimulant use or early "crash" recovery (fatigue, depression, hypersomnia). Ask for clinicians familiar with the 2023 ASAM/AAAP Clinical Practice Guideline on Stimulant Use Disorders.',
    access: 'Contingency management is increasingly covered by state Medicaid waivers, VA medical centers, and SAMHSA-listed outpatient programs (`CMI`). Off-label medications can be prescribed by any primary care or psychiatric prescriber.',
    clinicalPearls: [
      'In the NEJM ADAPT-2 randomized clinical trial, combining extended-release injectable naltrexone (380 mg every 3 weeks) with high-dose extended-release bupropion (450 mg/day) multiplied treatment response rates for moderate-to-severe methamphetamine use disorder compared to placebo.',
      'Mirtazapine (15–30 mg at bedtime) has multiple randomized trials showing reduced methamphetamine use and improved sleep/anxiety.',
      'Always carry naloxone and fentanyl test strips even if you only use cocaine, crack, or methamphetamine—cross-contamination in the stimulant supply is a leading cause of unexpected opioid overdose in people with zero opioid tolerance.',
    ],
    sources: [
      ['ASAM/AAAP Clinical Practice Guideline on Stimulant Use Disorders', 'https://www.asam.org/quality-care/clinical-guidelines/stimulant-use-disorders'],
      ['NIDA Methamphetamine Combination Treatment (ADAPT-2)', 'https://nida.nih.gov/news-events/news-releases/2021/01/combination-treatment-methamphetamine-use-disorder-shows-promise-in-nih-study'],
    ],
  },
  {
    id: 'nicotine-tobacco',
    category: 'stimulant_nicotine',
    name: 'Nicotine & Tobacco Cessation (Combination NRT, Varenicline, Bupropion)',
    brands: [
      'Combination NRT: 24-hour Nicotine Patch + Nicotine Gum, Lozenge, Inhaler, or Nasal Spray',
      'Varenicline (Chantix / generic)',
      'Bupropion SR (Zyban / Wellbutrin SR)',
    ],
    forms: 'Over-the-counter transdermal patches, gum, and lozenges; prescription oral tablets (varenicline, bupropion) or nasal spray.',
    samhsaCodes: ['NRT', 'NSC'],
    finderHref: '#/treatment?codes=NRT',
    finderLabel: 'Find programs offering nicotine replacement',
    summary: 'Treating tobacco and vaping dependence alongside substance use recovery does NOT jeopardize sobriety—in fact, clinical trials show quitting smoking improves long-term alcohol and drug recovery rates by up to 25%.',
    mechanism: 'Varenicline is a high-affinity partial agonist at alpha-4 beta-2 nicotinic acetylcholine receptors: it provides gentle baseline dopamine release to stop nicotine withdrawal while blocking inhaled nicotine from binding. Combination NRT pairs a steady 24-hour patch ("controller") with rapid-acting gum or lozenge ("reliever") for breakthrough cravings.',
    howToStart: 'Both varenicline and Combination NRT can be started BEFORE your target quit date ("pre-loading" or "reduce-to-quit") so cravings shrink before you put down cigarettes or vapes.',
    access: 'Nicotine patches, gum, and lozenges are sold OTC at any pharmacy, and most Medicaid and ACA health plans cover both OTC NRT and varenicline at $0 copay when a doctor or pharmacist writes a prescription. Call 1-800-QUIT-NOW for free patches/lozenges by mail in most states.',
    clinicalPearls: [
      'Pharmacist pearl on Combination NRT: Using a 21 mg nicotine patch every morning PLUS 2 mg or 4 mg nicotine gum or lozenge for sudden cravings is safe and nearly doubles quit success compared to using a patch or gum alone.',
      'How to use nicotine gum ("Park and Chew"): Chew slowly until you feel a peppery tingle, then "park" the gum between your cheek and gum so nicotine absorbs through the mouth lining. Chewing continuously like regular gum swallows the nicotine, causing hiccups and heartburn instead of craving relief.',
      'The 8,000-person EAGLES trial confirmed that varenicline, bupropion, and NRT do not increase neuropsychiatric side effects in people with stable mental health or substance use conditions, and varenicline is the single most effective monotherapy.',
    ],
    sources: [
      ['CDC Smokefree.gov & Quitlines (1-800-QUIT-NOW)', 'https://smokefree.gov/'],
      ['USPHS Clinical Practice Guideline: Treating Tobacco Use', 'https://www.ahrq.gov/prevention/guidelines/tobacco/index.html'],
    ],
  },
];

export const INTERACTION_SUBSTANCES = [
  { id: 'all', label: 'All substances' },
  { id: 'opioids', label: 'Opioids (fentanyl, heroin, oxycodone)' },
  { id: 'buprenorphine', label: 'Buprenorphine (Suboxone)' },
  { id: 'methadone', label: 'Methadone' },
  { id: 'naltrexone', label: 'Naltrexone (Vivitrol)' },
  { id: 'alcohol', label: 'Alcohol' },
  { id: 'benzodiazepines', label: 'Benzodiazepines & sleep meds' },
  { id: 'xylazine', label: 'Xylazine / Medetomidine ("Tranq")' },
  { id: 'gabapentinoids', label: 'Gabapentin / Pregabalin' },
  { id: 'stimulants', label: 'Stimulants (cocaine, meth)' },
  { id: 'disulfiram', label: 'Disulfiram (Antabuse)' },
];

export const INTERACTIONS = [
  {
    id: 'opioids-benzos',
    substances: ['opioids', 'benzodiazepines', 'buprenorphine', 'methadone'],
    severity: 'high',
    title: 'Opioids + Benzodiazepines or Z-Drug Sleep Medicines (Xanax, Klonopin, Valium, Ambien)',
    summary: 'Synergistic respiratory depression: combining opioids with GABA-A sedatives dramatically multiplies the risk of fatal breathing arrest.',
    mechanism: 'Opioids suppress brainstem respiratory drive (mu receptors in the pre-Bötzinger complex) while benzodiazepines potentiate inhibitory GABA-A chloride channels, reducing upper airway muscle tone and hypoxic/hypercapnic arousal.',
    action: 'Avoid combining whenever possible, especially with street pressed pills (which frequently mix fentanyl and novel designer benzodiazepines like bromazolam). Importantly, the FDA and SAMHSA emphasize that having a benzodiazepine prescription or dependence is NOT a reason to withhold buprenorphine or methadone—stopping MOUD is far more dangerous than careful co-management.',
    source: ['FDA Boxed Warning & MOUD Guidance', 'https://www.fda.gov/drugs/drug-safety-and-availability/fda-urges-caution-about-withholding-opioid-addiction-medications-patients-taking-benzodiazepines-or'],
  },
  {
    id: 'opioids-xylazine',
    substances: ['opioids', 'xylazine'],
    severity: 'high',
    title: 'Opioids (Fentanyl) + Xylazine or Medetomidine ("Tranq")',
    summary: 'Deep, prolonged non-opioid sedation, slowed heart rate, low blood pressure, and severe skin ulcers; naloxone reverses the fentanyl but not the xylazine/medetomidine.',
    mechanism: 'Xylazine and medetomidine are central alpha-2 adrenergic agonists that inhibit norepinephrine release in the locus coeruleus, causing heavy sedation, bradycardia, hypotension, and peripheral vasoconstriction (leading to necrotic skin wounds). Medetomidine is up to 100–200x more potent at alpha-2 receptors than xylazine.',
    action: 'Always give naloxone first because fentanyl is almost always present alongside xylazine. Prioritize rescue breathing (1 breath every 5 seconds) and airway positioning. Once the person is breathing on their own, do not keep escalating naloxone just because they remain sleepy—excess naloxone will trigger severe opioid withdrawal without waking them from alpha-2 sedation.',
    source: ['CDC Xylazine & Medetomidine Clinical Guidance', 'https://www.cdc.gov/overdose-prevention/about/what-you-should-know-about-xylazine.html'],
  },
  {
    id: 'opioids-gabapentinoids',
    substances: ['opioids', 'gabapentinoids', 'methadone', 'buprenorphine'],
    severity: 'high',
    title: 'Opioids + Gabapentinoids (Gabapentin / Neurontin, Pregabalin / Lyrica)',
    summary: 'Additive central nervous system and respiratory depression, particularly at high doses, in older adults, or in people with reduced kidney function.',
    mechanism: 'Gabapentinoids bind voltage-gated calcium channels (alpha-2-delta-1) and can reverse opioid tolerance while adding to brainstem respiratory suppression. Because gabapentin and pregabalin are cleared solely by the kidneys, any drop in renal function causes rapid drug accumulation.',
    action: 'If co-prescribed for neuropathic pain or AUD, start at low doses, adjust for kidney function, avoid taking extra unprescribed doses, and keep naloxone on hand.',
    source: ['FDA Gabapentinoid Safety Communication', 'https://www.fda.gov/safety/medical-product-safety-information/neurontin-gralise-horizant-gabapentin-and-lyrica-lyrica-cr-pregabalin-drug-safety-communication'],
  },
  {
    id: 'opioids-alcohol',
    substances: ['opioids', 'alcohol', 'methadone', 'buprenorphine'],
    severity: 'high',
    title: 'Opioids + Alcohol',
    summary: 'Alcohol compounds opioid breathing suppression, impairs gag reflexes, and accelerates overdose onset.',
    mechanism: 'Ethanol enhances inhibitory GABA-A signaling and inhibits excitatory NMDA glutamate receptors in the medulla, acting synergistically with mu-opioid receptor respiratory depression.',
    action: 'Avoid drinking alcohol when using opioids or during methadone dose titration. Note that naltrexone or acamprosate can be safely added to help reduce alcohol cravings (acamprosate is compatible with buprenorphine or methadone).',
    source: ['NIAAA Alcohol-Medication Interactions', 'https://www.niaaa.nih.gov/publications/brochures-and-fact-sheets/harmful-interactions-mixing-alcohol-with-medicines'],
  },
  {
    id: 'buprenorphine-full-agonists',
    substances: ['buprenorphine', 'opioids', 'methadone'],
    severity: 'high',
    title: 'Buprenorphine + Full-Agonist Opioids (Fentanyl, Heroin, Oxycodone, Methadone)',
    summary: 'Taking a standard dose of buprenorphine while full-agonist opioids are still attached to your receptors triggers sudden, intense precipitated withdrawal.',
    mechanism: 'Buprenorphine has higher binding affinity for the mu-opioid receptor than fentanyl, heroin, or methadone, but lower intrinsic receptor activation (partial agonist). Introducing a standard 4–8 mg dose too early strips the full agonist off receptors and replaces 100% activation with ~40% activation within 30–60 minutes.',
    action: 'Wait until objective mild-to-moderate withdrawal is present before a standard buprenorphine start, OR use a clinician-guided Low-Dose / Micro-Induction ("Bernese Method") protocol starting at 0.25–0.5 mg so receptor replacement happens gradually without withdrawal. Note: If you are already stabilized on daily buprenorphine and take a full agonist, precipitated withdrawal does NOT happen because buprenorphine already occupies the receptors.',
    source: ['ASAM Buprenorphine Initiation Guidance', 'https://www.asam.org/quality-care/clinical-guidelines/national-practice-guideline'],
  },
  {
    id: 'methadone-cyp-qtc',
    substances: ['methadone'],
    severity: 'moderate',
    title: 'Methadone + CYP3A4/2B6 Enzyme Modifiers & QTc-Prolonging Medications',
    summary: 'Certain antibiotics, antifungals, seizure meds, HIV/HCV antiretrovirals, and heart-rhythm drugs can dangerously raise or lower methadone levels or prolong the heart’s QT interval.',
    mechanism: 'Methadone is cleared via hepatic CYP2B6, CYP3A4, and CYP2C19 and blocks cardiac hERG potassium channels at high concentrations. CYP inhibitors (fluconazole, voriconazole, clarithromycin, erythromycin, fluvoxamine) raise methadone levels and sedation; CYP inducers (rifampin, carbamazepine, phenytoin, St. John’s wort) rapidly drop methadone levels and cause withdrawal.',
    action: 'Always tell every prescriber and pharmacist that you take methadone (42 CFR Part 2 lets you choose who sees your OTP records, so an outside urgent care doctor may not see methadone on your chart unless you tell them). Ask your pharmacist to run a QTc and CYP interaction check whenever starting a new antibiotic, antidepressant, or antifungal.',
    source: ['SAMHSA TIP 63: Medications for OUD', 'https://library.samhsa.gov/product/tip-63-medications-opioid-use-disorder/pep21-02-01-002'],
  },
  {
    id: 'naltrexone-opioids',
    substances: ['naltrexone', 'opioids', 'buprenorphine', 'methadone'],
    severity: 'high',
    title: 'Naltrexone (Vivitrol / Oral) + Any Opioid (Fentanyl, Pain Meds, Buprenorphine, Methadone)',
    summary: 'Starting naltrexone while opioids are in your system triggers severe, prolonged precipitated withdrawal; stopping naltrexone leaves you with zero opioid tolerance.',
    mechanism: 'Naltrexone is a potent competitive mu-opioid antagonist. Unlike naloxone (which wears off in 30–90 minutes), oral naltrexone blocks receptors for 24–72 hours and injectable Vivitrol blocks receptors for 28–30 days. Trying to "override" naltrexone with large doses of fentanyl is extremely dangerous because as plasma naltrexone levels dip or fentanyl concentrations surge, fatal respiratory arrest can occur abruptly.',
    action: 'Wait 7–10 days after short-acting opioids and 10–14+ days after fentanyl, buprenorphine, or methadone before starting naltrexone. Carry a medical alert card noting you take naltrexone in case you need emergency non-opioid pain control.',
    source: ['FDA Vivitrol Safety Information', 'https://www.samhsa.gov/substance-use/treatment/options/naltrexone'],
  },
  {
    id: 'cocaine-alcohol',
    substances: ['stimulants', 'alcohol'],
    severity: 'high',
    title: 'Cocaine + Alcohol (Cocaethylene Formation)',
    summary: 'The liver combines cocaine and alcohol into a third chemical—cocaethylene—that carries an 18-to-25-fold higher risk of sudden cardiac death than cocaine alone.',
    mechanism: 'Hepatic carboxylesterases transesterify cocaine in the presence of ethanol to form cocaethylene, which blocks dopamine reuptake and cardiac sodium/potassium channels while having a plasma half-life 3 to 5 times longer than cocaine.',
    action: 'Avoid drinking alcohol when using powder or crack cocaine. Seek immediate emergency care for chest pain, pressure, palpitations, or shortness of breath.',
    source: ['NIDA Cocaine Research Report', 'https://nida.nih.gov/research-topics/cocaine'],
  },
  {
    id: 'stimulants-opioids',
    substances: ['stimulants', 'opioids'],
    severity: 'high',
    title: 'Stimulants (Methamphetamine, Cocaine) + Opioids (Fentanyl, Heroin — "Speedball" / "Goofball")',
    summary: 'Stimulants do NOT prevent an opioid overdose—they mask drowsiness temporarily, and if the stimulant wears off first, fatal respiratory arrest can strike without warning.',
    mechanism: 'Cocaine has a short duration (30–60 minutes) and methamphetamine increases sympathetic heart rate and oxygen demand while fentanyl simultaneously depresses brainstem ventilation, creating severe myocardial hypoxia and delayed respiratory collapse.',
    action: 'Never use a stimulant to try to "wake up" someone from an opioid overdose—always use naloxone and rescue breathing. Test stimulant supplies with fentanyl test strips and keep naloxone whenever stimulants are present.',
    source: ['CDC Stimulant Guide', 'https://www.cdc.gov/overdose-prevention/media/pdfs/2024/03/CDC-Stimulant-Guide.pdf'],
  },
  {
    id: 'alcohol-disulfiram',
    substances: ['alcohol', 'disulfiram'],
    severity: 'high',
    title: 'Alcohol + Disulfiram (Antabuse) or Metronidazole (Flagyl)',
    summary: 'Blocks aldehyde dehydrogenase, causing rapid toxic acetaldehyde buildup with severe flushing, vomiting, pounding heart, and dangerous blood pressure drops.',
    mechanism: 'Inhibition of hepatic aldehyde dehydrogenase (ALDH2) stops the conversion of acetaldehyde to harmless acetate, causing a 5-to-10-fold surge in serum acetaldehyde within 10–30 minutes of any ethanol exposure.',
    action: 'Avoid all alcohol (including mouthwash, liquid medications/elixirs, cooking wine, and kombucha) while taking disulfiram and for 14 days after your last dose (and for 3 days after finishing metronidazole or tinidazole antibiotics).',
    source: ['NIAAA Harmful Interactions Guide', 'https://www.niaaa.nih.gov/publications/brochures-and-fact-sheets/harmful-interactions-mixing-alcohol-with-medicines'],
  },
];

const BERNESE_EXAMPLE_SCHEDULE = [
  {
    day: 'Day 1',
    bupDose: '0.5 mg once or twice daily (e.g., quarter of a 2 mg film)',
    fullAgonist: 'Continue current full-agonist opioid / fentanyl without cutting back yet',
    why: 'Occupies <5% of mu receptors gently—too small to trigger precipitated withdrawal.',
  },
  {
    day: 'Day 2',
    bupDose: '0.5 mg twice daily (1 mg total)',
    fullAgonist: 'Continue current opioid dose',
    why: 'Gradually increases buprenorphine receptor coverage while full agonist still covers remaining receptors.',
  },
  {
    day: 'Day 3',
    bupDose: '1 mg twice daily (2 mg total)',
    fullAgonist: 'Continue or begin gentle reduction if comfortable',
    why: 'Buprenorphine steadily replaces fentanyl on receptors without a sudden drop in receptor tone.',
  },
  {
    day: 'Day 4',
    bupDose: '2 mg twice daily (4 mg total)',
    fullAgonist: 'Begin tapering full agonist as cravings lessen',
    why: 'Roughly half of mu receptors are now stabilized by buprenorphine.',
  },
  {
    day: 'Day 5',
    bupDose: '4 mg twice daily (8 mg total)',
    fullAgonist: 'Reduce or stop full agonist',
    why: 'Buprenorphine reaches a protective blocking threshold on most receptors.',
  },
  {
    day: 'Day 6',
    bupDose: '4 mg three times daily (12 mg total)',
    fullAgonist: 'Discontinue full-agonist opioid completely',
    why: 'Therapeutic stabilization achieved without having gone through acute withdrawal.',
  },
  {
    day: 'Day 7+',
    bupDose: '16 mg to 24 mg daily (or transition to Sublocade / Brixadi depot)',
    fullAgonist: 'None — full receptor protection',
    why: 'High-affinity receptor blockade protects against cravings and fatal overdose.',
  },
];

const REVERSAL_COMPARISON = [
  {
    product: 'Naloxone 4 mg Nasal Spray (Narcan, RiVive, generics — OTC)',
    onset: '2–3 minutes',
    duration: '30–90 minutes',
    guidance: 'First-line choice recommended by toxicologists and harm reduction programs. Restores breathing reliably with the lowest risk of severe precipitated withdrawal when paired with rescue breaths and a 2–3 minute wait between doses.',
  },
  {
    product: 'Injectable IM Naloxone (0.4 mg/mL vial + syringe)',
    onset: '2–3 minutes',
    duration: '30–90 minutes',
    guidance: 'Gold standard for community harm reduction programs; allows gentle 0.4 mg–0.8 mg titration to restart breathing without throwing the person into violent withdrawal.',
  },
  {
    product: 'High-Dose Naloxone 8 mg Nasal Spray (Kloxxado)',
    onset: '2–3 minutes',
    duration: '30–90 minutes',
    guidance: 'Delivers twice the dose per spray. Clinical studies found no survival benefit over 4 mg naloxone in field use, but more than double the rate of severe precipitated withdrawal, vomiting, and agitation.',
  },
  {
    product: 'Nalmefene 2.7 mg Nasal Spray (Opvee — Rx)',
    onset: '2–5 minutes',
    duration: '5–11 hours (very long half-life)',
    guidance: 'Ultra-long receptor blockade. If precipitated withdrawal occurs, agonizing symptoms and cardiovascular stress can last 6–11 hours and cannot be easily treated—leading ACMT and AACT medical toxicology societies to recommend standard naloxone first.',
  },
];

const PRESCRIBER_QUESTIONS = [
  'What are all of my medication options (buprenorphine, methadone, extended-release naltrexone, acamprosate, topiramate, or gabapentin), and which fits my health history and daily schedule best?',
  'If I have been using street fentanyl, can we use a low-dose / micro-induction ("Bernese Method") schedule or comfort medications (clonidine, Lofexidine, hydroxyzine, ondansetron, trazodone) so I don’t get sick with precipitated withdrawal?',
  'Would a weekly or monthly extended-release injection (like Sublocade, Brixadi, or Vivitrol) be covered by my insurance or Medicaid so I don’t have to worry about daily pills or films?',
  'If I start methadone at an Opioid Treatment Program (OTP), what is your clinic’s timeline for take-home doses under the 2024 SAMHSA 42 CFR Part 8 flexibilities?',
  'Could any of my current prescriptions (antidepressants, anxiety meds, HIV/Hep C meds, antibiotics, or sleep aids) interact with this medication or affect my heart rhythm (QTc) or liver/kidney function?',
  'What happens if I miss a dose, run out early, or have a return to use? Will the clinic adjust my dose rather than discharging me?',
  'Can you also prescribe over-the-counter or prescription naloxone and nicotine replacement therapy (patch + gum/lozenge) so my insurance covers them at $0 copay?',
];

export const REGIMEN_AGENTS = [
  {
    id: 'opioids_fentanyl',
    label: 'Opioids (fentanyl, heroin, oxycodone)',
    interactionTag: 'opioids',
    isDepressant: true,
    isFullOpioid: true,
  },
  {
    id: 'buprenorphine',
    label: 'Buprenorphine (Suboxone, Sublocade, Brixadi)',
    interactionTag: 'buprenorphine',
    isDepressant: true,
    isPartialAgonist: true,
  },
  {
    id: 'methadone',
    label: 'Methadone',
    interactionTag: 'methadone',
    isDepressant: true,
    isFullOpioid: true,
    isQtc: true,
  },
  {
    id: 'naltrexone',
    label: 'Naltrexone (Vivitrol / oral ReVia)',
    interactionTag: 'naltrexone',
    isAntagonist: true,
  },
  {
    id: 'alcohol',
    label: 'Alcohol',
    interactionTag: 'alcohol',
    isDepressant: true,
  },
  {
    id: 'benzos_sedatives',
    label: 'Benzodiazepines / sleep meds (Xanax, Klonopin, Ambien)',
    interactionTag: 'benzodiazepines',
    isDepressant: true,
  },
  {
    id: 'xylazine_medetomidine',
    label: 'Xylazine / Medetomidine ("Tranq")',
    interactionTag: 'xylazine',
    isDepressant: true,
  },
  {
    id: 'stimulants',
    label: 'Stimulants (cocaine, methamphetamine)',
    interactionTag: 'stimulants',
    isQtc: true,
  },
  {
    id: 'gabapentinoids',
    label: 'Gabapentinoids (gabapentin, pregabalin)',
    interactionTag: 'gabapentinoids',
    isDepressant: true,
  },
  {
    id: 'disulfiram',
    label: 'Disulfiram (Antabuse) / Metronidazole',
    interactionTag: 'disulfiram',
  },
  {
    id: 'qtc_meds',
    label: 'QTc / CYP3A4 meds (ondansetron, citalopram, fluconazole, macrolides)',
    interactionTag: 'methadone',
    isQtc: true,
  },
];

export const SPECIAL_POPULATIONS_PHARM = [
  {
    id: 'pregnancy_lactation',
    title: 'Pregnancy, Postpartum & Breastfeeding',
    summary: 'Buprenorphine and methadone are the gold-standard, ACOG- and ASAM-recommended treatments during pregnancy. Continuing medication prevents fetal withdrawal cycles, preterm birth, and postpartum overdose.',
    keyPoints: [
      'Never stop buprenorphine or methadone abruptly ("detox") during pregnancy—repeated opioid withdrawal causes placental stress and high return-to-use risk.',
      'Both mono-product buprenorphine and combination buprenorphine/naloxone (Suboxone) have strong human safety data in pregnancy; no switch is required if you are stable on combination film/tablets.',
      'Blood volume and liver enzyme activity increase in the 2nd and 3rd trimesters: methadone or buprenorphine doses often need to be increased or split into twice-daily dosing to prevent evening withdrawal.',
      'Breastfeeding is safe and strongly encouraged on buprenorphine or methadone: tiny amounts pass into breastmilk, and skin-to-skin breastfeeding reduces the severity of Neonatal Opioid Withdrawal Syndrome (NOWS) and hospital stay length.',
    ],
    samhsaCodes: ['PW', 'BU', 'OTP'],
  },
  {
    id: 'hepatic_hcv',
    title: 'Liver Disease, Cirrhosis & Hepatitis C',
    summary: 'Liver inflammation or cirrhosis changes how some medications are processed, but effective addiction and Hepatitis C treatments remain safe and available.',
    keyPoints: [
      'For Alcohol Use Disorder in significant liver disease or cirrhosis, Acamprosate (100% kidney-cleared, zero liver metabolism) and off-label Baclofen or Gabapentin are preferred over disulfiram or naltrexone.',
      'Buprenorphine and methadone are safe in compensated Hepatitis C and mild-to-moderate liver impairment; in severe decompensated cirrhosis (Child-Pugh C), buprenorphine mono-product is preferred over buprenorphine/naloxone because impaired hepatic first-pass clearance can raise systemic naloxone levels.',
      'Direct-Acting Antiviral (DAA) pills cure Hepatitis C in 8–12 weeks (>95% cure rate) and are fully compatible with buprenorphine, methadone, and active substance use—you do NOT need to be abstinent to be cured of Hep C.',
    ],
    samhsaCodes: ['HCT', 'PMAT'],
  },
  {
    id: 'renal_ckd',
    title: 'Kidney Disease (CKD) & Dialysis',
    summary: 'Unlike morphine or codeine (which build up toxic metabolites in kidney failure), buprenorphine and methadone are cleared primarily through the liver and gut, making them safe in chronic kidney disease and dialysis.',
    keyPoints: [
      'Buprenorphine (including Sublocade and Brixadi) and methadone do not require routine dose reduction in chronic kidney disease or hemodialysis, and neither is significantly removed by dialysis.',
      'Acamprosate is excreted unchanged by the kidneys: reduce the dose by 50% (333 mg three times daily) for moderate kidney impairment (CrCl 30–50 mL/min) and avoid if CrCl is 30 mL/min or lower.',
      'Gabapentin and pregabalin depend 100% on renal clearance—doses must be carefully adjusted for kidney function to prevent severe sedation, myoclonus, and respiratory depression.',
    ],
    samhsaCodes: ['BU', 'OTP', 'PMAT'],
  },
  {
    id: 'acute_pain_perioperative',
    title: 'Acute Pain, Dental Work & Surgery While Taking MOUD',
    summary: 'If you have a fracture, dental procedure, labor/delivery, or surgery, clinical guidelines (ASAM, APS, SAMHSA) are clear: continue your daily buprenorphine or methadone.',
    keyPoints: [
      'Do NOT stop buprenorphine or methadone before surgery or dental work. Stopping destabilizes recovery, creates baseline opioid debt, and makes postoperative pain harder to control.',
      'Buprenorphine’s analgesic effect lasts 6–8 hours even though craving protection lasts 24+ hours: temporarily splitting your daily buprenorphine into every-6-to-8-hour doses (e.g., 4 mg four times daily) provides strong baseline pain relief.',
      'Combine scheduled multimodal non-opioid pain control (acetaminophen, NSAIDs like ibuprofen/ketorolac, local/regional nerve blocks) with short-acting high-affinity full agonists if needed in the hospital.',
      'If you take extended-release naltrexone (Vivitrol), tell your surgical/dental team in advance: oral naltrexone is held 72 hours before planned surgery, and Vivitrol requires non-opioid multimodal analgesia or regional nerve blocks for 4 weeks after the last injection.',
    ],
    samhsaCodes: ['BU', 'OTP', 'NU'],
  },
];

export const FORMULATION_MATRIX = [
  {
    id: 'bup_sl',
    name: 'Daily Sublingual Buprenorphine/Naloxone Film or Tablet',
    brandExamples: 'Suboxone, Zubsolv, generic buprenorphine/naloxone or mono-product',
    disorder: 'oud',
    frequency: 'daily',
    route: 'Sublingual / buccal (dissolved under tongue or cheek in 5–10 minutes)',
    setting: 'home_telehealth',
    childSafetyNote: 'High pediatric ingestion risk: even one film or tablet can cause fatal respiratory depression in a toddler. Always store in child-resistant packaging inside a locked box or high cabinet, and swish with water after dissolving to protect teeth.',
    costCoverage: 'Generic tablets and films are widely covered by Medicaid, Medicare, VA, and commercial insurance (often $0–$15 copay), and discounted at HRSA 340B community health center pharmacies.',
    bestFitFor: 'People who want flexible at-home dosing, telehealth initiation, or split-dosing for concurrent chronic pain.',
    samhsaCode: 'BU',
  },
  {
    id: 'bup_depot',
    name: 'Weekly or Monthly Extended-Release Buprenorphine Injection',
    brandExamples: 'Sublocade (monthly depot), Brixadi (weekly or monthly depot)',
    disorder: 'oud',
    frequency: 'weekly_monthly',
    route: 'Subcutaneous depot injection administered by a clinician (abdomen, thigh, buttock, or upper arm)',
    setting: 'clinic_office',
    childSafetyNote: 'Zero household child or pet exposure risk—no pills or films stored at home, and cannot be lost, stolen, or forgotten.',
    costCoverage: 'Covered by most state Medicaid programs, Medicare Part B/D, VA, and commercial specialty pharmacies; manufacturer copay assistance often reduces commercial out-of-pocket cost to $0–$5.',
    bestFitFor: 'People who want steady 24/7 receptor protection without daily pill burden, people living with young children or in shared housing, or people facing frequent travel or unstable housing.',
    samhsaCode: 'BU',
  },
  {
    id: 'methadone_otp',
    name: 'Daily Liquid/Tablet Methadone via OTP (with 2024 Expanded Take-Homes)',
    brandExamples: 'Methadose oral concentrate, Dolophine tablets, dispersible diskettes',
    disorder: 'oud',
    frequency: 'daily',
    route: 'Oral liquid or dissolved tablet swallowed once daily (or split-dosed in pregnancy / rapid metabolizers)',
    setting: 'otp_only',
    childSafetyNote: 'Critical pediatric poison hazard: liquid methadone looks like juice or cough syrup and is lethal to children in tiny sips. Keep take-home bottles in a locked box out of sight and never transfer into drinking cups.',
    costCoverage: 'Bundled coverage (medication + clinical visits) is mandated under Medicare Part B, covered by Medicaid in all states, and supported by state block-grant slots at public OTPs.',
    bestFitFor: 'People with high tolerance from potent street fentanyl who need full-agonist stabilization without any risk of precipitated withdrawal upon starting. Under the 2024 SAMHSA 42 CFR Part 8 Final Rule, stable patients can earn up to 7 take-home doses in the first 14 days, 14 by day 15, and 28 by day 31.',
    samhsaCode: 'OTP',
  },
  {
    id: 'naltrexone_im',
    name: 'Monthly Extended-Release Naltrexone Injection',
    brandExamples: 'Vivitrol (380 mg microsphere intramuscular suspension)',
    disorder: 'oud',
    disorders: ['oud', 'aud'],
    frequency: 'weekly_monthly',
    route: 'Once-monthly (every 4 weeks) deep intramuscular gluteal injection by a clinician',
    setting: 'clinic_office',
    childSafetyNote: 'Zero household storage risk because it is administered in the clinic once every 28 days.',
    costCoverage: 'Covered by Medicaid, Medicare, and commercial insurers for both Opioid Use Disorder and Alcohol Use Disorder; manufacturer copay savings programs are available for commercially insured patients.',
    bestFitFor: 'For OUD: people who have already completed a full 7–14+ day opioid-free washout and prefer a non-opioid monthly receptor blockade. For AUD: people who want a once-monthly shot to curb heavy drinking and alcohol cravings without taking daily pills (no opioid-free wait needed if not taking opioids).',
    samhsaCode: 'NU',
  },
  {
    id: 'naltrexone_po',
    name: 'Daily or Targeted Oral Naltrexone Tablet',
    brandExamples: 'ReVia, generic naltrexone HCl (50 mg scored oral tablet)',
    disorder: 'aud',
    frequency: 'daily',
    route: 'Oral tablet taken once daily (50 mg) or 1 hour before anticipated drinking (targeted / Sinclair dosing)',
    setting: 'home_telehealth',
    childSafetyNote: 'Non-controlled and non-sedating, though all prescriptions should be stored in child-resistant containers out of reach.',
    costCoverage: 'Inexpensive generic oral tablet (typically $10–$30/month cash price with pharmacy discount cards, or $0–$10 copay on Medicaid/insurance).',
    bestFitFor: 'First-line choice for reducing alcohol cravings and heavy drinking days—can be started immediately via primary care or telehealth even while still drinking (as long as no opioids are in your system).',
    samhsaCode: 'PMAT',
  },
  {
    id: 'acamprosate_po',
    name: 'Three-Times-Daily Oral Acamprosate Delayed-Release Tablet',
    brandExamples: 'Campral, generic acamprosate calcium (333 mg enteric-coated tablets)',
    disorder: 'aud',
    frequency: 'daily',
    route: 'Oral delayed-release tablets (typically two 333 mg tablets taken three times daily with meals)',
    setting: 'home_telehealth',
    childSafetyNote: 'Non-sedating, non-addictive, and safe around household members when stored in standard child-resistant bottles.',
    costCoverage: 'Generic available on most Medicaid and commercial formularies; primary care and telehealth prescribers can send directly to any retail or mail-order pharmacy.',
    bestFitFor: 'Supporting alcohol abstinence after withdrawal—especially ideal for people with alcohol-associated liver disease/cirrhosis (100% kidney-cleared, zero liver metabolism) or people who also take buprenorphine, methadone, or opioid pain medications.',
    samhsaCode: 'PMAT',
  },
];

export function matchFormulationPreferences({ disorder = 'all', frequency = 'all', setting = 'all' } = {}) {
  const d = String(disorder || 'all').trim().toLowerCase();
  const f = String(frequency || 'all').trim().toLowerCase();
  const s = String(setting || 'all').trim().toLowerCase();

  return FORMULATION_MATRIX.filter((item) => {
    if (d !== 'all') {
      const matchesDisorder = item.disorder === d || (Array.isArray(item.disorders) && item.disorders.includes(d));
      if (!matchesDisorder) return false;
    }
    if (f !== 'all' && item.frequency !== f) return false;
    if (s !== 'all' && item.setting !== s) return false;
    return true;
  });
}

const SEVERITY_RANK = { none: 0, info: 1, moderate: 2, high: 3, critical: 4 };

export function evaluateRegimenSafety(selectedIds = []) {
  const validMap = new Map(REGIMEN_AGENTS.map((a) => [a.id, a]));
  const chosenIds = [...new Set(Array.from(selectedIds || []).map((id) => String(id).trim()))]
    .filter((id) => validMap.has(id));

  if (chosenIds.length < 2) {
    return {
      riskLevel: 'none',
      alerts: [],
      matchedInteractions: [],
      actionSteps: [],
    };
  }

  const has = (id) => chosenIds.includes(id);
  const chosenAgents = chosenIds.map((id) => validMap.get(id));
  const hasAnyOpioidAgonist = has('opioids_fentanyl') || has('buprenorphine') || has('methadone');
  const hasFullOpioid = has('opioids_fentanyl') || has('methadone');

  // Pairwise interaction matching
  const matchedIds = new Set();
  if (has('benzos_sedatives') && hasAnyOpioidAgonist) matchedIds.add('opioids-benzos');
  if (has('xylazine_medetomidine') && hasAnyOpioidAgonist) matchedIds.add('opioids-xylazine');
  if (has('gabapentinoids') && hasAnyOpioidAgonist) matchedIds.add('opioids-gabapentinoids');
  if (has('alcohol') && hasAnyOpioidAgonist) matchedIds.add('opioids-alcohol');
  if (has('buprenorphine') && hasFullOpioid) matchedIds.add('buprenorphine-full-agonists');
  if (has('methadone') && (has('qtc_meds') || has('stimulants'))) matchedIds.add('methadone-cyp-qtc');
  if (has('naltrexone') && hasAnyOpioidAgonist) matchedIds.add('naltrexone-opioids');
  if (has('stimulants') && has('alcohol')) matchedIds.add('cocaine-alcohol');
  if (has('stimulants') && hasAnyOpioidAgonist) matchedIds.add('stimulants-opioids');
  if (has('alcohol') && has('disulfiram')) matchedIds.add('alcohol-disulfiram');

  const matchedInteractions = INTERACTIONS.filter((ix) => matchedIds.has(ix.id));
  const alerts = [];
  const actionSteps = new Set();

  // 1. Triple+ CNS / Respiratory Depressant Synergy
  const depressants = chosenAgents.filter((a) => a.isDepressant);
  if (depressants.length >= 3) {
    alerts.push({
      id: 'triple-depressant-synergy',
      severity: 'critical',
      title: `Critical Polypharmacy Alert: ${depressants.length} CNS & Respiratory Depressants Combined`,
      detail: `Combining ${depressants.map((d) => d.label.split(' (')[0]).join(' + ')} creates compounding, non-linear suppression of brainstem breathing drive and upper airway reflexes.`,
    });
    actionSteps.add('Keep multiple 4 mg naloxone nasal sprays immediately accessible and never use alone (or call Never Use Alone at 800-484-3731).');
    actionSteps.add('If an overdose occurs, give naloxone AND perform rescue breathing (1 breath every 5 seconds)—naloxone reverses opioids, but rescue breaths are essential for alcohol, benzodiazepines, xylazine, or gabapentinoids.');
  }

  // 2. Precipitated Opioid Withdrawal Risks
  if (has('buprenorphine') && hasFullOpioid) {
    alerts.push({
      id: 'precipitated-withdrawal-buprenorphine',
      severity: 'high',
      title: 'Precipitated Opioid Withdrawal Risk (Full-Agonist Opioid + Buprenorphine)',
      detail: 'Because buprenorphine has higher mu-receptor binding affinity but partial activation, taking a standard 4–8 mg dose while fentanyl, heroin, or methadone is still attached to receptors will rapidly strip the full agonist and trigger acute precipitated withdrawal.',
    });
    actionSteps.add('To transition from fentanyl or methadone to buprenorphine without precipitated withdrawal, discuss a Low-Dose / Micro-Induction ("Bernese Method") cross-taper starting at 0.25–0.5 mg, or wait until objective withdrawal is clearly established.');
  }

  if (has('naltrexone') && hasAnyOpioidAgonist) {
    alerts.push({
      id: 'precipitated-withdrawal-naltrexone',
      severity: 'critical',
      title: 'Severe Precipitated Withdrawal & Receptor Blockade (Naltrexone + Opioid)',
      detail: 'Naltrexone is a potent competitive mu-opioid antagonist that displaces fentanyl, buprenorphine, and methadone—causing prolonged, severe precipitated withdrawal. Trying to override naltrexone blockade with high-dose opioids can cause sudden fatal overdose.',
    });
    actionSteps.add('Ensure a full 7–10 day opioid-free interval after short-acting opioids (10–14+ days after fentanyl, buprenorphine, or methadone) before starting oral naltrexone or Vivitrol.');
  }

  // 3. QTc Prolongation & Hepatic/Metabolic Alerts
  if (has('methadone') && has('qtc_meds')) {
    alerts.push({
      id: 'methadone-qtc-cyp-synergy',
      severity: 'high',
      title: 'QTc Prolongation & CYP3A4/2B6 Metabolic Interaction (Methadone + QTc/CYP Meds)',
      detail: 'Combining methadone with CYP3A4 inhibitors (e.g., fluconazole, macrolides) or QTc-prolonging drugs (e.g., ondansetron, citalopram, antipsychotics) can raise serum methadone concentrations and prolong the cardiac QT interval.',
    });
    actionSteps.add('Ask your pharmacist or prescriber to check for CYP3A4/2B6 interactions and consider a baseline/follow-up ECG and electrolyte check (potassium & magnesium).');
  } else if (chosenAgents.filter((a) => a.isQtc).length >= 2) {
    alerts.push({
      id: 'cardiac-qtc-strain',
      severity: 'moderate',
      title: 'Additive Cardiac Rhythm (QTc) & Sympathetic Strain',
      detail: 'Combining stimulants, methadone, or QTc-prolonging medications increases cardiac conduction stress and arrhythmia risk, especially during dehydration or electrolyte depletion.',
    });
    actionSteps.add('Stay hydrated, replenish electrolytes, and seek immediate medical care for palpitations, dizziness, fainting, or chest pain.');
  }

  if (has('alcohol') && has('disulfiram')) {
    alerts.push({
      id: 'disulfiram-acetaldehyde-reaction',
      severity: 'critical',
      title: 'Acute Acetaldehyde Toxicity (Disulfiram / Metronidazole + Alcohol)',
      detail: 'Disulfiram blocks aldehyde dehydrogenase, causing toxic acetaldehyde accumulation within 10–30 minutes of any alcohol intake (flushing, throbbing headache, severe vomiting, tachycardia, and hypotension).',
    });
    actionSteps.add('Strictly avoid all alcohol sources (including mouthwash, liquid medications, cooking wine, and kombucha) while taking disulfiram and for 14 days after stopping.');
  }

  if (has('naltrexone') && has('alcohol') && !hasAnyOpioidAgonist) {
    alerts.push({
      id: 'naltrexone-alcohol-therapeutic',
      severity: 'info',
      title: 'Evidence-Based AUD Combination (Naltrexone + Alcohol)',
      detail: 'Unlike disulfiram, naltrexone does NOT make you sick if you drink alcohol. It safely blocks endorphin reward signaling to reduce cravings and heavy drinking days.',
    });
    actionSteps.add('Continue taking naltrexone as prescribed (daily or 1 hour prior to drinking per your care plan) and have periodic liver enzyme checks.');
  }

  for (const ix of matchedInteractions) {
    actionSteps.add(ix.action);
  }

  let riskLevel = 'info';
  for (const a of alerts) {
    if (SEVERITY_RANK[a.severity] > SEVERITY_RANK[riskLevel]) riskLevel = a.severity;
  }
  for (const ix of matchedInteractions) {
    if (SEVERITY_RANK[ix.severity] > SEVERITY_RANK[riskLevel]) riskLevel = ix.severity;
  }

  if (actionSteps.size === 0) {
    actionSteps.add('Review your full medication list with a clinical pharmacist or prescriber to check for kidney/liver dose adjustments.');
  }

  return {
    riskLevel,
    alerts,
    matchedInteractions,
    actionSteps: [...actionSteps],
  };
}

export function filterMedications({ category = 'all', query = '' } = {}) {
  const cat = String(category || 'all').trim().toLowerCase();
  const q = String(query || '').trim().toLowerCase();
  return MEDICATIONS.filter((med) => {
    if (cat !== 'all' && med.category !== cat) return false;
    if (!q) return true;
    const haystack = [
      med.name,
      ...(med.brands || []),
      med.forms,
      med.summary,
      med.mechanism,
      med.howToStart,
      med.access,
      ...(med.clinicalPearls || []),
      ...(med.samhsaCodes || []),
    ].join(' ').toLowerCase();
    return haystack.includes(q);
  });
}

export function filterInteractions({ substance = 'all', query = '' } = {}) {
  const sub = String(substance || 'all').trim().toLowerCase();
  const q = String(query || '').trim().toLowerCase();
  return INTERACTIONS.filter((item) => {
    if (sub !== 'all' && !item.substances.includes(sub)) return false;
    if (!q) return true;
    const haystack = [
      item.id,
      item.title,
      item.summary,
      item.mechanism,
      item.action,
      ...(item.substances || []),
      item.source?.[0] || '',
    ].join(' ').toLowerCase();
    return haystack.includes(q);
  });
}

function severityBadge(severity) {
  if (severity === 'critical') {
    return h('span', { class: 'chip chip-extra' }, icon('alert'), ' ', t('meds.severity.critical', 'Critical polypharmacy risk'));
  }
  if (severity === 'high') {
    return h('span', { class: 'chip chip-extra' }, icon('alert'), ' ', t('meds.severity.high', 'High-risk interaction'));
  }
  if (severity === 'moderate') {
    return h('span', { class: 'chip chip-care' }, icon('info'), ' ', t('meds.severity.moderate', 'Monitor / dose check'));
  }
  return h('span', { class: 'chip chip-med' }, icon('info'), ' ', t('meds.severity.info', 'Clinical note'));
}

function specialPopulationCard(pop) {
  return h('article', { class: 'card facility', id: `pop-${pop.id}`, 'aria-labelledby': `pop-title-${pop.id}` },
    h('div', { class: 'facility-head' },
      h('h3', { class: 'facility-name', id: `pop-title-${pop.id}` }, pop.title),
      h('ul', { class: 'chips', 'aria-label': 'Related SAMHSA codes' },
        pop.samhsaCodes.map((c) => h('li', { class: 'chip chip-care' }, `SAMHSA: ${c}`))),
    ),
    p(pop.summary),
    ul(pop.keyPoints),
    h('div', { class: 'actions' },
      h('a', {
        class: 'btn btn-secondary btn-small',
        href: `#/treatment?codes=${pop.samhsaCodes[0]}`,
      }, icon('pin'), `Search ${pop.samhsaCodes[0]} programs`),
    ),
  );
}

function medicationCard(med) {
  return h('article', { class: 'card facility', id: `med-${med.id}`, 'aria-labelledby': `med-title-${med.id}` },
    h('div', { class: 'facility-head' },
      h('div', null,
        h('h3', { class: 'facility-name', id: `med-title-${med.id}` }, med.name),
        h('p', { class: 'subname' }, med.brands.join(' · ')),
      ),
      h('ul', { class: 'chips', 'aria-label': 'SAMHSA search codes' },
        med.samhsaCodes.map((code) => h('li', { class: 'chip chip-med' }, `SAMHSA: ${code}`))),
    ),
    p(med.summary),
    h('dl', { class: 'service-list' },
      h('dt', null, t('meds.field.forms', 'Forms & dosing')),
      h('dd', null, med.forms),
      h('dt', null, t('meds.field.mechanism', 'How it works')),
      h('dd', null, med.mechanism),
      h('dt', null, t('meds.field.start', 'Starting safely')),
      h('dd', null, med.howToStart),
      h('dt', null, t('meds.field.access', 'Where to get it')),
      h('dd', null, med.access),
    ),
    h('div', { class: 'callout callout-info' },
      h('p', { class: 'callout-title' }, icon('shield'), t('meds.field.pearls', 'Clinical pharmacist pearls')),
      ul(med.clinicalPearls),
    ),
    h('div', { class: 'actions' },
      h('a', { class: 'btn btn-primary btn-small', href: med.finderHref },
        icon('pin'), med.finderLabel),
      ...(med.sources || []).map(([label, url]) =>
        h('a', { class: 'btn btn-ghost btn-small', href: url, target: '_blank', rel: 'noopener noreferrer' },
          icon('globe'), label, h('span', { class: 'visually-hidden' }, ' (opens in a new tab)'))),
    ),
  );
}

function interactionCard(item) {
  return h('article', { class: 'card', id: `ix-${item.id}`, 'aria-labelledby': `ix-title-${item.id}` },
    h('div', { class: 'facility-head' },
      h('h3', { class: 'facility-name', id: `ix-title-${item.id}` }, item.title),
      severityBadge(item.severity),
    ),
    p(strong('What happens: '), item.summary),
    h('dl', { class: 'service-list' },
      h('dt', null, t('meds.ix.mechanism', 'Pharmacology')),
      h('dd', null, item.mechanism),
      h('dt', null, t('meds.ix.action', 'How to stay safer')),
      h('dd', null, item.action),
    ),
    item.source && fine('Source: ', ext(item.source[1], item.source[0])),
  );
}

export function medicationsView({ query } = {}) {
  const initialCategory = MEDICATION_CATEGORIES.some((c) => c.id === query?.get?.('category'))
    ? query.get('category')
    : 'all';
  const initialSubstance = INTERACTION_SUBSTANCES.some((s) => s.id === query?.get?.('substance'))
    ? query.get('substance')
    : 'all';

  let activeCategory = initialCategory;
  let activeSubstance = initialSubstance;
  let interactionSearch = '';

  const medPanel = h('div', {
    class: 'results-list',
    id: 'med-category-panel',
    role: 'tabpanel',
  });
  const medStatus = h('p', { class: 'results-status', role: 'status', 'aria-live': 'polite' });
  const catButtons = [];

  function renderMedications(shouldAnnounce = false) {
    for (const btn of catButtons) {
      const selected = btn.dataset.category === activeCategory;
      btn.setAttribute('aria-selected', String(selected));
      btn.tabIndex = selected ? 0 : -1;
    }
    medPanel.setAttribute('aria-labelledby', `med-tab-${activeCategory}`);
    const list = filterMedications({ category: activeCategory });
    const catLabel = MEDICATION_CATEGORIES.find((c) => c.id === activeCategory)?.label ?? 'All medications';
    const msg = `Showing ${list.length} medication guide${list.length === 1 ? '' : 's'} in ${catLabel}.`;
    medStatus.textContent = msg;
    if (shouldAnnounce) announce(msg);
    clear(medPanel).append(...list.map(medicationCard));
  }

  const categoryTablist = h('div', {
    class: 'tabs',
    role: 'tablist',
    'aria-label': t('meds.tabs.label', 'Medication categories'),
  }, MEDICATION_CATEGORIES.map((cat) => {
    const btn = h('button', {
      type: 'button',
      role: 'tab',
      id: `med-tab-${cat.id}`,
      class: 'tab',
      'aria-controls': 'med-category-panel',
      dataset: { category: cat.id },
      onclick: () => {
        activeCategory = cat.id;
        renderMedications(true);
      },
      onkeydown: (e) => {
        if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)) return;
        e.preventDefault();
        const idx = MEDICATION_CATEGORIES.findIndex((c) => c.id === cat.id);
        let nextIdx = idx;
        if (e.key === 'ArrowRight') nextIdx = (idx + 1) % MEDICATION_CATEGORIES.length;
        else if (e.key === 'ArrowLeft') nextIdx = (idx + MEDICATION_CATEGORIES.length - 1) % MEDICATION_CATEGORIES.length;
        else if (e.key === 'Home') nextIdx = 0;
        else if (e.key === 'End') nextIdx = MEDICATION_CATEGORIES.length - 1;
        const nextCat = MEDICATION_CATEGORIES[nextIdx];
        activeCategory = nextCat.id;
        renderMedications(true);
        catButtons.find((b) => b.dataset.category === nextCat.id)?.focus();
      },
    }, cat.label);
    catButtons.push(btn);
    return btn;
  }));

  renderMedications(false);

  // ---------------------------------------------------------------- Interaction explorer
  const ixListEl = h('div', { class: 'results-list', id: 'interactions-results' });
  const ixStatus = h('p', { class: 'results-status', role: 'status', 'aria-live': 'polite' });
  const subButtons = [];

  const ixSearchInput = h('input', {
    type: 'search',
    id: 'interaction-search',
    class: 'input',
    placeholder: t('meds.ix.searchPlaceholder', 'Search by drug, medication, or symptom (e.g., fentanyl, Xanax, QTc, tranq)…'),
    'aria-label': t('meds.ix.searchLabel', 'Search drug and medication interactions'),
    oninput: (e) => {
      interactionSearch = e.target.value ?? '';
      renderInteractions(true);
    },
  });

  function renderInteractions(shouldAnnounce = false) {
    for (const b of subButtons) {
      const on = b.dataset.substance === activeSubstance;
      b.setAttribute('aria-current', on ? 'true' : null);
      b.setAttribute('aria-pressed', String(on));
    }
    const matches = filterInteractions({ substance: activeSubstance, query: interactionSearch });
    const msg = `${matches.length} interaction${matches.length === 1 ? '' : 's'} shown.`;
    ixStatus.textContent = msg;
    if (shouldAnnounce) announce(msg);
    clear(ixListEl);
    if (!matches.length) {
      ixListEl.append(
        h('div', { class: 'empty' },
          icon('search'),
          p('No interactions matched that filter. Try clearing the search box or choosing “All substances”.'),
          h('div', { class: 'empty-actions' },
            h('button', {
              type: 'button',
              class: 'btn btn-secondary btn-small',
              onclick: () => {
                activeSubstance = 'all';
                interactionSearch = '';
                ixSearchInput.value = '';
                renderInteractions(true);
              },
            }, 'Show all interactions')),
        ),
      );
      return;
    }
    ixListEl.append(...matches.map(interactionCard));
  }

  const substanceFilterBar = h('div', {
    class: 'presets',
    role: 'group',
    'aria-label': t('meds.ix.filterGroup', 'Filter interactions by substance'),
  }, INTERACTION_SUBSTANCES.map((s) => {
    const b = h('button', {
      type: 'button',
      class: 'preset',
      dataset: { substance: s.id },
      onclick: () => {
        activeSubstance = s.id;
        renderInteractions(true);
      },
    }, s.label);
    subButtons.push(b);
    return b;
  }));

  renderInteractions(false);

  // ---------------------------------------------------------------- Multi-substance regimen safety checker
  const selectedRegimen = new Set();
  const regimenPills = [];
  const regimenOutput = h('div', {
    id: 'regimen-safety-output',
    role: 'region',
    'aria-live': 'polite',
    'aria-label': t('meds.regimen.outputLabel', 'Multi-substance combination evaluation'),
  });

  function renderRegimenChecker(shouldAnnounce = false) {
    for (const pill of regimenPills) {
      const checked = selectedRegimen.has(pill.dataset.agentId);
      pill.setAttribute('aria-pressed', String(checked));
      pill.setAttribute('aria-current', checked ? 'true' : null);
    }

    clear(regimenOutput);
    const chosenIds = [...selectedRegimen];
    if (chosenIds.length < 2) {
      regimenOutput.append(
        fine(t('meds.regimen.prompt', 'Select 2 or more substances or medications above to check for multi-drug respiratory, receptor-displacement (precipitated withdrawal), or cardiac/metabolic risks. Checked only in your browser memory.')),
      );
      return;
    }

    const result = evaluateRegimenSafety(chosenIds);
    const calloutTone = result.riskLevel === 'critical' || result.riskLevel === 'high'
      ? 'callout callout-emergency'
      : result.riskLevel === 'moderate'
        ? 'callout callout-warn'
        : 'callout callout-info';

    const summaryTitle = result.riskLevel === 'critical'
      ? 'Critical Multi-Substance Risk Detected'
      : result.riskLevel === 'high'
        ? 'High-Risk Combination Detected'
        : result.riskLevel === 'moderate'
          ? 'Moderate Interaction — Clinical Monitoring Recommended'
          : 'Combination Pharmacology Note';

    if (shouldAnnounce) {
      announce(`${summaryTitle}: ${result.alerts.length} clinical alert${result.alerts.length === 1 ? '' : 's'} and ${result.matchedInteractions.length} pairwise interaction${result.matchedInteractions.length === 1 ? '' : 's'}.`);
    }

    regimenOutput.append(
      h('div', { class: calloutTone },
        h('div', { class: 'facility-head' },
          h('p', { class: 'callout-title' },
            icon(result.riskLevel === 'info' ? 'info' : 'alert'),
            summaryTitle),
          severityBadge(result.riskLevel),
        ),
        result.alerts.length > 0 && ul(
          result.alerts.map((a) => [strong(`${a.title}: `), a.detail]),
        ),
        result.actionSteps.length > 0 && h('div', null,
          p(strong('Clinical Pharmacist Harm-Reduction Steps:')),
          ul(result.actionSteps),
        ),
        h('p', { class: 'actions' },
          h('button', {
            type: 'button',
            class: 'btn btn-ghost btn-small',
            onclick: () => {
              selectedRegimen.clear();
              renderRegimenChecker(true);
            },
          }, icon('x'), 'Clear selection'),
        ),
      ),
    );
  }

  const regimenCheckerPanel = h('div', { class: 'card', id: 'regimen-safety-checker' },
    h('h3', null, t('meds.regimen.title', 'Multi-Substance Regimen & Polypharmacy Safety Check')),
    p('Select 2 or more medications or substances below to evaluate combined sedative load, precipitated withdrawal risk, and cardiac QTc / liver enzyme interactions:'),
    h('div', {
      class: 'presets',
      role: 'group',
      'aria-label': t('meds.regimen.groupLabel', 'Select substances or medications in combination'),
    }, REGIMEN_AGENTS.map((agent) => {
      const btn = h('button', {
        type: 'button',
        class: 'preset',
        dataset: { agentId: agent.id },
        onclick: () => {
          if (selectedRegimen.has(agent.id)) selectedRegimen.delete(agent.id);
          else selectedRegimen.add(agent.id);
          renderRegimenChecker(true);
        },
      }, agent.label);
      regimenPills.push(btn);
      return btn;
    })),
    regimenOutput,
  );

  renderRegimenChecker(false);

  return h('div', { class: 'view view-medications' },
    pageHeader(
      t('meds.title', 'Medications & Pharmacology Guide'),
      t('meds.lede', 'Plain-language clinical pharmacist guidance on FDA-approved medications for opioid, alcohol, stimulant, and nicotine use disorders, low-dose fentanyl transition protocols, overdose reversal science, and drug interactions.'),
    ),
    emergencyCallout(),
    tocNav([
      ['quick-find', 'Find medication providers'],
      ['profiles', 'Medication guide'],
      ['bernese-guide', 'Fentanyl & micro-induction ("Bernese Method")'],
      ['otp-rules', 'Methadone & 2024 take-home rules'],
      ['reversal-science', 'Naloxone vs. nalmefene & xylazine'],
      ['special-populations', 'Pregnancy, liver/kidney & surgery'],
      ['interactions', 'Drug interaction explorer'],
      ['questions', 'Questions for your prescriber or pharmacist'],
    ]),

    section('quick-find', t('meds.quickFind.title', 'Find providers by medication or service'),
      p('Jump straight to state-licensed clinics and prescribers in SAMHSA’s national directory filtered for the exact medication or service you want:'),
      h('nav', { class: 'presets', 'aria-label': 'Direct medication search filters' },
        h('a', { class: 'preset', href: '#/treatment?codes=BU' }, icon('pin'), ' Buprenorphine (BU)'),
        h('a', { class: 'preset', href: '#/treatment?codes=OTP' }, icon('pin'), ' Methadone clinic / OTP (OTP)'),
        h('a', { class: 'preset', href: '#/treatment?codes=NU' }, icon('pin'), ' Naltrexone / Vivitrol (NU)'),
        h('a', { class: 'preset', href: '#/treatment?codes=PMAT' }, icon('pin'), ' Alcohol medications (PMAT)'),
        h('a', { class: 'preset', href: '#/treatment?codes=NOE' }, icon('shield'), ' Free naloxone & training (NOE)'),
        h('a', { class: 'preset', href: '#/treatment?codes=CMI' }, icon('check-circle'), ' Contingency management (CMI)'),
        h('a', { class: 'preset', href: '#/treatment?codes=NRT' }, icon('heart'), ' Nicotine replacement (NRT)'),
      ),
    ),

    section('profiles', t('meds.profiles.title', 'Evidence-based medication profiles'),
      p('Taking medication for an opioid or alcohol use disorder is NOT "trading one addiction for another." Stabilizing receptor signaling stops the cycle of withdrawal and cravings, heals brain circuitry, and lowers fatal overdose risk by more than half.'),
      categoryTablist,
      medStatus,
      medPanel,
    ),

    section('bernese-guide', t('meds.bernese.title', 'Pharmacist Guide: Transitioning from Fentanyl to Buprenorphine ("Bernese Method")'),
      p('If you or someone you love has experienced sudden, terrible withdrawal after taking Suboxone following street fentanyl use, ',
        strong('you did nothing wrong—and buprenorphine can still work for you. '),
        'Understanding how fentanyl behaves in the body explains why traditional starts fail and how low-dose micro-induction solves it.'),
      h('div', { class: 'callout callout-info' },
        h('p', { class: 'callout-title' }, icon('info'), 'Why street fentanyl is different from heroin or prescription pain pills'),
        ul([
          [strong('Fentanyl stores in body fat (lipophilicity): '), 'Heroin and oxycodone are water-soluble and clear from receptors in 12–24 hours. Illicitly manufactured fentanyl and its analogs are highly fat-soluble—with regular use, they build up in peripheral fat tissue and leach back into the bloodstream slowly over many days.'],
          [strong('Why precipitated withdrawal happens: '), 'Even if you feel sick 24–36 hours after using fentanyl, significant fentanyl still clings to your mu-opioid receptors. Taking a standard 4 mg or 8 mg dose of buprenorphine (a high-affinity partial agonist) rapidly knocks that remaining fentanyl off your receptors all at once, causing an abrupt drop in receptor signaling ("precipitated withdrawal").'],
          [strong('How Low-Dose / Micro-Induction ("Bernese Method") works: '), 'Instead of waiting days in agony, you start with tiny micro-doses of buprenorphine (0.25 mg to 0.5 mg) that gently attach to just a few percent of your receptors at a time while continuing your full-agonist opioid. Over 5–7 days, buprenorphine gradually takes over the receptors until a full protective dose (12–24 mg/day) is reached—then the full agonist is stopped with little to no withdrawal.'],
        ]),
      ),
      h('div', { class: 'table-wrap' },
        h('table', null,
          h('caption', { class: 'visually-hidden' }, 'Illustrative 7-day low-dose buprenorphine micro-induction cross-taper schedule'),
          h('thead', null,
            h('tr', null,
              h('th', { scope: 'col' }, 'Day'),
              h('th', { scope: 'col' }, 'Illustrative Buprenorphine Dose'),
              h('th', { scope: 'col' }, 'Full Agonist Approach'),
              h('th', { scope: 'col' }, 'Receptor Pharmacology'),
            ),
          ),
          h('tbody', null,
            BERNESE_EXAMPLE_SCHEDULE.map((row) => h('tr', null,
              h('th', { scope: 'row' }, row.day),
              h('td', null, row.bupDose),
              h('td', null, row.fullAgonist),
              h('td', null, row.why),
            )),
          ),
        ),
      ),
      fine('Clinical note: Every person’s tolerance and supply differ. This table is an educational example from peer-reviewed addiction medicine protocols—work with a prescriber, telehealth bridge clinic, or pharmacist to tailor your exact schedule and get non-opioid comfort medications (clonidine, lofexidine, ondansetron, hydroxyzine, trazodone).'),
    ),

    section('otp-rules', t('meds.otp.title', 'Methadone Access & the 2024 SAMHSA 42 CFR Part 8 Final Rule'),
      p('Federal updates that took effect in 2024 removed several outdated barriers to methadone care at Opioid Treatment Programs (OTPs):'),
      ul([
        [strong('Faster take-home doses: '), 'Clinics may now provide up to ', strong('7 unsupervised take-home doses '), 'during the first 14 days of treatment, up to ', strong('14 take-home doses '), 'starting on day 15, and up to ', strong('28 take-home doses '), 'starting on day 31 based on individualized clinical stability rather than rigid year-long waiting periods.'],
        [strong('Telehealth intake flexibilities: '), 'Authorized OTP practitioners can now initiate methadone or buprenorphine after an audio-visual telehealth evaluation (and audio-only for buprenorphine when video is unavailable).'],
        [strong('No 1-year history requirement: '), 'People seeking methadone no longer have to prove a full 12-month history of opioid addiction before admission.'],
        [strong('Counseling is never a barrier to medication: '), 'Refusing or missing counseling sessions cannot be used to automatically deny or terminate life-saving medication.'],
      ]),
      p(h('a', { class: 'btn btn-secondary', href: '#/treatment?codes=OTP' }, icon('pin'), 'Search certified OTP methadone clinics near me')),
    ),

    section('reversal-science', t('meds.reversal.title', 'Overdose Reversal Pharmacology: 4 mg vs. 8 mg Naloxone, Nalmefene & Xylazine'),
      p('When responding to an opioid overdose, ', strong('the medical goal is restoring normal breathing—not forcing immediate, wide-awake withdrawal. '),
        'Understanding the pharmacokinetics of reversal agents helps keep people alive and safe.'),
      h('div', { class: 'table-wrap' },
        h('table', null,
          h('caption', { class: 'visually-hidden' }, 'Comparison of opioid overdose reversal medications'),
          h('thead', null,
            h('tr', null,
              h('th', { scope: 'col' }, 'Reversal Agent'),
              h('th', { scope: 'col' }, 'Onset'),
              h('th', { scope: 'col' }, 'Duration'),
              h('th', { scope: 'col' }, 'Clinical Pharmacist & Harm Reduction Guidance'),
            ),
          ),
          h('tbody', null,
            REVERSAL_COMPARISON.map((r) => h('tr', null,
              h('th', { scope: 'row' }, r.product),
              h('td', null, r.onset),
              h('td', null, r.duration),
              h('td', null, r.guidance),
            )),
          ),
        ),
      ),
      h('div', { class: 'callout callout-warn' },
        h('p', { class: 'callout-title' }, icon('alert'), 'Xylazine ("Tranq") & Medetomidine: Breathe for them, don’t over-naloxone'),
        p('Xylazine and medetomidine are non-opioid alpha-2 adrenergic sedatives mixed into street fentanyl. ',
          strong('Always give 1 dose of naloxone first '), 'to reverse the fentanyl, and immediately provide rescue breaths (1 breath every 5 seconds). ',
          'If their chest rises and they start breathing ≥10 times a minute on their own—even if they remain deeply asleep—',
          strong('stop giving extra naloxone. '), 'Extra naloxone will not reverse xylazine sedation, and will only trigger severe opioid withdrawal. Place them in the recovery position and stay until EMS arrives.'),
      ),
    ),

    section('special-populations', t('meds.specialPopulations.title', 'Special Populations & Clinical Situations (Pregnancy, Liver/Kidney Health & Surgery)'),
      p('Clinical pharmacology guidance for common medical situations where dosing, organ clearance, or acute pain management matters:'),
      h('div', { class: 'results-list' },
        ...SPECIAL_POPULATIONS_PHARM.map(specialPopulationCard),
      ),
    ),

    section('interactions', t('meds.interactions.title', 'Interactive Drug & Medication Interaction Explorer'),
      regimenCheckerPanel,
      p('Filter by substance or search any medication, street supply adulterant, or prescription drug class to review mechanism and harm-reduction guidance:'),
      substanceFilterBar,
      h('div', { class: 'finder-search' },
        h('div', { class: 'combo' },
          icon('search'),
          ixSearchInput,
        ),
      ),
      ixStatus,
      ixListEl,
      fine('Have a question about a specific prescription combination right now? Call Poison Help at ',
        tel('18002221222', '1-800-222-1222'), ' (free, confidential, 24/7 clinical pharmacists and nurses) or ask your local pharmacist.'),
    ),

    section('questions', t('meds.questions.title', 'Questions for My Prescriber or Pharmacist'),
      p('You have the right to respectful, collaborative medical care. Bring or print these questions for your next appointment or pharmacy visit:'),
      h('ol', { class: 'checklist' },
        PRESCRIBER_QUESTIONS.map((q) => h('li', null, q)),
      ),
      p(
        h('button', {
          type: 'button',
          class: 'btn btn-secondary',
          onclick: () => window.print(),
        }, icon('printer'), t('meds.questions.print', 'Print this checklist')),
      ),
    ),
  );
}
