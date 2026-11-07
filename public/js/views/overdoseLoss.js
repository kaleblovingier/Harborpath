// public/js/views/overdoseLoss.js
// HarborPath "After an overdose death": practical first steps, records,
// protecting others at home, talking with children, grief support, stigma,
// and how to help a friend who is grieving.
//
// Sources (checked November 2026 on each organization's own site):
// - CDC NCHS, Provisional Drug Overdose Death Counts: overdose deaths are often
//   first reported as "pending investigation" and need lengthy investigation,
//   including toxicology testing.
// - CDC NCHS, Where to Write for Vital Records (state vital records offices).
// - CDC, How Right Now: Grief (coping tips; 988 for anyone struggling).
// - SAMHSA, Overdose Prevention and Response Toolkit (2023), PEP23-03-00-001.
// - DEA, Take Back Day and year-round authorized collector search.
// - FDA, Disposal of Unused Medicines: What You Should Know.
// - 988 Suicide & Crisis Lifeline (call or text 988; Spanish: press 2 or text AYUDA).
// - GRASP (grasphelp.org) and The Compassionate Friends (compassionatefriends.org,
//   877-969-0010 as listed on its own contact page).
// - The Dougy Center, Supporting Children and Teens When Someone Dies of Substance Use.
//
// State laws and timelines differ; this page makes no state-specific claims.
// Nothing here is stored: the view keeps no answers and uses no device storage.

import { h, ext, tel, icon } from '../dom.js';
import { getLang } from '../i18n.js';
import { hotlinesById } from '../content/hotlines.js';
import { pageHeader, section, p, fine, ul, strong, tocNav, resourceList, hotlineGrid, emergencyCallout } from './common.js';

const L = (pair) => (getLang() === 'es' ? pair.es : pair.en);

/** The Compassionate Friends national office, as listed on compassionatefriends.org/contact (November 2026). */
export const TCF_PHONE = Object.freeze({ number: '18779690010', label: '877-969-0010' });

/** Official and organizational sources cited on this page. */
export const LOSS_SOURCES = Object.freeze([
  {
    id: 'cdc-provisional',
    href: 'https://www.cdc.gov/nchs/nvss/vsrr/drug-overdose-data.htm',
    name: { en: 'CDC: Provisional drug overdose death counts', es: 'CDC: Conteos provisionales de muertes por sobredosis' },
  },
  {
    id: 'cdc-vital-records',
    href: 'https://www.cdc.gov/nchs/w2w/index.htm',
    name: { en: 'CDC: Where to write for vital records', es: 'CDC: Dónde solicitar registros vitales' },
  },
  {
    id: 'cdc-grief',
    href: 'https://www.cdc.gov/howrightnow/emotion/grief/index.html',
    name: { en: 'CDC: Coping with grief', es: 'CDC: Cómo sobrellevar el duelo' },
  },
  {
    id: 'samhsa-overdose-toolkit',
    href: 'https://library.samhsa.gov/product/overdose-prevention-response-toolkit/pep23-03-00-001',
    name: { en: 'SAMHSA: Overdose Prevention and Response Toolkit (2023)', es: 'SAMHSA: Guía de prevención y respuesta a sobredosis (2023)' },
  },
  {
    id: 'dea-take-back',
    href: 'https://www.dea.gov/takebackday',
    name: { en: 'DEA: National Prescription Drug Take Back Day', es: 'DEA: Día Nacional de Devolución de Medicamentos Recetados' },
  },
  {
    id: 'fda-disposal',
    href: 'https://www.fda.gov/drugs/safe-disposal-medicines/disposal-unused-medicines-what-you-should-know',
    name: { en: 'FDA: Disposal of unused medicines', es: 'FDA: Cómo desechar medicamentos que no se usan' },
  },
  {
    id: '988',
    href: 'https://988lifeline.org/get-help/',
    name: { en: '988 Suicide & Crisis Lifeline', es: '988 Línea de Prevención del Suicidio y Crisis' },
  },
]);

/** First practical steps, in order. */
export const FIRST_STEPS = Object.freeze([
  {
    lead: { en: 'Call 911. ', es: 'Llame al 911. ' },
    body: {
      en: 'Call even if you think the person has died. If there is any chance they are alive, give naloxone and follow the dispatcher’s instructions. Emergency responders, police, and a medical examiner or coroner usually respond to any sudden death. This is routine.',
      es: 'Llame aunque crea que la persona ha fallecido. Si existe alguna posibilidad de que esté con vida, administre naloxona y siga las instrucciones de quien atiende la llamada. En toda muerte repentina suelen acudir los servicios de emergencia, la policía y un médico forense o la oficina del forense (coroner). Es un procedimiento de rutina.',
    },
  },
  {
    lead: { en: 'Ask for names and a case number. ', es: 'Pida nombres y un número de caso. ' },
    body: {
      en: 'Write down the name and phone number of the medical examiner’s or coroner’s investigator and the case number. You will need them later.',
      es: 'Anote el nombre y el teléfono del investigador del médico forense o de la oficina del forense, y el número de caso. Los necesitará más adelante.',
    },
  },
  {
    lead: { en: 'Choose a funeral home. ', es: 'Elija una funeraria. ' },
    body: {
      en: 'The funeral home works with the medical examiner or coroner to bring your loved one into their care. You do not have to decide everything on the first day.',
      es: 'La funeraria coordina con el médico forense o la oficina del forense para hacerse cargo de su ser querido. No tiene que decidirlo todo el primer día.',
    },
  },
  {
    lead: { en: 'Let someone help. ', es: 'Deje que alguien le ayude. ' },
    body: {
      en: 'Ask a friend or relative to make calls, bring food, or sit with you. You do not have to do this alone.',
      es: 'Pida a un amigo o familiar que haga llamadas, lleve comida o le acompañe. No tiene que pasar por esto a solas.',
    },
  },
]);

/** Ways to help a friend who lost someone to an overdose. */
export const HELPING_A_FRIEND = Object.freeze([
  { en: 'Say the person’s name and share a memory. Silence can feel like everyone has forgotten.', es: 'Diga el nombre de la persona y comparta un recuerdo. El silencio puede hacer sentir que todos la olvidaron.' },
  { en: 'Skip “at least” and “everything happens for a reason.” Try: “I’m so sorry. I’m here.”', es: 'Evite frases como “al menos” o “todo pasa por algo”. Pruebe con: “Lo siento mucho. Aquí estoy”.' },
  { en: 'Don’t ask for details about the drugs or blame anyone. How someone died does not change that they were loved.', es: 'No pregunte detalles sobre las drogas ni culpe a nadie. La forma en que alguien murió no cambia que era una persona querida.' },
  { en: 'Offer specific help: a meal, a ride, childcare, help with phone calls or paperwork.', es: 'Ofrezca ayuda concreta: una comida, transporte, cuidar a los niños, ayudar con llamadas o trámites.' },
  { en: 'Check in after the funeral, and on birthdays and anniversaries. Grief lasts longer than the first weeks.', es: 'Comuníquese después del funeral, en cumpleaños y aniversarios. El duelo dura más que las primeras semanas.' },
  { en: 'If they also use drugs, make sure they have naloxone and are not using alone.', es: 'Si la persona también consume drogas, asegúrese de que tenga naloxona y no consuma a solas.' },
]);

export function overdoseLossView() {
  const es = getLang() === 'es';
  const link = (href, en, esText) => h('a', { href }, es ? esText : en);

  return h('div', { class: 'view view-prose overdose-loss-view' },
    pageHeader(
      L({ en: 'After an overdose death', es: 'Después de una muerte por sobredosis' }),
      L({
        en: 'We are so sorry. This page walks through the first practical steps, keeping others safe, talking with children, and finding people who understand this kind of loss.',
        es: 'Lo sentimos mucho. Esta página explica los primeros pasos prácticos, cómo proteger a otras personas, cómo hablar con los niños y dónde encontrar a quienes entienden este tipo de pérdida.',
      }),
    ),

    h('div', { class: 'callout callout-info' },
      h('p', { class: 'callout-title' }, icon('heart'), L({ en: 'If grief feels unbearable', es: 'Si el dolor se vuelve insoportable' })),
      p(L({
        en: 'Grief after a sudden death can be overwhelming. If you have thoughts of ending your life or of not wanting to be here, please reach out now. That is not a weakness. Call or text 988 any time, day or night. If you are in immediate danger, call 911.',
        es: 'El duelo después de una muerte repentina puede ser abrumador. Si tiene pensamientos de quitarse la vida o de no querer estar aquí, por favor pida ayuda ahora. No es una debilidad. Llame o envíe un mensaje de texto al 988 a cualquier hora del día o de la noche. Si está en peligro inmediato, llame al 911.',
      })),
    ),
    hotlineGrid(hotlinesById('988', 'crisis-text-line')),
    emergencyCallout(),

    tocNav([
      ['first-steps', L({ en: 'The first hours', es: 'Las primeras horas' })],
      ['records', L({ en: 'Toxicology and death certificates', es: 'Toxicología y actas de defunción' })],
      ['household', L({ en: 'Protecting others at home', es: 'Proteger a otras personas en casa' })],
      ['children', L({ en: 'Talking with children', es: 'Hablar con los niños' })],
      ['grief-support', L({ en: 'Grief support', es: 'Apoyo en el duelo' })],
      ['self-care', L({ en: 'Stigma and caring for yourself', es: 'El estigma y el cuidado propio' })],
      ['helping-friend', L({ en: 'Helping a friend', es: 'Cómo ayudar a un amigo' })],
      ['sources', L({ en: 'Sources', es: 'Fuentes' })],
    ]),

    section('first-steps', L({ en: 'The first hours and days', es: 'Las primeras horas y días' }),
      ul(FIRST_STEPS.map((s) => [strong(L(s.lead)), L(s.body)])),
      fine(L({
        en: 'Rules and timelines differ by state and county. The investigator or funeral home can tell you what happens where you live.',
        es: 'Las normas y los plazos varían según el estado y el condado. El investigador o la funeraria pueden explicarle cómo funciona donde usted vive.',
      })),
    ),

    section('records', L({ en: 'Toxicology results and death certificates', es: 'Resultados de toxicología y actas de defunción' }),
      p(L({
        en: 'When a death may involve drugs, the medical examiner or coroner usually orders toxicology tests. CDC notes that overdose deaths are often first reported with the cause “pending investigation” because these cases need lengthy investigation, including toxicology testing. Results can take weeks or months. Ask the investigator how long it usually takes and how you will be told.',
        es: 'Cuando una muerte podría estar relacionada con drogas, el médico forense o la oficina del forense suele pedir pruebas de toxicología. Los CDC señalan que las muertes por sobredosis a menudo se registran al principio con la causa “pendiente de investigación”, porque requieren una investigación larga que incluye pruebas de toxicología. Los resultados pueden tardar semanas o meses. Pregunte al investigador cuánto suele tardar y cómo le avisarán.',
      })),
      ul([
        [strong(L({ en: 'Order several certified copies. ', es: 'Pida varias copias certificadas. ' })), L({
          en: 'The funeral home usually files the death certificate and can order copies. Banks, insurance, employers, and benefit programs often ask for one.',
          es: 'La funeraria suele presentar el acta de defunción y puede pedir copias. Los bancos, las aseguradoras, los empleadores y los programas de beneficios a menudo la solicitan.',
        })],
        [strong(L({ en: 'A “pending” certificate can be updated. ', es: 'Un acta “pendiente” puede actualizarse. ' })), L({
          en: 'If the cause is still pending, the certificate is updated when the investigation is done. Ask the funeral home or vital records office how to get updated copies.',
          es: 'Si la causa sigue pendiente, el acta se actualiza cuando termina la investigación. Pregunte a la funeraria o a la oficina de registros vitales cómo obtener copias actualizadas.',
        })],
        [strong(L({ en: 'Your state’s vital records office ', es: 'La oficina de registros vitales de su estado ' })), L({ en: 'can also issue copies. Find it through ', es: 'también puede emitir copias. Encuéntrela en ' }),
          ext('https://www.cdc.gov/nchs/w2w/index.htm', L({ en: 'CDC: Where to write for vital records', es: 'CDC: Dónde solicitar registros vitales' })), '.'],
      ]),
    ),

    section('household', L({ en: 'Protecting others in the household', es: 'Proteger a otras personas del hogar' }),
      p(L({
        en: 'Grief is a time of high risk for anyone else in the home who uses drugs, especially anyone who used with the person who died. Gently make sure everyone is safe.',
        es: 'El duelo es un momento de alto riesgo para cualquier otra persona del hogar que consuma drogas, en especial quien haya consumido con la persona que falleció. Con delicadeza, asegúrese de que todos estén a salvo.',
      })),
      ul([
        [strong(L({ en: 'Keep naloxone in the home ', es: 'Tenga naloxona en casa ' })), L({ en: 'and make sure people know where it is and how to use it. ', es: 'y asegúrese de que todos sepan dónde está y cómo usarla. ' }),
          link('#/harm-reduction', 'Find naloxone', 'Encontrar naloxona'), '.'],
        [strong(L({ en: 'Tolerance and grief. ', es: 'Tolerancia y duelo. ' })), L({
          en: 'Someone who has cut back or stopped has a lower tolerance and a higher overdose risk if they use again. Encourage them not to use alone; overdose prevention lines can help.',
          es: 'Quien ha reducido o dejado el consumo tiene menos tolerancia y más riesgo de sobredosis si vuelve a consumir. Anímele a no consumir a solas; las líneas de prevención de sobredosis pueden ayudar.',
        })],
        [strong(L({ en: 'Dispose of leftover medicines. ', es: 'Deseche los medicamentos sobrantes. ' })), L({
          en: 'Take unused prescription medicines to a take-back site, such as many pharmacies or police stations. Search for a year-round ',
          es: 'Lleve los medicamentos recetados que no se usen a un lugar de devolución, como muchas farmacias o estaciones de policía. Busque un ',
        }),
          ext('https://apps.deadiversion.usdoj.gov/pubdispsearch', L({ en: 'DEA authorized collector', es: 'punto de recolección autorizado por la DEA' })),
          L({ en: ' or watch for ', es: ' disponible todo el año o espere el ' }),
          ext('https://www.dea.gov/takebackday', L({ en: 'Take Back Day', es: 'Día de Devolución' })),
          L({ en: '. If there is no take-back option, follow ', es: '. Si no hay opción de devolución, siga ' }),
          ext('https://www.fda.gov/drugs/safe-disposal-medicines/disposal-unused-medicines-what-you-should-know', L({ en: 'FDA’s disposal steps', es: 'los pasos de la FDA para desecharlos' })), '.'],
        [strong(L({ en: 'Other substances. ', es: 'Otras sustancias. ' })), L({
          en: 'If you find powders, pills, or other drugs, you do not have to handle them alone. Ask the investigator or your local health department what to do. Wear gloves if you can, wash your hands, and keep everything away from children and pets.',
          es: 'Si encuentra polvos, pastillas u otras drogas, no tiene que encargarse de ellos a solas. Pregunte al investigador o al departamento de salud local qué hacer. Use guantes si puede, lávese las manos y mantenga todo lejos de niños y mascotas.',
        })],
      ]),
      hotlineGrid(hotlinesById('never-use-alone', 'safespot')),
      p(h('a', { class: 'btn btn-secondary', href: '#/overdose' }, L({ en: 'Overdose response steps', es: 'Pasos ante una sobredosis' }))),
    ),

    section('children', L({ en: 'Talking with children', es: 'Hablar con los niños' }),
      p(L({
        en: 'Children usually sense when something is wrong. Honest, simple words help them feel safe.',
        es: 'Los niños suelen darse cuenta cuando algo anda mal. Las palabras sencillas y sinceras les ayudan a sentirse seguros.',
      })),
      ul([
        [strong(L({ en: 'Use the word “died.” ', es: 'Use la palabra “murió”. ' })), L({
          en: 'Phrases like “went to sleep” or “we lost them” can confuse or frighten young children.',
          es: 'Frases como “se quedó dormido” o “lo perdimos” pueden confundir o asustar a los niños pequeños.',
        })],
        [strong(L({ en: 'Keep it short and true. ', es: 'Sea breve y sincero. ' })), L({
          en: 'For example: “Dad had an illness called addiction. He took a drug that stopped his body from working, and he died.” Let their questions guide what else you share.',
          es: 'Por ejemplo: “Papá tenía una enfermedad llamada adicción. Consumió una droga que hizo que su cuerpo dejara de funcionar, y murió”. Deje que sus preguntas guíen lo demás que comparta.',
        })],
        [strong(L({ en: 'It was not their fault. ', es: 'No fue su culpa. ' })), L({
          en: 'Tell them clearly that nothing they said or did caused the death.',
          es: 'Dígales con claridad que nada de lo que dijeron o hicieron causó la muerte.',
        })],
        [strong(L({ en: 'It’s okay to say “I don’t know.” ', es: 'Está bien decir “no lo sé”. ' })), L({
          en: 'Children may ask the same questions many times. Keep the door open.',
          es: 'Los niños pueden hacer las mismas preguntas muchas veces. Mantenga la puerta abierta.',
        })],
        [strong(L({ en: 'Keep routines steady ', es: 'Mantenga las rutinas ' })), L({
          en: 'and let teachers or caregivers know, so others can support them too.',
          es: 'y avise a los maestros o cuidadores para que también puedan apoyarlos.',
        })],
      ]),
      fine(L({ en: 'Adapted from ', es: 'Adaptado de ' }),
        ext('https://www.dougy.org/assets/uploads/Supporting-Children-and-Teens-When-Someone-Dies-of-Substance-Use.pdf', L({
          en: 'The Dougy Center: Supporting children and teens when someone dies of substance use',
          es: 'The Dougy Center: Cómo apoyar a niños y adolescentes cuando alguien muere por consumo de sustancias',
        })), '.'),
    ),

    section('grief-support', L({ en: 'Grief support', es: 'Apoyo en el duelo' }),
      p(L({
        en: 'Talking with people who have lived through the same kind of loss can make it feel less lonely.',
        es: 'Hablar con personas que han vivido el mismo tipo de pérdida puede hacer que se sienta menos solo.',
      })),
      resourceList([
        {
          name: 'GRASP: Grief Recovery After Substance Passing',
          href: 'https://grasphelp.org/community/meetings/',
          desc: L({
            en: 'Peer support groups, in person and online, for people who have lost someone to addiction or overdose.',
            es: 'Grupos de apoyo entre pares, en persona y en línea, para quienes perdieron a alguien por adicción o sobredosis.',
          }),
        },
        {
          name: 'The Compassionate Friends',
          href: 'https://www.compassionatefriends.org/find-support/chapters/chapter-locator/',
          desc: L({
            en: 'Support for families after the death of a child of any age, from any cause. Local chapters and online communities.',
            es: 'Apoyo para familias después de la muerte de un hijo o hija de cualquier edad y por cualquier causa. Grupos locales y comunidades en línea.',
          }),
        },
      ]),
      p(L({ en: 'The Compassionate Friends national office: ', es: 'Oficina nacional de The Compassionate Friends: ' }),
        tel(TCF_PHONE.number, TCF_PHONE.label)),
      p(L({
        en: 'Counselors, faith communities, and hospice bereavement programs in your area may also offer grief groups. The SAMHSA National Helpline can help you find local mental health services.',
        es: 'Los consejeros, las comunidades de fe y los programas de duelo de los hospicios de su zona también pueden ofrecer grupos de duelo. La Línea Nacional de Ayuda de SAMHSA puede ayudarle a encontrar servicios de salud mental locales.',
      })),
      hotlineGrid(hotlinesById('samhsa')),
    ),

    section('self-care', L({ en: 'Stigma and caring for yourself', es: 'El estigma y el cuidado propio' }),
      p(L({
        en: 'People grieving an overdose death often face silence, judgment, or questions about how the person died. You may feel guilt, anger, relief, or all of these at once. These feelings are common. Your loved one mattered, and your grief deserves the same care as any other loss.',
        es: 'Quienes viven el duelo por una muerte por sobredosis a menudo enfrentan silencio, juicios o preguntas sobre cómo murió la persona. Puede sentir culpa, enojo, alivio o todo a la vez. Estos sentimientos son comunes. Su ser querido importaba, y su duelo merece el mismo cuidado que cualquier otra pérdida.',
      })),
      ul([
        L({ en: 'Lean on people you trust, or join a grief group in person or online.', es: 'Apóyese en personas de confianza o únase a un grupo de duelo en persona o en línea.' }),
        L({ en: 'Keep a simple routine: eat, drink water, and try to sleep at regular times.', es: 'Mantenga una rutina sencilla: coma, beba agua e intente dormir a horas regulares.' }),
        L({ en: 'Honor your loved one in a way that fits your family, faith, or culture.', es: 'Honre a su ser querido de una forma acorde con su familia, su fe o su cultura.' }),
        L({ en: 'Talk with a health care provider or counselor about how you are feeling.', es: 'Hable con un profesional de la salud o un consejero sobre cómo se siente.' }),
        L({ en: 'If you are in recovery yourself, tell your supports what happened and lean on them now.', es: 'Si usted también está en recuperación, cuente a su red de apoyo lo que pasó y apóyese en ella ahora.' }),
      ]),
      fine(L({ en: 'Coping tips adapted from ', es: 'Consejos adaptados de ' }),
        ext('https://www.cdc.gov/howrightnow/emotion/grief/index.html', L({ en: 'CDC: Coping with grief', es: 'CDC: Cómo sobrellevar el duelo' })),
        L({ en: '. For words that reduce stigma, see ', es: '. Para usar palabras que reducen el estigma, consulte ' }),
        link('#/support', 'Recovery & family support', 'Apoyo para la recuperación y la familia'), '.'),
    ),

    section('helping-friend', L({ en: 'How to help a friend who lost someone', es: 'Cómo ayudar a alguien que perdió a un ser querido' }),
      ul(HELPING_A_FRIEND.map((item) => L(item))),
      p(h('a', { class: 'btn btn-secondary', href: '#/family-support' }, L({ en: 'Family support guide', es: 'Guía de apoyo familiar' }))),
    ),

    section('sources', L({ en: 'Sources', es: 'Fuentes' }),
      h('ul', { class: 'list' }, LOSS_SOURCES.map((s) => h('li', null, ext(s.href, L(s.name))))),
      p(h('button', { type: 'button', class: 'btn btn-secondary no-print', onclick: () => window.print() },
        icon('printer'), L({ en: 'Print this page', es: 'Imprimir esta página' }))),
      fine(L({
        en: 'General information only. It is not legal or medical advice, and it does not replace guidance from the medical examiner, coroner, or funeral home where you live.',
        es: 'Solo información general. No es asesoría legal ni médica y no sustituye la orientación del médico forense, la oficina del forense o la funeraria de su localidad.',
      })),
    ),
  );
}
