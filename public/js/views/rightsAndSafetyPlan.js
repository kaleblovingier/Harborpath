// Rights reference and adapters for the existing RAM-only personal safety plan.
import { h, ext } from '../dom.js';
import { getLang } from '../i18n.js';
import { registerQuickExitHandler } from '../quickExitRegistry.js';

const L = (en, es) => getLang() === 'es' ? es : en;
let planAdapter = null;
const mountedPreferences = new Set();

// Keep one source of clinical state in plan.js. These callbacks contain no
// answers and avoid a circular import between the view and the rights guide.
export function connectSafetyPlanState(adapter) {
  planAdapter = adapter;
}

export function getSafetyPlanState() {
  return planAdapter?.getState() ?? {};
}

export function resetSafetyPlanState() {
  planAdapter?.resetState();
  for (const refresh of mountedPreferences) refresh();
}
registerQuickExitHandler(resetSafetyPlanState);

export const THERAPY_PREFERENCES = Object.freeze([
  { id: 'CBT', en: 'CBT: practical coping skills', es: 'CBT: habilidades prácticas para afrontar dificultades' },
  { id: 'MI', en: 'MI: explore my own goals', es: 'MI: explorar mis propias metas' },
  { id: 'CMI', en: 'CMI: contingency management', es: 'CMI: manejo de contingencias' },
  { id: 'TRC', en: 'TRC: trauma-informed counseling', es: 'TRC: terapia que reconoce el trauma' },
  { id: 'CRAFT', en: 'CRAFT: family communication and support', es: 'CRAFT: comunicación y apoyo familiar' },
]);

export function therapyPreferencesWidget() {
  const buttons = [];
  const selected = () => new Set(String(getSafetyPlanState().preferredTherapies ?? '').split(',').map((v) => v.trim()).filter(Boolean));
  const refresh = () => {
    const choices = selected();
    for (const { button, id } of buttons) button.setAttribute('aria-pressed', String(choices.has(id)));
  };
  const root = h('fieldset', { class: 'filter-group therapy-preferences' },
    h('legend', null, L('Therapy approaches I would like to discuss', 'Enfoques terapéuticos que me gustaría conversar')),
    h('p', { class: 'help' }, L('Choose any. These preferences stay in memory and are included in your plan.', 'Elija los que quiera. Estas preferencias quedan en la memoria y se incluyen en su plan.')),
    h('div', { class: 'presets' }, THERAPY_PREFERENCES.map((option) => {
      const button = h('button', { type: 'button', class: 'preset', 'aria-pressed': 'false', onclick: () => {
        const choices = selected();
        if (choices.has(option.id)) choices.delete(option.id);
        else choices.add(option.id);
        planAdapter?.setState({ preferredTherapies: [...choices].join(', ') });
        refresh();
      } }, L(option.en, option.es));
      buttons.push({ button, id: option.id });
      return button;
    })),
  );
  mountedPreferences.add(refresh);
  const unsubscribe = planAdapter?.subscribe?.(refresh);
  root._cleanup = () => { mountedPreferences.delete(refresh); unsubscribe?.(); };
  refresh();
  return root;
}

// Primary sources verified November 2026. These explain qualified protections,
// never immunity from state reporting laws or a guarantee of housing admission.
export function rightsAndSafetyGuide() {
  const cards = [
    {
      title: L('FMLA: time for treatment', 'FMLA: tiempo para recibir tratamiento'),
      body: L('Eligible workers at covered employers may receive up to 12 weeks of unpaid, job-protected leave for a qualifying serious health condition, including substance use treatment by a health professional or on referral. Absence solely because of substance use is not covered. Ask HR about eligibility, certification and intermittent leave.', 'Los trabajadores elegibles de empleadores cubiertos pueden recibir hasta 12 semanas de licencia sin sueldo con protección del empleo por una condición grave que reúna los requisitos, incluido tratamiento por consumo de sustancias con un profesional o por derivación. Las ausencias solo por consumir no están cubiertas. Pregunte a recursos humanos sobre elegibilidad, certificación y licencia intermitente.'),
      href: 'https://webapps.dol.gov/elaws/whd/fmla/10c9.aspx', source: L('U.S. Department of Labor: treatment leave', 'Departamento de Trabajo: licencia para tratamiento'),
    },
    {
      title: L('ADA: recovery and prescribed MOUD', 'ADA: recuperación y medicamentos recetados'),
      body: L('The ADA can protect people in recovery and people taking prescribed buprenorphine or methadone. Taking medication as directed is not illegal drug use. Covered employers may need to consider reasonable accommodations, such as a treatment schedule. Protection depends on the circumstances; current illegal drug use and workplace conduct rules have distinct limits.', 'La ADA puede proteger a personas en recuperación y a quienes toman buprenorfina o metadona recetada. Tomarlas según la receta no es consumo ilegal. Los empleadores cubiertos pueden tener que considerar ajustes razonables, como horarios para tratamiento. La protección depende del caso; existen límites distintos para el consumo ilegal actual y las reglas de conducta laboral.'),
      href: 'https://www.ada.gov/resources/opioid-use-disorder/', source: L('Department of Justice: ADA and opioid use disorder', 'Departamento de Justicia: ADA y trastorno por consumo de opioides'),
    },
    {
      title: L('42 CFR Part 2: record privacy', '42 CFR Parte 2: privacidad del expediente'),
      body: L('Part 2 covers records from qualifying federally assisted SUD programs, not every health record or consumer app. The 2024 Final Rule (89 FR 12472; compliance February 16, 2026) allows a consent covering future treatment, payment and health operations; certain recipients may redisclose under HIPAA. Separately maintained SUD counseling notes usually need separate consent. Legal-proceeding restrictions and exceptions apply: ask the program about consent, revocation and reporting duties.', 'La Parte 2 cubre expedientes de programas de tratamiento con asistencia federal que reúnen los requisitos, no todos los expedientes ni las aplicaciones. La regla final de 2024 (89 FR 12472; cumplimiento el 16 de febrero de 2026) permite un consentimiento para tratamiento, pagos y operaciones futuras; ciertos destinatarios pueden volver a divulgar según HIPAA. Las notas de terapia por consumo guardadas por separado normalmente requieren consentimiento separado. Existen restricciones y excepciones para procesos legales: pregunte sobre consentimiento, revocación y obligaciones de informar.'),
      href: 'https://www.hhs.gov/hipaa/for-professionals/regulatory-initiatives/fact-sheet-42-cfr-part-2-final-rule/index.html', source: L('HHS: Part 2 Final Rule', 'HHS: regla final de la Parte 2'),
    },
    {
      title: L('Pregnancy, CAPTA and a Plan of Safe Care', 'Embarazo, CAPTA y plan de cuidado seguro'),
      body: L('Prescribed MOUD is evidence-based pregnancy care. CAPTA calls for notification and a Plan of Safe Care for identified affected infants and families; notification alone does not establish a federal definition of child abuse or require prosecution. State reporting, investigation and child-welfare rules vary. Ask the prenatal team about local rules and legal aid; federal law does not promise immunity or prevent removal in every case.', 'Los medicamentos recetados para el trastorno por consumo de opioides son atención basada en evidencia durante el embarazo. CAPTA exige notificación y un plan de cuidado seguro para bebés afectados identificados y sus familias; la notificación por sí sola no establece una definición federal de maltrato ni exige un proceso penal. Las reglas estatales varían. Consulte al equipo prenatal sobre las reglas locales y ayuda legal; la ley federal no garantiza inmunidad ni impide toda separación familiar.'),
      href: 'https://ncsacw.acf.gov/topics/capta-plans-of-safe-care/module-4-implementing-and-monitoring-plans-of-safe-care/', source: L('ACF: Plans of Safe Care', 'ACF: planes de cuidado seguro'),
    },
  ];
  return h('section', { class: 'section rights-safety-guide', 'aria-label': L('Workplace, family and legal protections', 'Protecciones laborales, familiares y legales') },
    h('h2', null, L('Workplace, family & legal protections', 'Protecciones laborales, familiares y legales')),
    h('p', { class: 'fine' }, L('General information, not legal advice. Eligibility and state law matter. Ask a qualified advocate about your situation.', 'Información general, no asesoría legal. La elegibilidad y la ley estatal importan. Consulte a un defensor calificado sobre su situación.')),
    h('div', { class: 'results-list' }, cards.map((card) => h('article', { class: 'card' }, h('h3', null, card.title), h('p', null, card.body), h('p', { class: 'fine' }, ext(card.href, card.source))))),
    h('article', { class: 'card' },
      h('h3', null, L('NARR Level I–IV recovery housing: medication checklist', 'Viviendas de recuperación NARR de nivel I–IV: lista sobre medicamentos')),
      h('p', null, L('Level I is peer-run; Level II is monitored; Level III provides supervised recovery support and life skills; Level IV adds clinical addiction treatment. These describe support intensity, not a guarantee that a home accepts MOUD or can manage medical withdrawal.', 'El nivel I es dirigido por pares; el II es supervisado por responsables de la vivienda; el III ofrece apoyo estructurado y habilidades para la vida; el IV añade tratamiento clínico. Los niveles describen la intensidad del apoyo, no garantizan que acepten medicamentos ni que manejen la abstinencia médica.')),
      h('ul', { class: 'checklist' }, [
        L('Will you continue my prescribed buprenorphine, methadone or naltrexone without a forced taper?', '¿Puedo continuar mi buprenorfina, metadona o naltrexona recetada sin una reducción obligatoria?'),
        L('How are medications stored safely, and how will I get to my OTP or prescriber?', '¿Cómo se guardan los medicamentos y cómo llegaré a mi programa de metadona o profesional?'),
        L('Are naloxone, overdose training and a respectful return-to-use response available?', '¿Hay naloxona, capacitación para sobredosis y una respuesta respetuosa si vuelvo a consumir?'),
        L('Can I see certification, staffing, fees, house rules, grievance steps and discharge policies in writing?', '¿Puedo ver por escrito la certificación, el personal, los costos, las reglas, las quejas y las políticas de salida?'),
      ].map((text) => h('li', null, text))),
      h('p', { class: 'fine' }, ext('https://narronline.org/standards/', L('NARR standards and levels', 'Normas y niveles de NARR')), ' · ', ext('https://narronline.org/wp-content/uploads/2024/05/NARR-MAT-Capable-Recovery-Residences-Guide-for-State-Policy-Makers-2018.pdf', L('NARR: medication-capable housing', 'NARR: viviendas que apoyan medicamentos'))),
    ),
  );
}
