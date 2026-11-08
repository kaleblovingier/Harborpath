// HarborPath: Community Street Outreach & Printable Pocket Handouts Generator
// Provides street outreach workers, harm reduction coalitions, peer recovery coaches,
// and emergency room navigators with instant, pocket-sized printable clinical guides.
// Safe DOM construction via ../dom.js (zero string injection, zero inline styles).

import { h, clear, icon, announce, tel } from '../dom.js';
import { t, getLang } from '../i18n.js';
import { pageHeader } from './common.js';

export const POCKET_CARDS = Object.freeze([
  {
    id: 'naloxone-steps',
    title: 'Naloxone in 5 Steps (Emergency Response)',
    titleEs: 'Naloxona en 5 Pasos (Respuesta de Emergencia)',
    badge: 'Life-Saving Protocol',
    badgeEs: 'Protocolo de Emergencia',
    steps: [
      {
        num: '1',
        title: 'Check Responsiveness',
        titleEs: 'Comprobar Consciencia',
        desc: 'Call the person\'s name loudly. Perform a hard knuckles-to-breastbone sternal rub for 5 seconds. If no movement, treat as an emergency.',
        descEs: 'Llame a la persona por su nombre. Realice un frotamiento esternal firme con los nudillos durante 5 segundos. Si no responde, es una emergencia.',
      },
      {
        num: '2',
        title: 'Call 911 Right Away',
        titleEs: 'Llamar al 911 de Inmediato',
        desc: 'Say: "Someone is unresponsive and not breathing at [Location]." Good Samaritan laws in most jurisdictions protect you and the victim.',
        descEs: 'Diga: "Alguien no responde y no está respirando en [Ubicación]." Las leyes del Buen Samaritano protegen a quienes llaman en caso de sobredosis.',
      },
      {
        num: '3',
        title: 'Administer Nasal Naloxone (Narcan)',
        titleEs: 'Administrar Naloxona Nasal (Narcan)',
        desc: 'Peel back package. Place nozzle into one nostril until fingers touch bottom of nose. Press plunger firmly. Naloxone does not harm someone who hasn\'t taken opioids.',
        descEs: 'Abra el paquete. Inserte la boquilla en una fosa nasal hasta que los dedos toquen la base de la nariz. Presione el émbolo con firmeza. No causa daño si no hay opioides.',
      },
      {
        num: '4',
        title: 'Support Breathing',
        titleEs: 'Apoyar la Respiración',
        desc: 'Clear mouth. Tilt head back, pinch nose, and deliver 1 rescue breath every 5 seconds. Ensure the chest rises visibly with each breath.',
        descEs: 'Despeje la boca. Incline la cabeza hacia atrás, tape la nariz y dé 1 respiración de rescate cada 5 segundos. Verifique que el pecho se eleve.',
      },
      {
        num: '5',
        title: 'Evaluate & Recovery Position',
        titleEs: 'Evaluar y Posición de Recuperación',
        desc: 'If no response in 2 to 3 minutes, give a second naloxone dose in the other nostril. If breathing resumes, roll onto their side with knee bent to prevent choking.',
        descEs: 'Si no responde en 2 a 3 minutos, dé una segunda dosis en la otra fosa nasal. Si respira, colóquelo de lado con la rodilla flexionada para evitar asfixia.',
      },
    ],
  },
  {
    id: 'test-strips',
    title: 'Fentanyl & Xylazine Test Strip Protocol',
    titleEs: 'Protocolo de Tiras Reactivas para Fentanilo y Xilazina',
    badge: 'Harm Reduction',
    badgeEs: 'Reducción de Daños',
    steps: [
      {
        num: '1',
        title: 'Crush & Prepare Residue',
        titleEs: 'Triturar y Preparar Residuo',
        desc: 'Test only residue or empty cooker/baggie. Fentanyl and xylazine are not distributed evenly in powders or counterfeit pills ("chocolate chip cookie effect").',
        descEs: 'Pruebe solo el residuo o bolsa vacía. El fentanilo y la xilazina no se distribuyen uniformemente en pastillas o polvos.',
      },
      {
        num: '2',
        title: 'Dilution: The 10:1 Water Rule',
        titleEs: 'Dilución: Regla de 10:1 de Agua',
        desc: 'Add 1 teaspoon (5 mL) of clean water per 10 mg of powder. High concentrations of methamphetamine, MDMA, or diphenhydramine cause FALSE POSITIVES if undiluted.',
        descEs: 'Agregue 1 cucharadita (5 mL) de agua limpia por cada 10 mg de polvo. Las altas concentraciones de metanfetamina o MDMA causan FALSOS POSITIVOS si no se diluyen.',
      },
      {
        num: '3',
        title: 'Dip for 15 Seconds',
        titleEs: 'Sumergir Durante 15 Segundos',
        desc: 'Hold strip by blue/solid end. Dip into liquid up to MAX line (do not submerge past line). Hold for 15 seconds, then lay completely flat on a dry surface.',
        descEs: 'Sostenga la tira por el extremo azul. Sumerja en el líquido hasta la línea MAX (no pase la línea). Mantenga 15 segundos y colóquela plana en una superficie seca.',
      },
      {
        num: '4',
        title: 'Read at 2 to 5 Minutes',
        titleEs: 'Leer a los 2 a 5 Minutos',
        desc: '1 LINE = POSITIVE (Fentanyl/Xylazine detected). 2 LINES = NEGATIVE (Even a faint second line is negative). Strip cannot detect unknown synthetic novel analogues.',
        descEs: '1 LÍNEA = POSITIVO (Fentanilo/Xilazina detectados). 2 LÍNEAS = NEGATIVO (Incluso una línea tenue cuenta como negativo). No detecta análogos sintéticos desconocidos.',
      },
    ],
  },
  {
    id: 'good-samaritan',
    title: 'Good Samaritan 911 Protections & Police Script',
    titleEs: 'Protecciones del Buen Samaritano y Guía para Llamar al 911',
    badge: 'Legal Rights',
    badgeEs: 'Derechos Legales',
    steps: [
      {
        num: '1',
        title: 'What Good Samaritan Laws Cover',
        titleEs: 'Qué Cubren las Leyes del Buen Samaritano',
        desc: 'In 48 states and D.C., calling 911 for an overdose protects the caller and victim from prosecution for personal possession of drugs and drug paraphernalia.',
        descEs: 'En 48 estados y D.C., llamar al 911 por sobredosis protege al informante y a la víctima de cargos por posesión personal de sustancias y parafernalia.',
      },
      {
        num: '2',
        title: 'What to Say to 911 Dispatch',
        titleEs: 'Qué Decir al Operador del 911',
        desc: 'Keep it clear and medical: "A person is unconscious and having trouble breathing at [Exact Address]. Send medical EMS immediately."',
        descEs: 'Sea breve y claro: "Una persona está inconsciente y tiene dificultad para respirar en [Dirección Exacta]. Envíen una ambulancia médica de inmediato."',
      },
      {
        num: '3',
        title: 'Secure the Scene Safely',
        titleEs: 'Asegurar el Lugar con Calma',
        desc: 'Put away extra bags or paraphernalia out of plain sight. Do not run away; staying with the person until EMS arrives ensures continuous rescue breathing.',
        descEs: 'Guarde parafernalia fuera de la vista directa. No huya; permanecer junto a la persona garantiza que reciba respiración de rescate continua hasta que llegue el SME.',
      },
    ],
  },
  {
    id: 'hospital-rights',
    title: 'Hospital Rights with MOUD (Patient Self-Advocacy)',
    titleEs: 'Derechos Hospitalarios con MOUD (Autodefensa del Paciente)',
    badge: 'Patient Advocacy',
    badgeEs: 'Defensa del Paciente',
    steps: [
      {
        num: '1',
        title: 'ADA Title II/III Legal Protections',
        titleEs: 'Protecciones Legales de la Ley ADA',
        desc: 'Under the Americans with Disabilities Act, hospitals cannot deny you care, refuse necessary surgery, or withhold prescribed buprenorphine or methadone.',
        descEs: 'Bajo la Ley ADA, los hospitales no pueden negarle atención, cirugías ni suspenderle su buprenorfina o metadona recetada.',
      },
      {
        num: '2',
        title: 'Prohibition of Abrupt Forced Tapers',
        titleEs: 'Prohibición de Retiro Abrupto o Forzado',
        desc: 'Involuntary acute withdrawal in hospital beds increases AMA discharges and mortality. Ask to speak immediately with the hospital Addiction Medicine consult team.',
        descEs: 'El síndrome de abstinencia forzado en el hospital aumenta las altas contraindicadas y la mortalidad. Solicite interconsulta con el equipo de Medicina de Adicciones.',
      },
      {
        num: '3',
        title: 'Pain on MOUD: Full-Agonist Layering',
        titleEs: 'Dolor Agudo con MOUD: Adición de Agonistas',
        desc: 'Taking buprenorphine or methadone does not block pain relief. Clinical consensus mandates continuing MOUD while layering standard short-acting opioids for acute pain.',
        descEs: 'Tomar buprenorfina o metadona no impide el alivio del dolor. El consenso clínico exige continuar el MOUD y agregar opioides de acción corta para dolor agudo.',
      },
    ],
  },
]);

// In-RAM state
const outreachState = {
  activeCardId: 'naloxone-steps',
  printAll: false,
};

const listeners = new Set();
function notify() {
  for (const fn of listeners) fn();
}

export function getOutreachState() {
  return { ...outreachState };
}

export function setOutreachState(patch) {
  Object.assign(outreachState, patch);
  notify();
}

export function subscribeOutreachState(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function resetOutreachMaterialsState() {
  outreachState.activeCardId = 'naloxone-steps';
  outreachState.printAll = false;
  notify();
}
export const resetOutreachState = resetOutreachMaterialsState;

/**
 * Outreach Materials View
 */
export function outreachMaterialsView() {
  const container = h('div', { class: 'view outreach-materials-view' });

  function render() {
    clear(container);
    const isEs = getLang() === 'es';
    const state = getOutreachState();

    // Page Header
    const header = pageHeader(
      isEs ? 'Materiales de Divulgación Comunitaria y Tarjetas de Bolsillo' : 'Community Street Outreach & Pocket Handout Generator',
      isEs
        ? 'Imprima tarjetas de bolsillo de alta legibilidad para equipos de divulgación en calle, personas que usan sustancias, familias y personal clínico. Formato optimizado para impresión con cero datos personales.'
        : 'Print high-contrast, trauma-informed pocket reference cards for street outreach workers, harm reduction coalitions, peer coaches, and clinic social workers. Zero personal data.',
    );

    // Card Selection Tabs
    const tabsRow = h('div', { class: 'tabs', role: 'tablist', 'aria-label': isEs ? 'Tarjetas de Bolsillo' : 'Pocket Reference Cards' },
      ...POCKET_CARDS.map((card) => {
        const isSelected = card.id === state.activeCardId && !state.printAll;
        return h('button', {
          type: 'button',
          role: 'tab',
          class: `tab ${isSelected ? 'active' : ''}`,
          'aria-selected': isSelected ? 'true' : 'false',
          onclick: () => setOutreachState({ activeCardId: card.id, printAll: false }),
        }, isEs ? card.titleEs : card.title);
      }),
      h('button', {
        type: 'button',
        class: `tab ${state.printAll ? 'active' : ''}`,
        'aria-selected': state.printAll ? 'true' : 'false',
        onclick: () => setOutreachState({ printAll: true }),
      }, isEs ? '📄 Ver / Imprimir Todas las Tarjetas' : '📄 View / Print All Cards'),
    );

    // Print & Action Controls
    const actionToolbar = h('div', { class: 'actions outreach-action-bar' },
      h('button', {
        type: 'button',
        class: 'btn btn-primary',
        onclick: () => {
          announce(isEs ? 'Abriendo diálogo de impresión...' : 'Opening print preview...');
          window.print();
        },
      },
        icon('printer'),
        h('span', null, isEs ? 'Imprimir Tarjetas de Bolsillo' : 'Print Pocket Cards (PDF / Paper)'),
      ),
      h('span', { class: 'fine' }, isEs ? 'Diseño de alto contraste listo para doblar en 4 partes (tamaño billetera)' : 'Fold-ready high-contrast wallet format (prints black & white cleanly)'),
    );

    // Handout Display Cards
    const cardsToRender = state.printAll
      ? POCKET_CARDS
      : POCKET_CARDS.filter((c) => c.id === state.activeCardId);

    const cardsContainer = h('div', { class: 'outreach-cards-grid' },
      ...cardsToRender.map((card) => renderPrintableCard(card, isEs)),
    );

    // Lifeline footer callout
    const hotlinesSection = h('section', { class: 'callout callout-info outreach-hotlines-callout' },
      h('p', { class: 'callout-title' },
        icon('phone'),
        isEs ? 'Líneas de Apoyo Confidenciales y Gratuitas 24/7' : 'Free & Confidential 24/7 Support Lines',
      ),
      h('div', { class: 'actions outreach-hotlines-actions' },
        tel('988', [icon('phone'), isEs ? 'Línea de Crisis 988' : '988 Suicide & Crisis Lifeline'], { class: 'btn btn-small btn-primary' }),
        tel('800-484-3731', [icon('phone'), isEs ? 'Never Use Alone (800-484-3731)' : 'Never Use Alone (800-484-3731)'], { class: 'btn btn-small btn-secondary' }),
        tel('800-222-1222', [icon('phone'), isEs ? 'Control de Envenenamiento (800-222-1222)' : 'Poison Control (800-222-1222)'], { class: 'btn btn-small btn-ghost' }),
      ),
    );

    container.appendChild(header);
    container.appendChild(tabsRow);
    container.appendChild(actionToolbar);
    container.appendChild(cardsContainer);
    container.appendChild(hotlinesSection);
  }

  const unsubscribe = subscribeOutreachState(render);
  render();

  return container;
}

/**
 * Renders a single printable card item
 */
function renderPrintableCard(card, isEs) {
  return h('article', {
    class: 'card printable-pocket-card',
    id: `card-${card.id}`,
    'aria-label': isEs ? card.titleEs : card.title,
  },
    h('div', { class: 'pocket-card-header' },
      h('div', { class: 'pocket-card-title-group' },
        h('h2', { class: 'pocket-card-title' }, isEs ? card.titleEs : card.title),
        h('span', { class: 'pocket-card-badge chip chip-primary' }, isEs ? card.badgeEs : card.badge),
      ),
      h('span', { class: 'pocket-card-logo' }, 'HarborPath.org · Free & Private'),
    ),
    h('ol', { class: 'pocket-steps-list' },
      ...card.steps.map((step) => h('li', { class: 'pocket-step-item' },
        h('div', { class: 'pocket-step-number' }, step.num),
        h('div', { class: 'pocket-step-body' },
          h('h3', { class: 'pocket-step-heading' }, isEs ? step.titleEs : step.title),
          h('p', { class: 'pocket-step-text' }, isEs ? step.descEs : step.desc),
        ),
      )),
    ),
    h('div', { class: 'pocket-card-footer' },
      h('span', { class: 'pocket-card-emergency-note' }, isEs ? 'Emergencia médica grave: Llame al 911 de inmediato.' : 'Emergency? Call 911 immediately.'),
      h('span', { class: 'pocket-card-tagline' }, 'HarborPath · 988 Lifeline · Never Use Alone 800-484-3731'),
    ),
  );
}
