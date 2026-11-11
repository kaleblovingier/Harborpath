import { h, ext, tel, icon } from '../dom.js';
import { t } from '../i18n.js';
import { mutualAidFinder } from '../components/mutualAidFinder.js';
import { HOTLINES } from '../content/hotlines.js';
import { offlineControlCard } from './core.js';
import { pageHeader, section, p, fine, ul, strong, resourceList, hotlineGrid, tocNav, emergencyCallout } from './common.js';
import { choosingCareView, QUESTIONS, RED_FLAGS } from './choosingCare.js';

// Choosing care guidance includes EKRA (18 U.S.C. § 220) anti-brokering and MHPAEA parity protections (see ./choosingCare.js).
export { choosingCareView, QUESTIONS, RED_FLAGS };

// ---------------------------------------------------------------- Overdose
export { overdoseView } from './overdose.js';

// ---------------------------------------------------------------- Harm reduction
// Built at render time so the table follows the active language (hr.combo.* keys).
function combos() {
  return [
    {
      combo: t('hr.combo.benzos', 'Opioids + benzodiazepines (“benzos”, including pressed pills)'),
      why: t('hr.combo.benzosWhy', 'Both slow breathing. Together they sharply raise the risk of a fatal overdose.'),
      src: ['FDA', 'https://www.fda.gov/drugs/drug-safety-and-availability/fda-requiring-boxed-warning-updated-improve-safe-use-benzodiazepine-drug-class'],
    },
    {
      combo: t('hr.combo.alcohol', 'Opioids + alcohol'),
      why: t('hr.combo.alcoholWhy', 'Alcohol adds to the breathing slowdown caused by opioids.'),
      src: ['NIAAA', 'https://www.niaaa.nih.gov/publications/brochures-and-fact-sheets/harmful-interactions-mixing-alcohol-with-medicines'],
    },
    {
      combo: t('hr.combo.gabapentinoids', 'Opioids + gabapentin or pregabalin (Neurontin, Lyrica)'),
      why: t('hr.combo.gabapentinoidsWhy', 'This combination can cause serious, sometimes fatal breathing problems.'),
      src: ['FDA', 'https://www.fda.gov/safety/medical-product-safety-information/neurontin-gralise-horizant-gabapentin-and-lyrica-lyrica-cr-pregabalin-drug-safety-communication'],
    },
    {
      combo: t('hr.combo.tranq', 'Opioids + xylazine or medetomidine (“tranq”)'),
      why: t('hr.combo.tranqWhy', 'These sedatives deepen and lengthen sedation, and naloxone does not reverse them. Still give naloxone for the opioid.'),
      src: ['CDC', 'https://www.cdc.gov/overdose-prevention/about/what-you-should-know-about-xylazine.html'],
    },
    {
      combo: t('hr.combo.alcoholBenzos', 'Alcohol + benzodiazepines or sleep medicines'),
      why: t('hr.combo.alcoholBenzosWhy', 'Combined sedation can slow or stop breathing.'),
      src: ['NIAAA', 'https://www.niaaa.nih.gov/publications/brochures-and-fact-sheets/harmful-interactions-mixing-alcohol-with-medicines'],
    },
    {
      combo: t('hr.combo.speedball', 'Stimulants + opioids (“speedball”, “goofball”)'),
      why: t('hr.combo.speedballWhy', 'Stimulants do not cancel out opioids. You can overdose on either, and the stimulant can wear off first.'),
      src: ['CDC', 'https://www.cdc.gov/overdose-prevention/media/pdfs/2024/03/CDC-Stimulant-Guide.pdf'],
    },
    {
      combo: t('hr.combo.cocaethylene', 'Cocaine + alcohol'),
      why: t('hr.combo.cocaethyleneWhy', 'Your body makes cocaethylene, which is more toxic to the heart than either alone.'),
      src: ['NIDA', 'https://nida.nih.gov/research-topics/cocaine'],
    },
  ];
}

export function harmReductionView() {
  return h('div', { class: 'view view-prose' },
    pageHeader(t('hr.title', 'Harm reduction'),
      t('hr.lede', 'Practical ways to stay safer, whether or not you want to stop using. No judgment and no requirement to quit.')),
    emergencyCallout(),
    tocNav([
      ['naloxone', t('hr.toc.naloxone', 'Get naloxone')],
      ['never-alone', t('hr.toc.neverAlone', 'Don’t use alone')],
      ['checking', t('hr.toc.checking', 'Check your drugs')],
      ['safer-use', t('hr.toc.saferUse', 'Lower your risk')],
      ['mixing', t('hr.toc.mixing', 'Mixing substances')],
      ['wounds', t('hr.toc.wounds', 'Supplies & wound care')],
      ['rights', t('hr.toc.rights', 'Know your rights')],
    ]),

    section('naloxone', t('hr.naloxone.title', 'Get naloxone (Narcan)'),
      p(t('hr.naloxone.intro', 'Naloxone reverses opioid overdoses, including fentanyl. It is safe, easy to use, and cannot hurt someone who has not taken opioids.')),
      ul([
        [strong(t('hr.naloxone.pharmacy', 'At a pharmacy, no prescription needed. ')), t('hr.naloxone.pharmacyBody', 'Naloxone nasal spray is sold over the counter at most pharmacies and many stores. Insurance, including Medicaid, often covers it if you ask the pharmacist.')],
        [strong(t('hr.naloxone.free', 'Free from harm reduction programs and health departments. ')), t('hr.naloxone.freeBody', 'Many syringe services programs and local health departments hand it out for free, no questions asked.')],
        [strong(t('hr.naloxone.mail', 'Free by mail in many states. ')), ext('https://nextdistro.org/naloxone', 'NEXT Distro'), t('hr.naloxone.mailBody', ' lists mail-based and local naloxone programs by state.')],
        [strong(t('hr.naloxone.carry', 'Carry it and tell people where it is. ')), t('hr.naloxone.carryBody', 'Store it at room temperature and out of direct sunlight, and check the expiration date.')],
      ]),
      p(h('a', { class: 'btn btn-primary', href: '#/treatment?codes=NOE' }, icon('pin'), t('hr.naloxone.find', 'Find naloxone & overdose education near me'))),
    ),

    section('never-alone', t('hr.neverAlone.title', 'Don’t use alone'),
      p(t('hr.neverAlone.intro', 'Most overdose deaths happen when no one is there to help. If you do use alone, a hotline can stay on the phone with you.')),
      hotlineGrid(HOTLINES.substanceUse.filter((l) => l.name === 'Never Use Alone' || l.name === 'SafeSpot')),
      ul([
        t('hr.neverAlone.tip1', 'Use with someone you trust, and take turns so one person is always alert.'),
        t('hr.neverAlone.tip2', 'Leave the door unlocked, or tell someone to check on you.'),
        t('hr.neverAlone.tip3', 'Keep naloxone where others can see it and know how to use it.'),
      ]),
      p(t('hr.neverAlone.plan', 'Want to map out where your naloxone is kept and who to call in a hard moment? '),
        h('a', { href: '#/plan' }, t('hr.neverAlone.planLink', 'Build a Personal Safety Plan that stays in this browser')), '.'),
    ),

    section('checking', t('hr.checking.title', 'Check your drugs'),
      p(t('hr.checking.intro', 'Fentanyl, xylazine, and other substances turn up in pills, powders, and stimulants. Test strips are cheap, fast, and available from many harm reduction programs.')),
      h('div', { class: 'card how-to' },
        h('h3', null, t('hr.checking.howTo', 'How to use a fentanyl test strip')),
        h('ol', null,
          h('li', null, t('hr.checking.step1', 'Put a small amount of the drug (at least 10 mg), or the residue from a baggie, in a clean, dry container.')),
          h('li', null, t('hr.checking.step2', 'Add water and mix: about ½ teaspoon for most drugs, or a full teaspoon for methamphetamine. Meth and MDMA can cause false positives if they are not diluted enough.')),
          h('li', null, t('hr.checking.step3', 'Dip the wavy end of the strip in the water for about 15 seconds.')),
          h('li', null, t('hr.checking.step4', 'Lay it flat and wait 2 to 5 minutes, then read it.'))),
        h('ul', { class: 'result-key' },
          h('li', { class: 'result-pos' }, strong(t('hr.checking.pos', 'One line: fentanyl detected.'))),
          h('li', { class: 'result-neg' }, strong(t('hr.checking.neg', 'Two lines: no fentanyl detected.')), t('hr.checking.negFaint', ' Even a faint second line counts.')),
          h('li', null, strong(t('hr.checking.invalid', 'No line, or only one on the right side: ')), t('hr.checking.invalidBody', 'the test did not work. Try again with a new strip.'))),
        fine(t('hr.checking.brand', 'Instructions vary by brand, so follow the ones that come with your strips.')),
      ),
      ul([
        [strong(t('hr.checking.notSafe', 'A negative result does not mean safe. ')), t('hr.checking.notSafeBody', 'Fentanyl can be spread unevenly, and strips may miss some fentanyl-like drugs such as carfentanil. '),
          ext('https://www.cdc.gov/stop-overdose/caring/fentanyl-facts.html', t('hr.checking.cdcFacts', 'CDC: Fentanyl facts'))],
        [strong(t('hr.checking.xts', 'Xylazine test strips ')), t('hr.checking.xtsBody', 'work the same way and are offered by many programs.')],
        [strong(t('hr.checking.lab', 'Lab drug checking: ')), t('hr.checking.labThe', 'the '), ext('https://www.streetsafe.supply/', 'UNC Street Drug Analysis Lab'),
          t('hr.checking.labBody', ' tests mailed samples sent through partner programs and publishes anonymous results. '),
          ext('https://dancesafe.org/', 'DanceSafe'), t('hr.checking.dancesafe', ' sells test kits and has drug-checking guides.')],
      ]),
    ),

    section('safer-use', t('hr.saferUse.title', 'Lower your risk'),
      ul([
        [strong(t('hr.saferUse.startLow', 'Start low and go slow, ')), t('hr.saferUse.startLowBody', 'especially with a new supply or a new dealer. Try a small amount first.')],
        [strong(t('hr.saferUse.tolerance', 'Your tolerance drops fast after a break, ')), t('hr.saferUse.toleranceBody', 'such as time in treatment, jail or prison, or the hospital. The weeks after a break carry the highest risk of overdose.')],
        [strong(t('hr.saferUse.depressants', 'Avoid mixing depressants. ')), t('hr.saferUse.depressantsBody', 'Opioids, benzos, alcohol, and sleep medicines all slow breathing. See the chart below.')],
        [strong(t('hr.saferUse.routes', 'Every route can lead to overdose. ')), t('hr.saferUse.routesBody', 'Injecting carries the highest risk of overdose and infection. Smoking or snorting may lower some risks.')],
        [strong(t('hr.saferUse.hydrate', 'Stay hydrated, eat, and sleep ')), t('hr.saferUse.hydrateBody', 'when using stimulants. Overheating and exhaustion are dangerous.')],
      ]),
    ),

    section('mixing', t('hr.mixing.title', 'Mixing substances'),
      p(t('hr.mixing.intro', 'Some combinations are especially dangerous. This list is not complete.')),
      h('div', { class: 'table-wrap' },
        h('table', { class: 'combo-table' },
          h('caption', { class: 'visually-hidden' }, t('hr.mixing.caption', 'High-risk drug combinations and why')),
          h('thead', null, h('tr', null,
            h('th', { scope: 'col' }, t('hr.mixing.colCombo', 'Combination')),
            h('th', { scope: 'col' }, t('hr.mixing.colWhy', 'Why it is risky')),
            h('th', { scope: 'col' }, t('hr.mixing.colSource', 'Source')))),
          h('tbody', null, combos().map((c) => h('tr', null,
            h('th', { scope: 'row' }, c.combo), h('td', null, c.why), h('td', null, ext(c.src[1], c.src[0]))))),
        ),
      ),
      p(t('hr.mixing.pharmacist', 'For pharmacist-reviewed interactions with buprenorphine, methadone, naltrexone, and other medications, check the '),
        h('a', { href: '#/medications' }, t('hr.mixing.pharmacistLink', 'Pharmacist Medication & Interaction Hub')), '.'),
      fine(t('hr.mixing.tripsit', 'For other substances, the community-maintained '), ext('https://combo.tripsit.me/', t('hr.mixing.tripsitLink', 'TripSit combination chart')),
        t('hr.mixing.poison', ' covers many more pairs. When in doubt, call Poison Help at '), tel('18002221222', '1-800-222-1222'), t('hr.mixing.poisonFree', ', free and 24/7.')),
    ),

    section('wounds', t('hr.wounds.title', 'Supplies, infections, and wound care'),
      ul([
        [strong(t('hr.wounds.sterile', 'Use new, sterile supplies every time ')), t('hr.wounds.sterileBody', 'and don’t share needles, cookers, cottons, water, pipes, or straws. This prevents HIV and hepatitis C.')],
        [strong(t('hr.wounds.ssp', 'Syringe services programs (SSPs) ')), t('hr.wounds.sspBody', 'offer free supplies, safe disposal, naloxone, testing, wound care, and connections to treatment if and when you want it. Find one through the '),
          ext('https://nasen.org/', t('hr.wounds.nasen', 'NASEN directory')), t('hr.wounds.nasenAfter', ' or your local health department.')],
        [strong(t('hr.wounds.care', 'Caring for a wound: ')), t('hr.wounds.careBody', 'wash it gently with soap and water or saline. Skip hydrogen peroxide and rubbing alcohol. Keep it moist with a thin layer of ointment, cover it with a non-stick bandage, and change the dressing regularly.')],
        [strong(t('hr.wounds.xylazine', 'Xylazine wounds ')), t('hr.wounds.xylazineBody', 'can appear anywhere on the body, not just where you inject, and can get worse fast. Drawing a line around the edge helps you see whether it is growing.')],
      ]),
      h('div', { class: 'callout callout-warn' },
        p(strong(t('hr.wounds.redFlags', 'Get medical care right away for: ')), t('hr.wounds.redFlagsBody', 'fever or chills, redness or red streaks spreading from a wound, a wound that turns black or smells bad, severe pain, or bone or tendon showing. '),
          h('a', { href: '#/health' }, t('hr.wounds.healthCenter', 'Find a low-cost health center')), '.')),
      p(t('hr.link.adulterant', 'For clinical adulterant profiles, alpha-2 sedation triage, and test strip dilution protocols, visit the '), h('a', { href: '#/adulterant-care' }, t('hr.link.adulterantName', 'Emerging Adulterants, Xylazine & Wound Care Guide')), '.'),
      p(t('hr.link.polysubstance', 'For synergistic overdose risks, multi-depressant respiratory collapse, and airway protocols when naloxone alone does not reverse sedation, explore the '), h('a', { href: '#/polysubstance-care' }, t('hr.link.polysubstanceName', 'Polysubstance Overdose Synergy & Drug Interaction Navigator')), '.'),
      p(t('hr.link.nightlife', 'For festival safety, MDMA hydration, ketamine bladder health, nitrous B12 risks, and reagent testing standards, explore the '), h('a', { href: '#/nightlife-care' }, t('hr.link.nightlifeName', 'Nightlife & Festival Harm Reduction Guide')), '.'),
      p(t('hr.link.sleep', 'For insomnia in recovery, CBT-I stimulus control, non-controlled sleep aids, and post-acute withdrawal sleep architecture, explore the '), h('a', { href: '#/sleep-care' }, t('hr.link.sleepName', 'Sleep Restoration & Insomnia in Recovery Navigator')), '.'),
      p(t('hr.link.dental', 'For FDA buprenorphine enamel protection protocols, stimulant dry mouth mitigation, endocarditis bacteremia prevention, and low-cost dental clinics, visit the '), h('a', { href: '#/dental-care' }, t('hr.link.dentalName', 'Dental, Oral Health & Endocarditis Prevention Guide')), '.'),
      p(t('hr.link.cannabis', 'For cannabinoid hyperemesis syndrome (CHS), cyclic vomiting triage, topical capsaicin protocols, why Zofran fails, and 90-day CB1 recovery, visit the '), h('a', { href: '#/cannabis-care' }, t('hr.link.cannabisName', 'Cannabinoid Hyperemesis (CHS) & Concentrates Navigator')), '.'),
      p(t('hr.link.hepatitis', 'For AASLD/IDSA Hepatitis C 8-to-12-week DAA cure regimens, non-invasive FIB-4 scoring, HBV screening, and HIV PrEP/PEP emergency windows, explore the '), h('a', { href: '#/viral-hepatitis' }, t('hr.link.hepatitisName', 'Viral Hepatitis (HCV/HBV), DAA & HIV PrEP/PEP Guide')), '.'),
      p(t('hr.link.nicotine', 'For concurrent smoking cessation in recovery, Fagerström dependence scoring, combination NRT dosing protocols, and vape salt tapering, visit the '), h('a', { href: '#/nicotine-care' }, t('hr.link.nicotineName', 'Tobacco, Nicotine & Vaping Recovery Navigator')), '.'),
      p(t('hr.link.benzo', 'For Ashton Manual diazepam equivalence calculations, stepwise crossover tapering schedules, flumazenil black box contraindications, and protracted BIND validation, explore the '), h('a', { href: '#/benzodiazepine-care' }, t('hr.link.benzoName', 'Benzodiazepine & Ashton Taper Navigator')), '.'),
      p(t('hr.link.adhd', 'For adult ADHD self-screening (ASRS v1.1), non-controlled pharmacotherapy in SUD recovery, counterfeit pressed pill FTS dilution, and executive function tools, explore the '), h('a', { href: '#/adhd-care' }, t('hr.link.adhdName', 'ADHD, Neurodiversity & Stimulant Harm Reduction Navigator')), '.'),
      p(t('hr.link.toxicology', 'For acute multi-toxidrome triage, Project BETA 10-domain crisis de-escalation, RASS scoring, restraint avoidance, and SBAR clinical handoffs, explore the '), h('a', { href: '#/toxicology-triage' }, t('hr.link.toxicologyName', 'Acute Toxicology Triage & Project BETA De-Escalation Assistant')), '.'),
      fine(t('hr.wounds.source', 'Wound care guidance from the '),
        ext('https://www.cdc.gov/overdose-prevention/media/pdfs/2024/07/Xylazine-Clinical-Management-and-Harm-Reduction.pdf', t('hr.wounds.sourceLink', 'CDC xylazine fact sheet')), '.'),
    ),

    section('rights', t('hr.rights.title', 'Know your rights'),
      ul([
        [strong(t('hr.rights.goodSam', 'Good Samaritan laws: ')), t('hr.rights.goodSamBody', 'every state and DC has some legal protection for people who call 911 during an overdose, but what is covered varies a lot by state. '),
          ext('https://endoverdose.net/toolkit/', 'End Overdose'), t('hr.rights.and', ' and '), ext('https://lawatlas.org/datasets/good-samaritan-overdose-prevention-laws', 'LawAtlas'),
          t('hr.rights.track', ' track state laws.')],
        [strong(t('hr.rights.supplies', 'Naloxone and test strips: ')), t('hr.rights.suppliesBody', 'state laws on carrying test strips and other supplies differ. Most states now allow fentanyl test strips.')],
        [strong(t('hr.rights.privacy', 'Treatment privacy: ')), t('hr.rights.privacyBody', 'federal law (42 CFR Part 2) gives records from most substance use treatment programs extra protection. They generally cannot be shared without your written consent, or used against you in legal proceedings without your consent or a special court order. '),
          h('a', { href: '#/plan' }, t('hr.rights.privacyLink', 'Learn more about your 42 CFR Part 2 privacy rights')), '.'],
      ]),
    ),

    section('more', t('hr.more.title', 'More harm reduction & clinical tools'),
      p(
        h('a', { class: 'btn btn-secondary btn-small', href: '#/plan' }, t('hr.more.plan', 'Build a Personal Safety Plan')),
        ' ',
        h('a', { class: 'btn btn-secondary btn-small', href: '#/medications' }, t('hr.more.medications', 'Medication & Interaction Hub')),
        ' ',
        h('a', { class: 'btn btn-secondary btn-small', href: '#/navigator' }, t('hr.more.navigator', 'ASAM Care Navigator')),
      ),
      resourceList([
        { name: 'National Harm Reduction Coalition', href: 'https://harmreduction.org/', desc: t('hr.more.nhrc', 'Guides, training, and information on harm reduction principles.') },
        { name: 'SAMHSA Overdose Prevention and Response Toolkit', href: 'https://library.samhsa.gov/product/overdose-prevention-response-toolkit/pep23-03-00-001', desc: t('hr.more.samhsa', 'Free federal guide for individuals, families, and communities.') },
        { name: 'NEXT Distro', href: 'https://nextdistro.org/', desc: t('hr.more.nextDistro', 'Harm reduction education and state-by-state supply access.') },
      ]),
    ),
  );
}

export { supportView } from './support.js';
