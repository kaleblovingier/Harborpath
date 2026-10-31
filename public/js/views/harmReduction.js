import { h, clear, ext, tel, icon, announce } from '../dom.js';
import { HOTLINES } from '../content/hotlines.js';
import { getLang } from '../i18n.js';
import { pageHeader, section, p, fine, ul, strong, resourceList, hotlineGrid, tocNav, emergencyCallout } from './common.js';

const tr = (en, es) => (getLang() === 'es' ? es : en);

export const COMBOS = [
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

export const XYLAZINE_ACTION_STEPS = [
  {
    step: 1,
    id: 'give-naloxone',
    title: 'Always give naloxone (Narcan) first',
    titleEs: 'Siempre administre naloxona (Narcan) primero',
    clinicalDetail:
      'Xylazine ("tranq") and medetomidine are non-opioid central alpha-2 adrenergic agonists—not opioids—so naloxone does not directly reverse their sedative effect. However, they are almost always mixed with illicitly manufactured fentanyl. Administer 1 standard 4 mg naloxone nasal spray (or 0.4 mg IM) immediately to reverse the fentanyl/opioid respiratory depression.',
    plainDetail:
      'Even though "tranq" (xylazine or medetomidine) is not an opioid, fentanyl is almost always mixed in with it. Give 1 spray of naloxone right away to reverse the fentanyl so the person can breathe again.',
    clinicalDetailEs:
      'La xilacina ("tranq") y la medetomidina son sedantes alfa-2 adrenérgicos no opioides, por lo que la naloxona no los revierte directamente. Sin embargo, casi siempre están mezclados con fentanilo. Administre 1 dosis de naloxona inmediatamente para revertir el componente opioide.',
    plainDetailEs:
      'Aunque el "tranq" no es un opioide, casi siempre viene mezclado con fentanilo. Administre 1 rocío de naloxona de inmediato para revertir el fentanilo.',
  },
  {
    step: 2,
    id: 'rescue-breathing',
    title: 'Prioritize rescue breathing (1 breath every 5 seconds)',
    titleEs: 'Priorice la respiración de rescate (1 respiración cada 5 segundos)',
    clinicalDetail:
      'Because alpha-2 sedatives cause deep, prolonged non-opioid sedation, bradycardia, and hypotension, the person may remain unresponsive even after naloxone restores opioid receptor signaling. Tilt the head back, lift the chin, pinch the nose, and give 1 rescue breath every 5 seconds (watching the chest rise). If they are breathing on their own (at least 10 breaths/minute) but remain asleep, stop giving extra naloxone—excess naloxone will trigger severe precipitated opioid withdrawal without waking them from xylazine/medetomidine sedation. Roll them into the recovery position and monitor airway until EMS arrives.',
    plainDetail:
      'Breathing for them saves their life. Tilt their head back, pinch their nose, and give 1 breath every 5 seconds. Watch their chest rise. If they start breathing on their own after naloxone—even if they stay asleep—do NOT keep giving more naloxone. Extra naloxone will not wake them up from tranq and will only make them violently dope-sick. Roll them on their side and stay with them.',
    clinicalDetailEs:
      'Si la sedación continúa después de la naloxona, incline la cabeza hacia atrás y dé 1 respiración de rescate cada 5 segundos. Si ya respiran por sí mismos (≥10 respiraciones/minuto) aunque sigan dormidos, no siga aplicando más naloxona para evitar abstinencia precipitada grave; colóquelos de lado en posición de recuperación.',
    plainDetailEs:
      'Incline la cabeza hacia atrás y dé 1 respiración cada 5 segundos. Si empiezan a respirar por sí mismos pero siguen dormidos, NO dé más naloxona. Colóquelos de lado y quédese con ellos hasta que llegue la ambulancia.',
  },
  {
    step: 3,
    id: 'alpha2-withdrawal-rebound',
    title: 'Manage alpha-2 adrenergic withdrawal rebound alongside MOUD',
    titleEs: 'Manejo del rebote de abstinencia alfa-2 junto con MOUD',
    clinicalDetail:
      'Stopping chronic xylazine or medetomidine abruptly triggers an alpha-2 adrenergic rebound syndrome (autonomic storm: severe rebound hypertension, tachycardia, diaphoresis, tremor, agitation, and chest tightness) that buprenorphine or methadone alone cannot fully suppress. Medetomidine is up to 100–200x more potent at alpha-2 receptors than xylazine and can cause severe autonomic instability requiring inpatient or emergency titration. Clinicians treat alpha-2 withdrawal by pairing MOUD (buprenorphine or methadone) with targeted alpha-2 agonists—such as clonidine, tizanidine, lofexidine, or hospital dexmedetomidine—plus gabapentin, hydroxyzine, or benzodiazepines when clinically indicated.',
    plainDetail:
      'Coming off fentanyl mixed with xylazine or medetomidine causes two kinds of withdrawal at once: opioid withdrawal AND "tranq" withdrawal (pounding heart, high blood pressure, intense shaking, and panic). Buprenorphine or methadone stops the opioid withdrawal, and a doctor can add non-opioid blood-pressure/nerve medicines like clonidine, tizanidine, or lofexidine (or IV dexmedetomidine in the hospital) so you feel calm and safe.',
    clinicalDetailEs:
      'Suspender xilacina o medetomidina abruptamente causa rebote adrenérgico alfa-2 (hipertensión de rebote, taquicardia, temblor y ansiedad intensa) que la buprenorfina o metadona por sí solas no cubren. El manejo clínico combina MOUD con agonistas alfa-2 como clonidina, tizanidina, lofexidina o dexmedetomidina hospitalaria.',
    plainDetailEs:
      'Dejar el fentanilo con xilacina o medetomidina causa abstinencia doble. Además de buprenorfina o metadona, un médico puede recetar medicamentos como clonidina, tizanidina o lofexidina para calmar el corazón acelerado, la presión alta y los temblores.',
  },
  {
    step: 4,
    id: 'wound-care-protocol',
    title: 'Step-by-step non-judgmental xylazine wound care & red flags',
    titleEs: 'Cuidado paso a paso de heridas por xilacina y señales de alerta',
    clinicalDetail:
      'Xylazine causes direct peripheral vasoconstriction and tissue ischemia—meaning necrotic skin ulcers can appear anywhere on the body, even if you snort or smoke and never inject into that spot. Step 1: Gently irrigate with sterile normal saline or clean soap and water. Step 2: NEVER use hydrogen peroxide, rubbing alcohol, or bleach (they destroy granulating tissue and delay healing). Step 3: Apply a thin layer of plain ointment (petroleum jelly / Aquaphor) or Xeroform to keep the wound bed moist, and cover with a non-stick dressing (non-adherent pad + clean gauze wrap). Step 4: Border marking—trace the outer border of redness with a pen and write the date/time to track spread. Step 5: Seek immediate medical care for sepsis/necrosis red flags: fever or chills, rapidly spreading redness or red streaks, black/leathery eschar or foul odor, severe pain, dizziness/confusion, or exposed tendon or bone.',
    plainDetail:
      'Xylazine narrows blood vessels and can cause skin sores anywhere on your body—even if you smoke or snort. How to care for a wound safely: (1) Wash gently with sterile saline or mild soap and water. (2) Skip hydrogen peroxide and rubbing alcohol—they burn healthy skin cells and make wounds worse. (3) Put a thin layer of plain Vaseline/ointment on the sore and cover it with a non-stick bandage so it stays moist and does not stick. (4) Draw a pen line around the red edge with today’s date to see if it grows. (5) Go to a clinic or ER right away for red flags: fever, chills, red streaks, black tissue, bad smell, extreme pain, or bone/tendon showing.',
    clinicalDetailEs:
      'Lave suavemente con solución salina estéril o agua limpia y jabón. Evite el peróxido de hidrógeno (agua oxigenada) y el alcohol. Mantenga el lecho húmedo con ungüento simple y apósito antiadherente (non-stick). Marque el borde del enrojecimiento con bolígrafo para vigilar si avanza. Busque atención médica urgente ante signos de sepsis o necrosis: fiebre, escalofríos, líneas rojas, tejido negro, mal olor o hueso/tendón expuesto.',
    plainDetailEs:
      'Lave la herida suavemente con solución salina o agua y jabón. No use agua oxigenada ni alcohol. Cubra con ungüento y una venda que no se pegue. Dibuje una línea alrededor del borde rojo para ver si crece y acuda a urgencias si hay fiebre, escalofríos, tejido negro o mal olor.',
  },
];

const harmReductionState = {
  plainLanguage: false,
};

let activeHarmReset = null;

export function getHarmReductionState() {
  return {
    plainLanguage: Boolean(harmReductionState.plainLanguage),
  };
}

export function resetHarmReductionState() {
  harmReductionState.plainLanguage = false;
  if (typeof activeHarmReset === 'function') {
    activeHarmReset();
  }
}

export function buildXylazineActionCard({ plainLanguage = false } = {}) {
  const isEs = getLang() === 'es';
  return h('article', {
    class: 'card print-handout xylazine-action-card',
    id: 'xylazine-action-card',
    'aria-labelledby': 'xylazine-card-title',
  },
    h('div', { class: 'facility-head' },
      h('h3', { id: 'xylazine-card-title', class: 'facility-name' },
        icon('shield'), ' ',
        tr(
          'Xylazine / Medetomidine (“Tranq”) & Overdose Response Action Card',
          'Tarjeta de acción: Xilacina / Medetomidina (“Tranq”) y respuesta a sobredosis',
        )),
      h('span', { class: 'chip chip-extra' },
        tr('Printable Clinical & Harm Reduction Handout', 'Folleto clínico imprimible')),
    ),
    p(plainLanguage
      ? tr(
          'Street fentanyl is often mixed with heavy animal sedatives called xylazine ("tranq") or medetomidine. Here is how to save a life, treat severe withdrawal, and heal skin wounds without judgment.',
          'El fentanilo callejero suele estar mezclado con sedantes fuertes llamados xilacina ("tranq") o medetomidina. Así puede salvar una vida, tratar la abstinencia y cuidar heridas sin prejuicios.',
        )
      : tr(
          'Evidence-based clinical toxicology and harm reduction protocol for adulterated fentanyl supplies containing xylazine or medetomidine (central alpha-2 adrenergic agonists).',
          'Protocolo clínico de toxicología y reducción de daños para suministros de fentanilo adulterados con xilacina o medetomidina (agonistas alfa-2 adrenérgicos centrales).',
        )),
    h('ol', { class: 'steps' },
      XYLAZINE_ACTION_STEPS.map((item) => h('li', { class: 'step', id: `xylazine-step-${item.id}` },
        h('span', { class: 'step-num', 'aria-hidden': 'true' }, String(item.step)),
        h('div', { class: 'step-body' },
          h('h4', null, isEs ? item.titleEs : item.title),
          p(plainLanguage
            ? (isEs ? item.plainDetailEs : item.plainDetail)
            : (isEs ? item.clinicalDetailEs : item.clinicalDetail)),
        ),
      )),
    ),
    h('div', { class: 'actions no-print' },
      h('button', {
        type: 'button',
        class: 'btn btn-secondary btn-small',
        onclick: () => window.print(),
        'aria-label': tr('Print Xylazine and Medetomidine Action Card', 'Imprimir tarjeta de acción de xilacina y medetomidina'),
      }, icon('printer'), tr('Print this action card', 'Imprimir tarjeta de acción')),
      h('a', {
        class: 'btn btn-primary btn-small',
        href: '#/treatment?codes=NOE',
      }, icon('pin'), tr('Find free naloxone near me', 'Buscar naloxona gratuita cerca de mí')),
      h('a', {
        class: 'btn btn-secondary btn-small',
        href: '#/health?tab=clinics',
      }, icon('heart'), tr('Low-cost wound & primary care clinics', 'Clínicas de bajo costo para heridas y atención primaria')),
      h('a', {
        class: 'btn btn-ghost btn-small',
        href: '#/medications?substance=xylazine',
      }, icon('pill'), tr('Xylazine pharmacology & interactions', 'Farmacología e interacciones de la xilacina')),
    ),
  );
}

export function harmReductionView() {
  const plainSummarySlot = h('div', { id: 'harm-plain-summary-slot' });
  const xylazineCardSlot = h('div', { id: 'harm-xylazine-card-slot' });

  const plainToggleBtn = h('button', {
    type: 'button',
    id: 'harm-plain-language-toggle',
    class: 'preset',
    'aria-pressed': String(Boolean(harmReductionState.plainLanguage)),
    onclick: () => {
      harmReductionState.plainLanguage = !harmReductionState.plainLanguage;
      plainToggleBtn.setAttribute('aria-pressed', String(harmReductionState.plainLanguage));
      if (harmReductionState.plainLanguage) plainToggleBtn.setAttribute('aria-current', 'true');
      else plainToggleBtn.removeAttribute('aria-current');
      renderDynamicSections();
      announce(harmReductionState.plainLanguage
        ? tr('Plain-language 6th-grade reading level enabled.', 'Modo de lectura sencilla activado.')
        : tr('Standard clinical detail enabled.', 'Modo de detalle clínico estándar activado.'));
    },
  }, icon('info'), ' ', tr('Plain-language summary (6th-grade reading level)', 'Resumen en lenguaje sencillo'));

  function renderDynamicSections() {
    clear(plainSummarySlot);
    if (harmReductionState.plainLanguage) {
      plainSummarySlot.append(
        h('div', {
          class: 'callout callout-info plain-language-box',
          role: 'region',
          'aria-label': tr('Plain-language harm reduction summary', 'Resumen de reducción de daños en lenguaje sencillo'),
        },
          h('p', { class: 'callout-title' },
            icon('shield'),
            tr('In plain words: 5 ways to stay alive and safer tonight', 'En palabras sencillas: 5 pasos para mantenerse con vida y más seguro hoy')),
          ul([
            [strong(tr('1. Carry naloxone (Narcan): ', '1. Lleve naloxona (Narcan): ')), tr('It reverses fentanyl and opioid overdoses in 2–3 minutes and is sold at pharmacies without a prescription or free from local programs.', 'Revierte sobredosis de opioides y fentanilo en 2–3 minutos.')],
            [strong(tr('2. Never use alone: ', '2. No consuma a solas: ')), tr('Take turns with a trusted friend or call Never Use Alone (800-484-3731) so someone can send help if you pass out.', 'Tome turnos con alguien de confianza o llame a Never Use Alone (800-484-3731).')],
            [strong(tr('3. Give rescue breaths for "tranq" (xylazine/medetomidine): ', '3. Dé respiraciones de rescate para "tranq": ')), tr('Always give 1 spray of naloxone first AND give 1 breath every 5 seconds. Once they breathe on their own, stop giving extra naloxone.', 'Siempre dé naloxona primero y 1 respiración cada 5 segundos.')],
            [strong(tr('4. Care for wounds gently: ', '4. Cuide las heridas con suavidad: ')), tr('Wash with saline or soap and water, skip peroxide/alcohol, keep covered with ointment and a non-stick bandage, and mark red edges with a pen.', 'Lave con solución salina o agua y jabón, evite alcohol o agua oxigenada y use vendaje antiadherente.')],
            [strong(tr('5. Go slow after any break: ', '5. Empiece con poco después de una pausa: ')), tr('Even a few days in detox, hospital, or jail drops your tolerance fast.', 'Incluso unos pocos días sin consumir bajan su tolerancia rápidamente.')],
          ]),
        ),
      );
    }

    clear(xylazineCardSlot).append(
      buildXylazineActionCard({ plainLanguage: harmReductionState.plainLanguage }),
    );
  }

  activeHarmReset = () => {
    plainToggleBtn.setAttribute('aria-pressed', 'false');
    plainToggleBtn.removeAttribute('aria-current');
    renderDynamicSections();
  };

  renderDynamicSections();

  return h('div', { class: 'view view-prose' },
    pageHeader('Harm reduction',
      'Practical ways to stay safer, whether or not you want to stop using. No judgment and no requirement to quit.'),
    emergencyCallout(),
    h('div', { class: 'actions no-print' },
      plainToggleBtn,
      h('button', {
        type: 'button',
        class: 'btn btn-secondary btn-small',
        onclick: () => window.print(),
      }, icon('printer'), tr('Print Xylazine & Harm Reduction Handout', 'Imprimir guía de reducción de daños')),
      fine(tr('Reading mode is kept in your browser’s memory and cleared on Quick exit.', 'El modo de lectura se mantiene en la memoria de su navegador y se borra con Salida rápida.')),
    ),
    plainSummarySlot,
    tocNav([
      ['naloxone', 'Get naloxone'],
      ['xylazine-tranq', 'Xylazine & medetomidine ("tranq") action card'],
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

    section('xylazine-tranq', 'Xylazine & medetomidine (“tranq”) overdose, withdrawal & wound care',
      xylazineCardSlot,
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
        h('a', { href: '#/plan' }, 'Build a Personal Safety Plan that stays in this browser'), '.'),
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
      h('div', { class: 'table-wrap', tabindex: '0', role: 'region', 'aria-label': 'High-risk drug combinations and why' },
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
