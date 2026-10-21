import { h, ext, tel, icon } from '../dom.js';
import { overdoseGuide } from '../components/overdose.js';
import { HOTLINES } from '../content/hotlines.js';
import { offlineControlCard } from './core.js';
import { pageHeader, section, p, fine, ul, strong, resourceList, hotlineGrid, tocNav, emergencyCallout } from './common.js';

// ---------------------------------------------------------------- Overdose
export function overdoseView() {
  return h('div', { class: 'view view-overdose' },
    pageHeader('Overdose response', 'What to do right now, step by step.',
      h('p', { class: 'actions' }, tel('911', [icon('phone'), 'Call 911'], { class: 'btn btn-emergency btn-large' }))),
    overdoseGuide(),
    offlineControlCard(),
  );
}

// ---------------------------------------------------------------- Harm reduction
const COMBOS = [
  {
    combo: 'Opioids + benzodiazepines (“benzos”, including pressed pills)',
    why: 'Both slow breathing. Together they sharply raise the risk of a fatal overdose.',
    src: ['FDA', 'https://www.fda.gov/drugs/drug-safety-and-availability/fda-requiring-boxed-warning-updated-improve-safe-use-benzodiazepine-drug-class'],
  },
  {
    combo: 'Opioids + alcohol',
    why: 'Alcohol adds to the breathing slowdown caused by opioids.',
    src: ['NIAAA', 'https://www.niaaa.nih.gov/publications/brochures-and-fact-sheets/harmful-interactions-mixing-alcohol-with-medicines'],
  },
  {
    combo: 'Opioids + gabapentin or pregabalin (Neurontin, Lyrica)',
    why: 'This combination can cause serious, sometimes fatal breathing problems.',
    src: ['FDA', 'https://www.fda.gov/safety/medical-product-safety-information/neurontin-gralise-horizant-gabapentin-and-lyrica-lyrica-cr-pregabalin-drug-safety-communication'],
  },
  {
    combo: 'Opioids + xylazine or medetomidine (“tranq”)',
    why: 'These sedatives deepen and lengthen sedation, and naloxone does not reverse them. Still give naloxone for the opioid.',
    src: ['CDC', 'https://www.cdc.gov/overdose-prevention/about/what-you-should-know-about-xylazine.html'],
  },
  {
    combo: 'Alcohol + benzodiazepines or sleep medicines',
    why: 'Combined sedation can slow or stop breathing.',
    src: ['NIAAA', 'https://www.niaaa.nih.gov/publications/brochures-and-fact-sheets/harmful-interactions-mixing-alcohol-with-medicines'],
  },
  {
    combo: 'Stimulants + opioids (“speedball”, “goofball”)',
    why: 'Stimulants do not cancel out opioids. You can overdose on either, and the stimulant can wear off first.',
    src: ['CDC', 'https://www.cdc.gov/overdose-prevention/media/pdfs/2024/03/CDC-Stimulant-Guide.pdf'],
  },
  {
    combo: 'Cocaine + alcohol',
    why: 'Your body makes cocaethylene, which is more toxic to the heart than either alone.',
    src: ['NIDA', 'https://nida.nih.gov/research-topics/cocaine'],
  },
];

export function harmReductionView() {
  return h('div', { class: 'view view-prose' },
    pageHeader('Harm reduction',
      'Practical ways to stay safer, whether or not you want to stop using. No judgment and no requirement to quit.'),
    emergencyCallout(),
    tocNav([
      ['naloxone', 'Get naloxone'],
      ['never-alone', 'Don’t use alone'],
      ['checking', 'Check your drugs'],
      ['safer-use', 'Lower your risk'],
      ['mixing', 'Mixing substances'],
      ['wounds', 'Supplies & wound care'],
      ['rights', 'Know your rights'],
    ]),

    section('naloxone', 'Get naloxone (Narcan)',
      p('Naloxone reverses opioid overdoses, including fentanyl. It is safe, easy to use, and cannot hurt someone who has not taken opioids.'),
      ul([
        [strong('At a pharmacy, no prescription needed. '), 'Naloxone nasal spray is sold over the counter at most pharmacies and many stores. Insurance, including Medicaid, often covers it if you ask the pharmacist.'],
        [strong('Free from harm reduction programs and health departments. '), 'Many syringe services programs and local health departments hand it out for free, no questions asked.'],
        [strong('Free by mail in many states. '), ext('https://nextdistro.org/naloxone', 'NEXT Distro'), ' lists mail-based and local naloxone programs by state.'],
        [strong('Carry it and tell people where it is. '), 'Store it at room temperature and out of direct sunlight, and check the expiration date.'],
      ]),
      p(h('a', { class: 'btn btn-primary', href: '#/treatment?codes=NOE' }, icon('pin'), 'Find naloxone & overdose education near me')),
    ),

    section('never-alone', 'Don’t use alone',
      p('Most overdose deaths happen when no one is there to help. If you do use alone, a hotline can stay on the phone with you.'),
      hotlineGrid(HOTLINES.substanceUse.filter((l) => l.name === 'Never Use Alone' || l.name === 'SafeSpot')),
      ul([
        'Use with someone you trust, and take turns so one person is always alert.',
        'Leave the door unlocked, or tell someone to check on you.',
        'Keep naloxone where others can see it and know how to use it.',
      ]),
      p('Want to map out where your naloxone is kept and who to call in a hard moment? ',
        h('a', { href: '#/plan' }, 'Build a private, zero-knowledge Personal Safety Plan'), '.'),
    ),

    section('checking', 'Check your drugs',
      p('Fentanyl, xylazine, and other substances turn up in pills, powders, and stimulants. Test strips are cheap, fast, and available from many harm reduction programs.'),
      h('div', { class: 'card how-to' },
        h('h3', null, 'How to use a fentanyl test strip'),
        h('ol', null,
          h('li', null, 'Put a small amount of the drug (at least 10 mg), or the residue from a baggie, in a clean, dry container.'),
          h('li', null, 'Add water and mix: about ½ teaspoon for most drugs, or a full teaspoon for methamphetamine. Meth and MDMA can cause false positives if they are not diluted enough.'),
          h('li', null, 'Dip the wavy end of the strip in the water for about 15 seconds.'),
          h('li', null, 'Lay it flat and wait 2 to 5 minutes, then read it.')),
        h('ul', { class: 'result-key' },
          h('li', { class: 'result-pos' }, strong('One line: fentanyl detected.')),
          h('li', { class: 'result-neg' }, strong('Two lines: no fentanyl detected.'), ' Even a faint second line counts.'),
          h('li', null, strong('No line, or only one on the right side: '), 'the test did not work. Try again with a new strip.')),
        fine('Instructions vary by brand, so follow the ones that come with your strips.'),
      ),
      ul([
        [strong('A negative result does not mean safe. '), 'Fentanyl can be spread unevenly, and strips may miss some fentanyl-like drugs such as carfentanil. ',
          ext('https://www.cdc.gov/stop-overdose/caring/fentanyl-facts.html', 'CDC: Fentanyl facts')],
        [strong('Xylazine test strips '), 'work the same way and are offered by many programs.'],
        [strong('Lab drug checking: '), 'the ', ext('https://www.streetsafe.supply/', 'UNC Street Drug Analysis Lab'),
          ' tests mailed samples sent through partner programs and publishes anonymous results. ',
          ext('https://dancesafe.org/', 'DanceSafe'), ' sells test kits and has drug-checking guides.'],
      ]),
    ),

    section('safer-use', 'Lower your risk',
      ul([
        [strong('Start low and go slow, '), 'especially with a new supply or a new dealer. Try a small amount first.'],
        [strong('Your tolerance drops fast after a break, '), 'such as time in treatment, jail or prison, or the hospital. The weeks after a break carry the highest risk of overdose.'],
        [strong('Avoid mixing depressants. '), 'Opioids, benzos, alcohol, and sleep medicines all slow breathing. See the chart below.'],
        [strong('Every route can lead to overdose. '), 'Injecting carries the highest risk of overdose and infection. Smoking or snorting may lower some risks.'],
        [strong('Stay hydrated, eat, and sleep '), 'when using stimulants. Overheating and exhaustion are dangerous.'],
      ]),
    ),

    section('mixing', 'Mixing substances',
      p('Some combinations are especially dangerous. This list is not complete.'),
      h('div', { class: 'table-wrap' },
        h('table', { class: 'combo-table' },
          h('caption', { class: 'visually-hidden' }, 'High-risk drug combinations and why'),
          h('thead', null, h('tr', null, h('th', { scope: 'col' }, 'Combination'), h('th', { scope: 'col' }, 'Why it is risky'), h('th', { scope: 'col' }, 'Source'))),
          h('tbody', null, COMBOS.map((c) => h('tr', null,
            h('th', { scope: 'row' }, c.combo), h('td', null, c.why), h('td', null, ext(c.src[1], c.src[0]))))),
        ),
      ),
      p('For pharmacist-reviewed interactions with buprenorphine, methadone, naltrexone, and other medications, check the ',
        h('a', { href: '#/medications' }, 'Pharmacist Medication & Interaction Hub'), '.'),
      fine('For other substances, the community-maintained ', ext('https://combo.tripsit.me/', 'TripSit combination chart'),
        ' covers many more pairs. When in doubt, call Poison Help at ', tel('18002221222', '1-800-222-1222'), ', free and 24/7.'),
    ),

    section('wounds', 'Supplies, infections, and wound care',
      ul([
        [strong('Use new, sterile supplies every time '), 'and don’t share needles, cookers, cottons, water, pipes, or straws. This prevents HIV and hepatitis C.'],
        [strong('Syringe services programs (SSPs) '), 'offer free supplies, safe disposal, naloxone, testing, wound care, and connections to treatment if and when you want it. Find one through the ',
          ext('https://nasen.org/', 'NASEN directory'), ' or your local health department.'],
        [strong('Caring for a wound: '), 'wash it gently with soap and water or saline. Skip hydrogen peroxide and rubbing alcohol. Keep it moist with a thin layer of ointment, cover it with a non-stick bandage, and change the dressing regularly.'],
        [strong('Xylazine wounds '), 'can appear anywhere on the body, not just where you inject, and can get worse fast. Drawing a line around the edge helps you see whether it is growing.'],
      ]),
      h('div', { class: 'callout callout-warn' },
        p(strong('Get medical care right away for: '), 'fever or chills, redness or red streaks spreading from a wound, a wound that turns black or smells bad, ',
          'severe pain, or bone or tendon showing. ', h('a', { href: '#/health' }, 'Find a low-cost health center'), '.')),
      fine('Wound care guidance from the ',
        ext('https://www.cdc.gov/overdose-prevention/media/pdfs/2024/07/Xylazine-Clinical-Management-and-Harm-Reduction.pdf', 'CDC xylazine fact sheet'), '.'),
    ),

    section('rights', 'Know your rights',
      ul([
        [strong('Good Samaritan laws: '), 'every state and DC has some legal protection for people who call 911 during an overdose, but what is covered varies a lot by state. ',
          ext('https://endoverdose.net/toolkit/', 'End Overdose'), ' and ', ext('https://lawatlas.org/datasets/good-samaritan-overdose-prevention-laws', 'LawAtlas'),
          ' track state laws.'],
        [strong('Naloxone and test strips: '), 'state laws on carrying test strips and other supplies differ. Most states now allow fentanyl test strips.'],
        [strong('Treatment privacy: '), 'federal law (42 CFR Part 2) gives records from most substance use treatment programs extra protection. They generally cannot be shared without your written consent, or used against you in legal proceedings without your consent or a special court order. ',
          h('a', { href: '#/plan' }, 'Learn more about your 42 CFR Part 2 privacy rights'), '.'],
      ]),
    ),

    section('more', 'More harm reduction & clinical tools',
      p(
        h('a', { class: 'btn btn-secondary btn-small', href: '#/plan' }, 'Build a Personal Safety Plan'),
        ' ',
        h('a', { class: 'btn btn-secondary btn-small', href: '#/medications' }, 'Medication & Interaction Hub'),
        ' ',
        h('a', { class: 'btn btn-secondary btn-small', href: '#/navigator' }, 'ASAM Care Navigator'),
      ),
      resourceList([
        { name: 'National Harm Reduction Coalition', href: 'https://harmreduction.org/', desc: 'Guides, training, and information on harm reduction principles.' },
        { name: 'SAMHSA Overdose Prevention and Response Toolkit', href: 'https://library.samhsa.gov/product/overdose-prevention-response-toolkit/pep23-03-00-001', desc: 'Free federal guide for individuals, families, and communities.' },
        { name: 'NEXT Distro', href: 'https://nextdistro.org/', desc: 'Harm reduction education and state-by-state supply access.' },
      ]),
    ),
  );
}

// ---------------------------------------------------------------- Recovery & family
export function supportView() {
  return h('div', { class: 'view view-prose' },
    pageHeader('Recovery & family support',
      'Recovery looks different for everyone. Find peer support, recovery housing, and help for the people who care about you.'),
    tocNav([['peer', 'Peer support & meetings'], ['housing', 'Recovery housing'], ['family', 'For family & friends'], ['language', 'Words matter']]),

    section('peer', 'Peer support & meetings',
      p('Mutual-help groups are free. Different groups work for different people, so it is fine to try a few. You can be in recovery while taking medications like buprenorphine or methadone (',
        h('a', { href: '#/medications' }, 'see our Medication Guide'), ').'),
      resourceList([
        { name: 'SMART Recovery', href: 'https://meetings.smartrecovery.org/', desc: 'Science-based, self-empowering meetings in person and online.' },
        { name: 'Alcoholics Anonymous', href: 'https://www.aa.org/find-aa', desc: '12-step meetings for people with a drinking problem.' },
        { name: 'Narcotics Anonymous', href: 'https://na.org/meetingsearch/', desc: '12-step meetings for people recovering from drug use.' },
        { name: 'Recovery Dharma', href: 'https://recoverydharma.org/', desc: 'Peer support grounded in Buddhist practice and meditation.' },
        { name: 'LifeRing Secular Recovery', href: 'https://lifering.org/', desc: 'Secular, abstinence-based peer support.' },
        { name: 'Faces & Voices of Recovery', href: 'https://facesandvoicesofrecovery.org/', desc: 'Find recovery community organizations and peer recovery coaches near you.' },
      ]),
      p(
        h('a', { class: 'btn btn-secondary', href: '#/treatment?codes=PEER' }, 'Find programs with peer support'),
        ' ',
        h('a', { class: 'btn btn-ghost', href: '#/plan' }, 'Personal Safety Plan & Urge Surfing Timer'),
      ),
    ),

    section('housing', 'Recovery housing',
      p('Good recovery homes are safe, substance-free, and clear about rules and costs. Be cautious of any home that offers free rent, travel, or cash in exchange for entering a specific treatment program.'),
      resourceList([
        { name: 'National Alliance for Recovery Residences (NARR)', href: 'https://narronline.org/', desc: 'National standards for recovery housing and links to state affiliates that certify homes.' },
      ]),
      p(
        h('a', { class: 'btn btn-secondary', href: '#/treatment?codes=HH' }, 'Find recovery housing listed with SAMHSA'),
        ' ',
        h('a', { class: 'btn btn-ghost', href: '#/navigator' }, 'Check level of care with the ASAM Navigator'),
      ),
    ),

    section('family', 'For family & friends',
      p('Loving someone who uses drugs or alcohol is hard. You don’t have to do it alone, and taking care of yourself helps them too.'),
      ul([
        [strong('Try CRAFT, not confrontation. '), 'Community Reinforcement and Family Training (CRAFT) teaches families to communicate positively, reward healthy choices, and look after their own wellbeing. ',
          'Research shows it helps more loved ones start treatment than confrontational “interventions” do.'],
        [strong('Keep naloxone at home '), 'and learn the ', h('a', { href: '#/overdose' }, 'overdose response steps'), '.'],
        [strong('Meet them where they are. '), 'Staying connected matters more than getting them to agree to everything at once. Need help calling a clinic for a loved one? Use the ',
          h('a', { href: '#/plan' }, 'Intake Call Script Builder'), '.'],
      ]),
      hotlineGrid(HOTLINES.substanceUse.filter((l) => l.name.startsWith('Partnership'))),
      resourceList([
        { name: 'SMART Recovery Family & Friends', href: 'https://smartrecovery.org/family', desc: 'CRAFT-based meetings and tools for loved ones.' },
        { name: 'Al-Anon', href: 'https://al-anon.org/', desc: 'Support groups for people affected by someone else’s drinking.' },
        { name: 'Nar-Anon', href: 'https://nar-anon.org/', desc: 'Support groups for families and friends of people who use drugs.' },
        { name: 'GRASP', href: 'https://grasphelp.org/', desc: 'Grief support for people who have lost someone to substance use.' },
      ]),
    ),

    section('language', 'Words matter',
      p('Stigmatizing language keeps people from seeking help. Person-first words help. From ',
        ext('https://nida.nih.gov/research-topics/addiction-science/words-matter-preferred-language-talking-about-addiction', 'NIDA: Words Matter'), ':'),
      h('div', { class: 'table-wrap' },
        h('table', { class: 'words-table' },
          h('caption', { class: 'visually-hidden' }, 'Preferred language'),
          h('thead', null, h('tr', null, h('th', { scope: 'col' }, 'Instead of'), h('th', { scope: 'col' }, 'Try'))),
          h('tbody', null, [
            ['Addict, junkie, user', 'Person with a substance use disorder, person who uses drugs'],
            ['Alcoholic', 'Person with alcohol use disorder'],
            ['Clean / dirty', 'Not currently using / testing negative or positive'],
            ['Substance abuse', 'Substance use'],
            ['Relapse', 'Return to use'],
            ['Replacement therapy', 'Medication for opioid use disorder'],
          ].map(([a, b]) => h('tr', null, h('td', null, a), h('td', null, b))))),
      ),
    ),
  );
}

// ---------------------------------------------------------------- Choosing care
const QUESTIONS = [
  'Is the program licensed by the state, and is it accredited (for example, by CARF or The Joint Commission)?',
  'Do you offer, or allow, medications like buprenorphine, methadone, or naltrexone? Can I keep taking medication I already use?',
  'Do you treat mental health conditions at the same time?',
  'What does treatment involve each day, and what therapies do you use?',
  'Who is on staff? Is there a doctor or nurse practitioner who specializes in addiction?',
  'How is my treatment plan made, and how often is it updated?',
  'What will it cost? Do you take my insurance or Medicaid, or offer a sliding scale?',
  'Can my family be involved if I want them to be?',
  'What happens if I return to use during treatment?',
  'What support do you offer after I leave?',
];

const RED_FLAGS = [
  'Offers free travel, free rent, gift cards, or cash to enter a program, or says your insurance pays for “everything”.',
  'Pressures you to commit or travel today, or will not tell you the facility’s name and address before you agree.',
  'A “helpline” that won’t say who it works for, or routes every caller to the same few facilities.',
  'Promises guaranteed results or a “cure”.',
  'Discourages or refuses FDA-approved medications for opioid or alcohol use disorder.',
  'Asks mostly about your insurance and very little about your health.',
];

export function choosingCareView() {
  return h('div', { class: 'view view-prose' },
    pageHeader('Choosing quality care',
      'Good treatment is personal, evidence-based, and honest about cost. Here is how to tell the difference.'),
    tocNav([['quality', 'Signs of quality'], ['questions', 'Questions to ask'], ['red-flags', 'Red flags'], ['verify', 'Verify a program']]),

    section('quality', 'Signs of quality treatment',
      ul([
        [strong('Licensed and accredited. '), 'The program and its clinicians are licensed by the state. Accreditation from groups like CARF or The Joint Commission is a plus.'],
        [strong('Offers FDA-approved medications '), 'for opioid and alcohol use disorder, or works closely with someone who does. Compare options in our ',
          h('a', { href: '#/medications' }, 'Pharmacist Medication & Interaction Hub'), '.'],
        [strong('Uses proven therapies, '), 'such as cognitive behavioral therapy (CBT), motivational interviewing, and contingency management. ',
          h('a', { href: '#/plan' }, 'See how each counseling therapy works'), '.'],
        [strong('Treats the whole person, '), 'including mental health, physical health, and needs like housing and work. Not sure what level of care fits? Try the ',
          h('a', { href: '#/navigator' }, 'ASAM Clinical Care Navigator'), '.'],
        [strong('Builds a plan with you, '), 'involves family if you want, and plans for support after you leave.'],
      ]),
      fine('Adapted from ', ext('https://www.samhsa.gov/find-support/learn-about-treatment/finding-quality-treatment', 'SAMHSA: Finding quality treatment'), '.'),
    ),

    section('questions', 'Questions to ask when you call',
      h('ol', { class: 'checklist' }, QUESTIONS.map((q) => h('li', null, q))),
      p(
        h('button', { type: 'button', class: 'btn btn-secondary', onclick: () => window.print() }, icon('printer'), 'Print these questions'),
        ' ',
        h('a', { class: 'btn btn-primary', href: '#/plan' }, 'Build a custom clinic call script'),
      ),
    ),

    section('red-flags', 'Red flags: scams and patient brokering',
      p('Some businesses earn money by steering people into programs, and the care that follows can be poor or unsafe. Paying kickbacks for referrals to recovery homes, treatment facilities, or labs is a federal crime (EKRA, 18 U.S.C. § 220).'),
      h('ul', { class: 'flag-list' }, RED_FLAGS.map((f) => h('li', null, icon('alert'), f))),
      p('Think you’ve seen fraud? Report it to the ', ext('https://oig.hhs.gov/fraud/report-fraud/', 'HHS Office of Inspector General'), ' or your state attorney general.'),
    ),

    section('verify', 'Verify a program',
      resourceList([
        { name: 'FindTreatment.gov', href: 'https://findtreatment.gov/', desc: 'Every listing in HarborPath’s treatment search comes from this federal directory of state-licensed facilities. Open “All listed services” on a listing to see its licenses and accreditations.' },
        { name: 'CARF provider search', href: 'https://carf.org/find-provider/', desc: 'Check whether a program is CARF-accredited.' },
        { name: 'LegitScript certification', href: 'https://www.legitscript.com/certification/addiction-treatment-certification/', desc: 'Certification for treatment providers that advertise online.' },
        { name: 'Shatterproof Treatment Atlas', href: 'https://treatmentatlas.org/', desc: 'Compare facilities on quality measures and patient reviews.' },
      ]),
    ),
  );
}
