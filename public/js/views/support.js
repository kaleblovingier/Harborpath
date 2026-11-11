import { h, ext } from '../dom.js';
import { getLang } from '../i18n.js';
import { mutualAidFinder } from '../components/mutualAidFinder.js';
import { setNavigatorHandoffState } from './navigatorHandoff.js';
import { pageHeader, section, p, ul, resourceList } from './common.js';

const tr = (en, es) => getLang() === 'es' ? es : en;

// Official meeting directories; links open only after the visitor chooses them.
// https://smartrecovery.org/family and https://www.mara-international.org/find-a-meeting
export const PEER_SUPPORT_DIRECTORY = Object.freeze([
  { name: 'SMART Recovery', href: 'https://meetings.smartrecovery.org/', en: 'Skills-based, secular support, online and in person.', es: 'Apoyo laico basado en habilidades, en línea y presencial.' },
  { name: 'Recovery Dharma', href: 'https://recoverydharma.org/', en: 'Peer support using Buddhist practices and meditation.', es: 'Apoyo entre pares con prácticas budistas y meditación.' },
  { name: 'Refuge Recovery', href: 'https://www.refugerecovery.org/', en: 'Buddhist-inspired recovery groups; explore the approach that fits you.', es: 'Grupos de recuperación inspirados en el budismo; elija el enfoque que le ayude.' },
  { name: 'Alcoholics Anonymous (AA)', href: 'https://www.aa.org/find-aa', en: '12-step support for people with alcohol problems.', es: 'Apoyo de 12 pasos para personas con problemas con el alcohol.' },
  { name: 'Narcotics Anonymous (NA)', href: 'https://na.org/meetingsearch/', en: '12-step recovery support; ask each group about its medication participation policies.', es: 'Apoyo de recuperación de 12 pasos; pregunte a cada grupo sus políticas sobre medicamentos.' },
  { name: 'Medication-Assisted Recovery Anonymous (MARA)', href: 'https://www.mara-international.org/find-a-meeting', en: 'Recovery meetings that welcome prescribed medications, including methadone and buprenorphine.', es: 'Reuniones que reciben a personas que toman medicamentos recetados, incluidas metadona y buprenorfina.' },
  { name: 'LifeRing Secular Recovery', href: 'https://lifering.org/', en: 'Secular peer support focused on personal recovery.', es: 'Apoyo laico entre pares centrado en la recuperación personal.' },
  { name: 'Faces & Voices of Recovery', href: 'https://facesandvoicesofrecovery.org/', en: 'Recovery community organizations and peer recovery resources.', es: 'Organizaciones comunitarias y recursos de recuperación entre pares.' },
]);

function finderLink(codes, en, es) {
  return h('a', { class: 'btn btn-secondary', href: '#/treatment', 'data-navigator-handoff': 'true', onclick: () => setNavigatorHandoffState({ codes }) }, tr(en, es));
}

export function supportView() {
  return h('div', { class: 'view view-prose view-support' },
    pageHeader(tr('Recovery & family support', 'Recuperación y apoyo familiar'),
      tr('Choose support that respects your goals, language, culture, and prescribed medications.', 'Elija apoyo que respete sus metas, idioma, cultura y medicamentos recetados.')),
    section('peer', tr('Peer support & meetings', 'Apoyo entre pares y reuniones'),
      p(tr('You can be in recovery while taking prescribed methadone or buprenorphine. Group practices vary. Ask about accessibility, Spanish meetings, costs, and medication policies before joining. Peer support complements clinical care.', 'Puede estar en recuperación tomando metadona o buprenorfina recetadas. Las prácticas de los grupos varían. Pregunte por accesibilidad, reuniones en español, costos y políticas de medicamentos. El apoyo entre pares complementa la atención clínica.')),
      mutualAidFinder(),
      resourceList(PEER_SUPPORT_DIRECTORY.map(({ name, href, en, es }) => ({ name, href, desc: tr(en, es) }))),
      finderLink(['PEER'], 'Find programs with peer support', 'Buscar programas con apoyo entre pares'),
    ),
    section('family', tr('For family & friends', 'Para familiares y amistades'),
      resourceList([
        { name: 'SMART Recovery Family & Friends', href: 'https://smartrecovery.org/family', desc: tr('Skills and meetings informed by CRAFT and Invitation to Change.', 'Habilidades y reuniones basadas en CRAFT e Invitation to Change.') },
        { name: 'Al-Anon', href: 'https://al-anon.org/', desc: tr('Support for people affected by another person’s drinking.', 'Apoyo para personas afectadas por el consumo de alcohol de otra persona.') },
        { name: 'Nar-Anon', href: 'https://nar-anon.org/', desc: tr('Support for families and friends affected by substance use.', 'Apoyo para familiares y amistades afectados por el consumo de sustancias.') },
        { name: 'GRASP', href: 'https://grasphelp.org/', desc: tr('Grief support after a substance-related loss.', 'Apoyo de duelo tras una pérdida relacionada con sustancias.') },
      ]),
      h('article', { class: 'card print-handout' },
        h('h3', null, tr('CRAFT: a calm conversation', 'CRAFT: una conversación tranquila')),
        p(tr('Community Reinforcement and Family Training teaches communication, encouragement of safer choices, and care for your own wellbeing. Choose a calm time, ask permission, describe one observation, and offer a specific next step.', 'El Entrenamiento Comunitario y Familiar enseña comunicación, estímulo de opciones más seguras y cuidado de su propio bienestar. Elija un momento tranquilo, pida permiso, describa una observación y ofrezca un paso concreto.')),
        ul([
          tr('“Is now a good time to talk? I care about you and noticed you have been having a hard time.”', '«¿Es buen momento para hablar? Me importas y he notado que lo estás pasando mal». '),
          tr('“What would make today a little safer? Would you like me to sit with you while you call a clinic?”', '«¿Qué haría hoy un poco más seguro? ¿Quieres que te acompañe mientras llamas a una clínica?». '),
          tr('“Thank you for telling me. I can help with a ride; I also need rest and support for myself.”', '«Gracias por contármelo. Puedo ayudarte con el transporte; también necesito descansar y buscar apoyo para mí». '),
        ]),
        p(tr('Do not confront someone who is intoxicated or threatening violence. For immediate danger call 911. Keep naloxone available and learn overdose response.', 'No confronte a alguien intoxicado o que amenaza con violencia. Ante peligro inmediato llame al 911. Tenga naloxona disponible y aprenda a responder a una sobredosis.')),
        h('a', { href: '#/family-support', class: 'btn btn-secondary' }, tr('Interactive CRAFT family guide', 'Guía familiar interactiva de CRAFT')),
      ),
    ),
    section('housing', tr('Recovery housing', 'Vivienda de recuperación'),
      p(tr('Ask about prescribed MOUD, fees, resident rights, accessibility, and independent certification. Cash, free travel, or rent tied to a particular treatment referral can be a warning sign. Verify the home directly.', 'Pregunte por MOUD recetados, tarifas, derechos, accesibilidad y certificación independiente. El dinero, viajes o alquiler gratis ligados a una derivación específica pueden ser señales de alerta. Verifique la residencia directamente.')),
      p(ext('https://narronline.org/', tr('NARR standards and state affiliates', 'Estándares NARR y afiliados estatales'))),
      finderLink(['HH'], 'Find recovery housing', 'Buscar vivienda de recuperación'),
      p(h('a', { href: '#/choosing-care' }, tr('MOUD-friendly housing and patient rights checklist', 'Lista de vivienda compatible con MOUD y derechos del paciente'))),
    ),
    section('language', tr('Words matter', 'Las palabras importan'),
      p(tr('Use “person with a substance use disorder,” “return to use,” and “positive or negative test” rather than labels that shame people. Recovery goals belong to the person.', 'Use «persona con trastorno por consumo de sustancias», «retorno al consumo» y «prueba positiva o negativa», en vez de etiquetas que avergüencen. Las metas de recuperación pertenecen a cada persona.')),
      p(ext('https://nida.nih.gov/research-topics/addiction-science/words-matter-preferred-language-talking-about-addiction', tr('NIDA: Words Matter', 'NIDA: Las palabras importan'))),
      p(h('a', { href: '#/plan' }, tr('Build a personal safety plan', 'Crear un plan de seguridad personal')), ' · ', h('a', { href: '#/overdose' }, tr('Overdose response', 'Respuesta ante sobredosis'))),
    ),
  );
}
