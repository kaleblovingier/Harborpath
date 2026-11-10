// public/js/views/recoverySupport.js
// HarborPath "Life after treatment": recovery housing, peer recovery support,
// staying on medication, planning for a return to use, and recovery-ready work.
//
// Sources (checked November 2026 on each agency's own site):
// - SAMHSA, Best Practices for Recovery Housing (2023), PEP23-10-00-002.
//   Best Practice 9: no barriers to prescribed medications for behavioral or physical health.
//   Best Practice 6 and Table 1: NARR levels I (peer-run) to IV (clinical services on site).
//   Best Practice 4: patient brokering is a serious, life-threatening form of fraud.
// - SAMHSA, Peer Support Workers for Those in Recovery.
// - SAMHSA, Overdose Prevention and Response Toolkit (2023), PEP23-03-00-001:
//   use after a period of abstinence lowers tolerance and raises overdose risk.
// - U.S. Department of Justice, The ADA and Opioid Use Disorder (April 5, 2022).
// - U.S. Department of Labor, Recovery-Ready Workplace Resource Hub.
//
// Privacy: the checklist lives in module memory only. Nothing is written to
// storage, cookies, the URL, or the network, and Quick Exit resets it.

import { h, ext, icon } from '../dom.js';
import { getLang } from '../i18n.js';
import { hotlinesById } from '../content/hotlines.js';
import { pageHeader, section, p, fine, ul, strong, tocNav, resourceList, hotlineGrid, emergencyCallout } from './common.js';

const L = (pair) => (getLang() === 'es' ? pair.es : pair.en);

/** Official sources cited on this page. */
export const RECOVERY_SOURCES = Object.freeze([
  {
    id: 'samhsa-housing',
    href: 'https://library.samhsa.gov/product/best-practices-recovery-housing/pep23-10-00-002',
    name: { en: 'SAMHSA: Best Practices for Recovery Housing (2023)', es: 'SAMHSA: Mejores prácticas para la vivienda de recuperación (2023)' },
  },
  {
    id: 'samhsa-peers',
    href: 'https://www.samhsa.gov/substance-use/recovery/peer-support-workers',
    name: { en: 'SAMHSA: Peer support workers for those in recovery', es: 'SAMHSA: Trabajadores de apoyo entre pares para personas en recuperación' },
  },
  {
    id: 'samhsa-overdose-toolkit',
    href: 'https://library.samhsa.gov/product/overdose-prevention-response-toolkit/pep23-03-00-001',
    name: { en: 'SAMHSA: Overdose Prevention and Response Toolkit (2023)', es: 'SAMHSA: Guía de prevención y respuesta a sobredosis (2023)' },
  },
  {
    id: 'doj-ada-oud',
    href: 'https://www.ada.gov/resources/opioid-use-disorder',
    name: { en: 'U.S. Department of Justice: The ADA and Opioid Use Disorder (2022)', es: 'Departamento de Justicia de EE. UU.: La ADA y el trastorno por consumo de opioides (2022)' },
  },
  {
    id: 'dol-rrw',
    href: 'https://www.dol.gov/agencies/eta/RRW-hub',
    name: { en: 'U.S. Department of Labor: Recovery-Ready Workplace Resource Hub', es: 'Departamento de Trabajo de EE. UU.: Centro de recursos para lugares de trabajo que apoyan la recuperación' },
  },
]);

/** NARR levels of support, as summarized in SAMHSA Best Practices for Recovery Housing (2023), Table 1. */
export const NARR_LEVELS = Object.freeze([
  {
    level: 'I',
    name: { en: 'Level I: peer-run', es: 'Nivel I: dirigida por pares' },
    desc: {
      en: 'Residents run the home together and make decisions democratically. There is no paid staff on site. Oxford Houses are a well-known example.',
      es: 'Los residentes administran la casa juntos y toman decisiones de forma democrática. No hay personal pagado en el lugar. Las Oxford House son un ejemplo conocido.',
    },
  },
  {
    level: 'II',
    name: { en: 'Level II: monitored', es: 'Nivel II: supervisión básica' },
    desc: {
      en: 'A house manager or senior resident oversees the home, with house rules and peer accountability.',
      es: 'Un administrador o residente con más experiencia supervisa la casa, con reglas de convivencia y responsabilidad entre pares.',
    },
  },
  {
    level: 'III',
    name: { en: 'Level III: supervised', es: 'Nivel III: supervisada' },
    desc: {
      en: 'Paid staff, such as a house manager and certified peer recovery support, plus more structure and life-skills help.',
      es: 'Personal pagado, como un administrador y apoyo de pares certificado, con más estructura y ayuda para habilidades de la vida diaria.',
    },
  },
  {
    level: 'IV',
    name: { en: 'Level IV: service provider', es: 'Nivel IV: con servicios clínicos' },
    desc: {
      en: 'Housing connected to a treatment provider, with clinical services on site.',
      es: 'Vivienda vinculada a un proveedor de tratamiento, con servicios clínicos en el lugar.',
    },
  },
]);

/** Questions to ask a recovery home before moving in. */
export const HOUSING_QUESTIONS = Object.freeze([
  { en: 'Is the home certified by your state’s NARR affiliate, chartered by Oxford House, or licensed by the state?', es: '¿La casa está certificada por la filial de NARR de su estado, autorizada por Oxford House o con licencia del estado?' },
  { en: 'Can I keep taking my prescribed medication, including buprenorphine or methadone? Will you put that in writing?', es: '¿Puedo seguir tomando mis medicamentos recetados, incluidas la buprenorfina o la metadona? ¿Me lo pueden confirmar por escrito?' },
  { en: 'What does it cost each week or month, and what does that include? Is there a written agreement?', es: '¿Cuánto cuesta por semana o por mes y qué incluye? ¿Hay un acuerdo por escrito?' },
  { en: 'What are the house rules, and what happens if someone returns to use?', es: '¿Cuáles son las reglas de la casa y qué pasa si alguien vuelve a consumir?' },
  { en: 'Is there naloxone in the house, and do residents know how to use it?', es: '¿Hay naloxona en la casa y los residentes saben cómo usarla?' },
  { en: 'Am I free to choose my own treatment program, doctor, and pharmacy?', es: '¿Puedo elegir libremente mi propio programa de tratamiento, médico y farmacia?' },
]);

/** Warning signs of recovery-housing fraud and patient brokering. */
export const HOUSING_RED_FLAGS = Object.freeze([
  { en: 'Free rent, free travel, cash, or gifts if you enroll in a particular treatment program.', es: 'Alquiler gratis, viaje gratis, dinero o regalos si se inscribe en un programa de tratamiento específico.' },
  { en: 'You are told you must attend one specific outpatient program or lab, or you will lose your bed.', es: 'Le dicen que debe acudir a un programa ambulatorio o laboratorio específico o perderá su cama.' },
  { en: 'Someone else holds your ID, insurance card, phone, or medication without your agreement.', es: 'Otra persona guarda su identificación, tarjeta de seguro, teléfono o medicamentos sin su consentimiento.' },
  { en: 'No written agreement, no address before you arrive, or pressure to move in today.', es: 'No hay acuerdo por escrito, no le dan la dirección antes de llegar o lo presionan para mudarse hoy mismo.' },
  { en: 'You are told to stop prescribed medication to live there.', es: 'Le dicen que deje sus medicamentos recetados para poder vivir allí.' },
]);

/** Steps for a plan in case of a return to use. */
export const RETURN_TO_USE_PLAN = Object.freeze([
  {
    lead: { en: 'Your tolerance drops fast. ', es: 'Su tolerancia baja rápidamente. ' },
    body: {
      en: 'After time in treatment, detox, a hospital, or jail, an amount you used before can now cause an overdose. If you use, start with much less and go slowly.',
      es: 'Después de un tiempo en tratamiento, desintoxicación, un hospital o la cárcel, una cantidad que antes consumía ahora puede causar una sobredosis. Si consume, empiece con mucho menos y vaya despacio.',
    },
  },
  {
    lead: { en: 'Keep naloxone close. ', es: 'Tenga naloxona a mano. ' },
    body: {
      en: 'Carry it, keep some where you live, and show the people around you where it is.',
      es: 'Llévela con usted, guarde una en su casa y muestre a las personas cercanas dónde está.',
    },
  },
  {
    lead: { en: 'Don’t use alone. ', es: 'No consuma a solas. ' },
    body: {
      en: 'If you can’t be with someone, call a line like Never Use Alone or SafeSpot first. They stay on the line and arrange help if you stop responding.',
      es: 'Si no puede estar con alguien, llame primero a una línea como Never Use Alone o SafeSpot. Se quedan en la línea y buscan ayuda si usted deja de responder.',
    },
  },
  {
    lead: { en: 'Test what you use. ', es: 'Analice lo que consume. ' },
    body: {
      en: 'Fentanyl test strips can show whether fentanyl is present. A negative strip does not mean a drug is safe.',
      es: 'Las tiras reactivas de fentanilo pueden mostrar si hay fentanilo. Un resultado negativo no significa que la droga sea segura.',
    },
  },
  {
    lead: { en: 'Reach out early. ', es: 'Pida apoyo pronto. ' },
    body: {
      en: 'Call your prescriber, counselor, peer coach, or sponsor. A return to use is common and does not erase your progress. It is a reason to adjust your plan, not to give up.',
      es: 'Llame a quien le receta sus medicamentos, a su consejero, a su coach de recuperación o a su padrino o madrina. Volver a consumir es común y no borra su progreso. Es una razón para ajustar su plan, no para rendirse.',
    },
  },
  {
    lead: { en: 'Know your housing rules. ', es: 'Conozca las reglas de su vivienda. ' },
    body: {
      en: 'Many recovery homes, including Oxford Houses, ask residents to leave after a return to use. Know ahead of time where you could stay so you are not alone or on the street.',
      es: 'Muchas viviendas de recuperación, incluidas las Oxford House, piden a los residentes que se vayan si vuelven a consumir. Piense de antemano dónde podría quedarse para no estar a solas ni en la calle.',
    },
  },
]);

/** Items in the private, in-memory checklist. */
export const CHECKLIST_ITEMS = Object.freeze([
  { id: 'naloxone', en: 'I know where my naloxone is, and the people around me do too.', es: 'Sé dónde está mi naloxona, y las personas cercanas también lo saben.' },
  { id: 'plan', en: 'I have a plan if I return to use: who I will call and how I will avoid using alone.', es: 'Tengo un plan si vuelvo a consumir: a quién llamaré y cómo evitaré consumir a solas.' },
  { id: 'medication', en: 'My housing allows my prescribed medication, and I have that in writing.', es: 'Mi vivienda permite mis medicamentos recetados y lo tengo por escrito.' },
  { id: 'rules', en: 'I know my house rules, costs, and what happens after a return to use.', es: 'Conozco las reglas, los costos de mi casa y qué pasa si vuelvo a consumir.' },
  { id: 'peer', en: 'I have a peer, coach, sponsor, or group I can contact this week.', es: 'Tengo un par, coach, padrino o madrina, o un grupo con quien puedo comunicarme esta semana.' },
  { id: 'appointment', en: 'My next appointment with a prescriber, counselor, or clinic is on my calendar.', es: 'Mi próxima cita con quien me receta, mi consejero o la clínica está en mi calendario.' },
  { id: 'numbers', en: 'I have 988 and the SAMHSA National Helpline saved in my phone.', es: 'Tengo el 988 y la Línea Nacional de Ayuda de SAMHSA guardados en mi teléfono.' },
  { id: 'work', en: 'I have thought about work or school and what support I might ask for.', es: 'He pensado en el trabajo o los estudios y en qué apoyo podría pedir.' },
]);

// ---------------------------------------------------------------- In-memory state
let checked = new Set();

export function getRecoverySupportState() {
  return { checked: [...checked] };
}

export function setRecoveryChecklistItem(id, on) {
  if (!CHECKLIST_ITEMS.some((item) => item.id === id)) return getRecoverySupportState();
  if (on) checked.add(id);
  else checked.delete(id);
  return getRecoverySupportState();
}

/** Clears the checklist. Registered with Quick Exit. */
export function resetRecoverySupportState() {
  checked = new Set();
}

function checklistStatus() {
  const n = checked.size;
  const total = CHECKLIST_ITEMS.length;
  return getLang() === 'es' ? `${n} de ${total} listos` : `${n} of ${total} done`;
}

function privateChecklist() {
  const status = h('p', { class: 'fine', role: 'status', 'aria-live': 'polite' }, checklistStatus());
  const choices = CHECKLIST_ITEMS.map((item) => {
    const id = `recovery-check-${item.id}`;
    const input = h('input', {
      type: 'checkbox',
      id,
      checked: checked.has(item.id),
      onchange: (e) => {
        setRecoveryChecklistItem(item.id, e.target.checked);
        status.textContent = checklistStatus();
      },
    });
    return h('label', { class: 'choice', for: id }, input,
      h('span', { class: 'choice-text' }, h('span', { class: 'choice-label' }, L(item))));
  });
  return h('fieldset', { class: 'choice-group' },
    h('legend', null, L({ en: 'My next steps', es: 'Mis próximos pasos' })),
    h('p', { class: 'help fine' }, icon('lock'), ' ', L({
      en: 'This list stays in this tab’s memory only. It is not saved, sent, or stored on your device, and Quick Exit clears it.',
      es: 'Esta lista solo se guarda en la memoria de esta pestaña. No se guarda, no se envía ni se almacena en su dispositivo, y Salida rápida la borra.',
    })),
    h('div', { class: 'choice-grid' }, choices),
    status,
  );
}

function printButton() {
  return h('button', {
    type: 'button',
    class: 'btn btn-secondary no-print',
    onclick: () => window.print(),
  }, icon('printer'), L({ en: 'Print this page', es: 'Imprimir esta página' }));
}

export function recoverySupportView() {
  const es = getLang() === 'es';
  const link = (href, en, esText) => h('a', { href }, es ? esText : en);

  return h('div', { class: 'view view-prose recovery-support-view' },
    pageHeader(
      L({ en: 'Life after treatment', es: 'La vida después del tratamiento' }),
      L({
        en: 'Practical help for the months after treatment: a safe place to live, people who have been there, staying on your medication, work, and a plan for hard days.',
        es: 'Ayuda práctica para los meses después del tratamiento: un lugar seguro donde vivir, personas que han pasado por lo mismo, seguir con su medicamento, el trabajo y un plan para los días difíciles.',
      }),
    ),

    emergencyCallout(),
    hotlineGrid(hotlinesById('988', 'samhsa')),

    tocNav([
      ['housing', L({ en: 'Recovery housing', es: 'Vivienda de recuperación' })],
      ['medication', L({ en: 'Medication in recovery housing', es: 'Medicamentos en la vivienda de recuperación' })],
      ['peers', L({ en: 'Peer recovery support', es: 'Apoyo de pares en la recuperación' })],
      ['mutual-aid', L({ en: 'Mutual-aid groups', es: 'Grupos de ayuda mutua' })],
      ['return-to-use', L({ en: 'If you return to use', es: 'Si vuelve a consumir' })],
      ['work', L({ en: 'Work and recovery', es: 'Trabajo y recuperación' })],
      ['checklist', L({ en: 'My private checklist', es: 'Mi lista privada' })],
      ['sources', L({ en: 'Sources', es: 'Fuentes' })],
    ]),

    section('housing', L({ en: 'Recovery housing', es: 'Vivienda de recuperación' }),
      p(L({
        en: 'Recovery housing (also called recovery residences or sober living) is a safe, substance-free home shared with other people in recovery. Good homes are clear about rules and costs, support your treatment choices, and help you build a life in your community.',
        es: 'La vivienda de recuperación (también llamada residencia de recuperación o vivienda sobria) es un hogar seguro y libre de sustancias que se comparte con otras personas en recuperación. Las buenas casas son claras sobre sus reglas y costos, respetan sus decisiones de tratamiento y le ayudan a construir una vida en su comunidad.',
      })),
      h('h3', null, L({ en: 'Levels of support', es: 'Niveles de apoyo' })),
      p(L({
        en: 'The National Alliance for Recovery Residences (NARR) describes four levels. More support is not always better; choose what fits you now.',
        es: 'La Alianza Nacional de Residencias de Recuperación (NARR) describe cuatro niveles. Más apoyo no siempre es mejor; elija lo que le sirva ahora.',
      })),
      h('dl', { class: 'glossary' }, NARR_LEVELS.flatMap((lvl) => [
        h('dt', null, L(lvl.name)),
        h('dd', null, L(lvl.desc)),
      ])),
      p(strong(L({ en: 'Certified homes. ', es: 'Casas certificadas. ' })), L({
        en: 'In many states, a NARR affiliate certifies homes that meet national standards. Oxford House charters its own self-run, self-supporting homes, where residents share expenses and there is no set time limit on how long you can stay.',
        es: 'En muchos estados, una filial de NARR certifica las casas que cumplen las normas nacionales. Oxford House autoriza sus propias casas autogestionadas y autosuficientes, donde los residentes comparten los gastos y no hay un límite fijo de tiempo para quedarse.',
      })),
      resourceList([
        { name: 'NARR', href: 'https://narronline.org/', desc: L({ en: 'National standards and links to state affiliates that certify homes.', es: 'Normas nacionales y enlaces a las filiales estatales que certifican casas.' }) },
        { name: 'Oxford House', href: 'https://oxfordhouse.org/', desc: L({ en: 'Self-run recovery homes, with a vacancy locator and online application.', es: 'Casas de recuperación autogestionadas, con buscador de vacantes y solicitud en línea.' }) },
      ]),
      p(h('a', { class: 'btn btn-secondary', href: '#/treatment?codes=HH' }, L({ en: 'Find housing services listed with SAMHSA', es: 'Buscar servicios de vivienda registrados en SAMHSA' }))),
      h('h3', null, L({ en: 'Questions to ask before you move in', es: 'Preguntas antes de mudarse' })),
      h('ol', { class: 'checklist' }, HOUSING_QUESTIONS.map((q) => h('li', null, L(q)))),
      h('h3', null, L({ en: 'Warning signs of housing fraud', es: 'Señales de fraude en la vivienda' })),
      p(L({
        en: 'SAMHSA calls patient brokering, paying someone to bring in residents or patients, one of the most serious and life-threatening kinds of treatment fraud. Be careful if you see:',
        es: 'SAMHSA considera que el corretaje de pacientes, es decir, pagar a alguien para atraer residentes o pacientes, es uno de los tipos de fraude en el tratamiento más graves y peligrosos para la vida. Tenga cuidado si ve lo siguiente:',
      })),
      h('ul', { class: 'flag-list' }, HOUSING_RED_FLAGS.map((f) => h('li', null, icon('alert'), L(f)))),
      p(L({ en: 'For more red flags and how to report fraud, see ', es: 'Para más señales de alerta y cómo denunciar un fraude, consulte ' }),
        link('#/choosing-care', 'Choosing quality care', 'Cómo elegir atención de calidad'), '.'),
    ),

    section('medication', L({ en: 'Staying on your medication in recovery housing', es: 'Seguir con su medicamento en la vivienda de recuperación' }),
      p(L({
        en: 'Medications for opioid use disorder (buprenorphine, methadone, and naltrexone) can be lifesaving. SAMHSA’s 2023 best practices say recovery homes should not put barriers or restrictions on residents using prescribed medications for behavioral or physical health conditions. Good homes keep medication safe with lock boxes and counts instead of turning people away.',
        es: 'Los medicamentos para el trastorno por consumo de opioides (buprenorfina, metadona y naltrexona) pueden salvar vidas. Las mejores prácticas de SAMHSA de 2023 indican que las viviendas de recuperación no deben poner barreras ni restricciones a los residentes que usan medicamentos recetados para su salud física o mental. Las buenas casas protegen los medicamentos con cajas con llave y conteos, en lugar de rechazar a las personas.',
      })),
      p(L({
        en: 'The U.S. Department of Justice explains that the Americans with Disabilities Act (ADA) generally protects people in treatment or recovery from opioid use disorder, including people taking prescribed medication, as long as they are not currently using drugs illegally. The ADA does not protect current illegal drug use.',
        es: 'El Departamento de Justicia de EE. UU. explica que la Ley de Estadounidenses con Discapacidades (ADA) en general protege a las personas en tratamiento o en recuperación del trastorno por consumo de opioides, incluidas las que toman medicamentos recetados, siempre que no estén consumiendo drogas de forma ilegal. La ADA no protege el consumo ilegal actual.',
      })),
      p(L({
        en: 'If a home, program, or service turns you away only because you take prescribed medication, you can ask a legal aid or fair housing office for advice. You can report possible discrimination to the ',
        es: 'Si una casa, un programa o un servicio lo rechaza solo porque toma un medicamento recetado, puede pedir asesoría a una oficina de asistencia legal o de vivienda justa. Puede denunciar una posible discriminación ante el ',
      }),
      ext('https://civilrights.justice.gov/report/', L({ en: 'Department of Justice', es: 'Departamento de Justicia' })),
      L({ en: ' or, for housing, to ', es: ' o, en materia de vivienda, ante ' }),
      ext('https://www.hud.gov/reporthousingdiscrimination', 'HUD'), '.'),
      p(L({ en: 'Compare medications in our ', es: 'Compare los medicamentos en nuestra ' }),
        link('#/medications', 'Medications & interactions guide', 'guía de medicamentos e interacciones'), '.'),
      fine(L({ en: 'This is general information, not legal advice.', es: 'Esta es información general, no asesoría legal.' })),
    ),

    section('peers', L({ en: 'Peer recovery support and recovery community organizations', es: 'Apoyo de pares y organizaciones comunitarias de recuperación' }),
      p(L({
        en: 'Peer support workers, sometimes called recovery coaches, are people who have been through recovery themselves and help others become and stay engaged in recovery. They offer understanding, respect, and encouragement from someone who has been there.',
        es: 'Los trabajadores de apoyo entre pares, a veces llamados coaches de recuperación, son personas que han vivido su propia recuperación y ayudan a otras a iniciar el proceso y mantenerse en él. Ofrecen comprensión, respeto y ánimo de alguien que ha pasado por lo mismo.',
      })),
      p(L({
        en: 'Recovery community organizations (RCOs) are local or statewide recovery-centered groups. Many offer peer recovery support services, community education, and advocacy. Ask what they offer near you.',
        es: 'Las organizaciones comunitarias de recuperación (RCO, por sus siglas en inglés) son grupos locales o estatales centrados en la recuperación. Muchas ofrecen servicios de apoyo entre pares, educación comunitaria y defensa de derechos. Pregunte qué ofrecen cerca de usted.',
      })),
      resourceList([
        { name: 'Faces & Voices of Recovery: ARCO', href: 'https://facesandvoicesofrecovery.org/arco-members-on-the-map/', desc: L({ en: 'Map of recovery community organizations in the Association of Recovery Community Organizations.', es: 'Mapa de las organizaciones comunitarias de recuperación que forman parte de la Asociación de Organizaciones Comunitarias de Recuperación (ARCO).' }) },
      ]),
      p(h('a', { class: 'btn btn-secondary', href: '#/treatment?codes=PEER' }, L({ en: 'Find programs with peer support', es: 'Buscar programas con apoyo de pares' }))),
    ),

    section('mutual-aid', L({ en: 'Mutual-aid groups', es: 'Grupos de ayuda mutua' }),
      p(L({
        en: 'Free groups like SMART Recovery, AA, NA, Recovery Dharma, and LifeRing meet in person and online. Different groups work for different people, so it is fine to try a few. Use our meeting finder on the ',
        es: 'Grupos gratuitos como SMART Recovery, AA, NA, Recovery Dharma y LifeRing se reúnen en persona y en línea. Distintos grupos sirven a distintas personas, así que está bien probar varios. Use nuestro buscador de reuniones en la página de ',
      }),
      link('#/support', 'Recovery & family support page', 'Apoyo para la recuperación y la familia'), '.'),
    ),

    section('return-to-use', L({ en: 'Planning for a return to use', es: 'Un plan por si vuelve a consumir' }),
      p(L({
        en: 'Planning ahead is not expecting to fail. It keeps you alive and connected if a hard day comes.',
        es: 'Planificar no significa esperar fracasar. Le ayuda a mantenerse con vida y conectado si llega un día difícil.',
      })),
      ul(RETURN_TO_USE_PLAN.map((step) => [strong(L(step.lead)), L(step.body)])),
      hotlineGrid(hotlinesById('never-use-alone', 'safespot')),
      p(
        h('a', { class: 'btn btn-secondary', href: '#/overdose' }, L({ en: 'Overdose response steps', es: 'Pasos ante una sobredosis' })),
        ' ',
        h('a', { class: 'btn btn-ghost', href: '#/harm-reduction' }, L({ en: 'Naloxone and test strips', es: 'Naloxona y tiras reactivas' })),
      ),
    ),

    section('work', L({ en: 'Work and recovery', es: 'Trabajo y recuperación' }),
      p(L({
        en: 'The U.S. Department of Labor describes a recovery-ready workplace as one that hires people in recovery, makes it easier for workers to get help, connects them to treatment and recovery support, and tells employees about accommodations and protections that can help them keep their jobs.',
        es: 'El Departamento de Trabajo de EE. UU. describe un lugar de trabajo que apoya la recuperación como uno que contrata a personas en recuperación, facilita que los trabajadores pidan ayuda, los conecta con tratamiento y apoyo, e informa a los empleados sobre adaptaciones y protecciones que pueden ayudarles a conservar su empleo.',
      })),
      p(L({ en: 'Learn about leave, accommodations, and medication at work in ', es: 'Conozca sus derechos sobre licencias, adaptaciones y medicamentos en el trabajo en ' }),
        link('#/workplace-rights', 'Workplace rights, FMLA & ADA', 'Derechos laborales, FMLA y ADA'), '.'),
    ),

    section('checklist', L({ en: 'My private checklist', es: 'Mi lista privada' }),
      privateChecklist(),
      p(printButton()),
    ),

    section('sources', L({ en: 'Sources', es: 'Fuentes' }),
      h('ul', { class: 'list' }, RECOVERY_SOURCES.map((s) => h('li', null, ext(s.href, L(s.name))))),
      fine(L({
        en: 'HarborPath does not endorse or receive payment from any home or program.',
        es: 'HarborPath no respalda ni recibe pagos de ninguna casa ni programa.',
      })),
    ),
  );
}
