import { h, clear, tel, ext } from '../dom.js';
import { getLang } from '../i18n.js';
import { pageHeader, section, p, ul } from './common.js';
import { registerQuickExitHandler as onQuickExit } from '../quickExitRegistry.js';
import { setNavigatorHandoffState } from './navigatorHandoff.js';
import { printClinicalHandout } from '../components/printHandout.js';

const text = (en, es) => getLang() === 'es' ? es : en;
const option = (value, en, es) => Object.freeze({ value, en, es });
const item = (key, en, es, options) => Object.freeze({ key, en, es, options: Object.freeze(options) });

// NIDA COWS: 11 domains, including its non-consecutive point values. This is
// separate from navigator.js's short patient-reported symptom questionnaire.
// https://nida.nih.gov/sites/default/files/ClinicalOpiateWithdrawalScale.pdf
export const COWS_ITEMS = Object.freeze([
  item('pulse', 'Resting pulse after one minute seated', 'Pulso tras un minuto sentado', [option(0, '80/min or less', '80/min o menos'), option(1, '81–100/min', '81–100/min'), option(2, '101–120/min', '101–120/min'), option(4, 'Over 120/min', 'Más de 120/min')]),
  item('sweating', 'Sweating unrelated to heat or activity', 'Sudor sin calor ni actividad', [option(0, 'None', 'Ninguno'), option(1, 'Chills or flushing reported', 'Escalofríos o calor referido'), option(2, 'Face visibly damp', 'Cara húmeda'), option(3, 'Sweat droplets', 'Gotas de sudor'), option(4, 'Sweat running down face', 'Sudor que corre por la cara')]),
  item('restlessness', 'Ability to remain seated', 'Capacidad de permanecer sentado', [option(0, 'Comfortably still', 'Quieto sin dificultad'), option(1, 'Difficult but possible', 'Difícil pero posible'), option(3, 'Frequent extra movement', 'Movimientos frecuentes'), option(5, 'Cannot stay still', 'No puede estar quieto')]),
  item('pupils', 'Pupil size for room lighting', 'Pupilas según la luz ambiental', [option(0, 'Usual or small', 'Normales o pequeñas'), option(1, 'Possibly enlarged', 'Quizá dilatadas'), option(2, 'Clearly enlarged', 'Claramente dilatadas'), option(5, 'Very enlarged; little iris visible', 'Muy dilatadas; poco iris visible')]),
  item('aches', 'New bone or joint aches', 'Dolor nuevo de huesos o articulaciones', [option(0, 'None', 'Ninguno'), option(1, 'Mild widespread discomfort', 'Molestia leve generalizada'), option(2, 'Severe widespread aching', 'Dolor intenso generalizado'), option(4, 'Rubbing muscles; cannot sit still', 'Se frota músculos; no puede estar quieto')]),
  item('noseEyes', 'Runny nose or tears unrelated to allergy/cold', 'Secreción nasal o lágrimas sin alergia/resfriado', [option(0, 'None', 'Ninguno'), option(1, 'Stuffy nose or moist eyes', 'Nariz tapada u ojos húmedos'), option(2, 'Running nose or tearing', 'Secreción nasal o lagrimeo'), option(4, 'Constant flow', 'Flujo constante')]),
  item('gi', 'Stomach or bowel symptoms in last 30 minutes', 'Síntomas digestivos en los últimos 30 minutos', [option(0, 'None', 'Ninguno'), option(1, 'Cramps', 'Cólicos'), option(2, 'Nausea or loose stool', 'Náusea o heces blandas'), option(3, 'Vomiting or diarrhea', 'Vómito o diarrea'), option(5, 'Repeated vomiting or diarrhea', 'Vómito o diarrea repetidos')]),
  item('tremor', 'Tremor with arms extended', 'Temblor con brazos extendidos', [option(0, 'None', 'Ninguno'), option(1, 'Felt but not visible', 'Se siente pero no se ve'), option(2, 'Small visible tremor', 'Temblor visible leve'), option(4, 'Large tremor or twitching', 'Temblor fuerte o sacudidas')]),
  item('yawning', 'Yawning during this check', 'Bostezos durante esta evaluación', [option(0, 'None', 'Ninguno'), option(1, 'Once or twice', 'Uno o dos'), option(2, 'Three or more', 'Tres o más'), option(4, 'Several each minute', 'Varios por minuto')]),
  item('anxiety', 'Anxiety or irritability', 'Ansiedad o irritabilidad', [option(0, 'None', 'Ninguna'), option(1, 'Reported increase', 'Aumento referido'), option(2, 'Clearly apparent', 'Claramente visible'), option(4, 'Prevents participation', 'Impide participar')]),
  item('gooseflesh', 'Goosebumps', 'Piel de gallina', [option(0, 'None', 'Ninguna'), option(3, 'Raised hairs can be felt', 'Vello erizado palpable'), option(5, 'Very prominent', 'Muy marcada')]),
]);

// CIWA-Ar scores nine domains 0–7, orientation 0–4 (maximum 67).
// https://www.csam-asam.org/ciwa-ar
const intensity = [option(0, 'Absent', 'Ausente'), option(1, 'Very mild', 'Muy leve'), option(2, 'Mild', 'Leve'), option(3, 'Mild to moderate', 'Leve a moderado'), option(4, 'Moderate', 'Moderado'), option(5, 'Marked', 'Marcado'), option(6, 'Severe', 'Intenso'), option(7, 'Extreme / continuous', 'Extremo / continuo')];
export const CIWA_ITEMS = Object.freeze([
  item('nausea', 'Nausea / vomiting: 0 none, 1 nausea, 4 dry heaves, 7 frequent vomiting', 'Náuseas / vómito: 0 nada, 1 náusea, 4 arcadas, 7 vómito frecuente', intensity),
  item('tremor', 'Tremor: 0 none, 1 felt only, 4 moderate with arms out, 7 severe at rest', 'Temblor: 0 nada, 1 solo palpable, 4 moderado con brazos extendidos, 7 intenso en reposo', intensity),
  item('sweating', 'Sweating: 0 none, 1 moist palms, 4 forehead beads, 7 drenching', 'Sudor: 0 nada, 1 palmas húmedas, 4 gotas en frente, 7 empapado', intensity),
  item('anxiety', 'Anxiety: 0 calm, 1 mild, 4 moderately anxious, 7 panic-like', 'Ansiedad: 0 calma, 1 leve, 4 moderada, 7 semejante a pánico', intensity),
  item('agitation', 'Agitation: 0 usual activity, 1 mildly restless, 4 moderately fidgety, 7 constant pacing/thrashing', 'Agitación: 0 actividad habitual, 1 inquietud leve, 4 moderada, 7 movimiento constante', intensity),
  item('tactile', 'Skin sensations: 0 none, 1 very mild, 4 moderately severe, 5–7 hallucinations', 'Sensaciones en piel: 0 nada, 1 muy leves, 4 intensas, 5–7 alucinaciones', intensity),
  item('auditory', 'Sound sensitivity: 0 none, 1 very mild, 4 moderately severe, 5–7 hallucinations', 'Sensibilidad a sonidos: 0 nada, 1 muy leve, 4 intensa, 5–7 alucinaciones', intensity),
  item('visual', 'Light/vision changes: 0 none, 1 very mild, 4 moderately severe, 5–7 hallucinations', 'Cambios de luz/visión: 0 nada, 1 muy leves, 4 intensos, 5–7 alucinaciones', intensity),
  item('headache', 'Headache / head pressure: 0 none through 7 extremely severe (exclude dizziness)', 'Dolor / presión de cabeza: de 0 nada a 7 extremo (sin mareo)', intensity),
  item('orientation', 'Orientation and thinking', 'Orientación y pensamiento', [option(0, 'Oriented; can add numbers', 'Orientado; puede sumar'), option(1, 'Cannot add / uncertain of date', 'No puede sumar / fecha incierta'), option(2, 'Date wrong by up to two days', 'Fecha incorrecta por hasta dos días'), option(3, 'Date wrong by more than two days', 'Fecha incorrecta por más de dos días'), option(4, 'Uncertain of person or place', 'No reconoce persona o lugar')]),
]);

function total(items, answers = {}) {
  let score = 0;
  const missing = [];
  for (const field of items) {
    const raw = answers?.[field.key];
    const value = (typeof raw === 'number' || (typeof raw === 'string' && raw.trim() !== '')) ? Number(raw) : NaN;
    if (!field.options.some((entry) => entry.value === value)) missing.push(field.key);
    else score += value;
  }
  return { score, complete: missing.length === 0, missing };
}

export function scoreCows(answers = {}) {
  const result = total(COWS_ITEMS, answers);
  const band = result.score > 36 ? 'severe' : result.score >= 25 ? 'moderately_severe' : result.score >= 13 ? 'moderate' : result.score >= 5 ? 'mild' : 'minimal';
  return { ...result, maximum: 48, band: result.complete ? band : 'incomplete' };
}

export function scoreCiwaAr(answers = {}, risks = {}) {
  const result = total(CIWA_ITEMS, answers);
  const hallucinations = ['tactile', 'auditory', 'visual'].some((key) => Number(answers?.[key]) >= 5);
  const emergency = risks.seizureNow === true || risks.confusionNow === true || risks.breathingProblem === true || Number(answers?.orientation) >= 2 || hallucinations;
  const urgent = emergency || result.score >= 19 || risks.priorSeizureOrDT === true || risks.dailySedativeUse === true;
  return {
    ...result, maximum: 67,
    band: result.complete ? (result.score >= 19 ? 'severe' : result.score >= 10 ? 'moderate' : 'mild') : 'incomplete',
    emergency, urgent,
    // CIWA-Ar measures current alcohol symptoms; it never predicts all seizures
    // or establishes benzodiazepine-withdrawal safety, even at a score of zero.
    seizureRiskExcluded: false,
  };
}

let state = { cows: {}, ciwa: {}, risks: {} };
const resets = new Set();
export function getClinicalScoresState() { return structuredClone(state); }
export function resetClinicalScoresState() {
  state = { cows: {}, ciwa: {}, risks: {} };
  for (const reset of resets) {
    try { reset(); } catch { /* Continue wiping other mounted forms. */ }
  }
}
onQuickExit(resetClinicalScoresState);

export function clinicalScoresView() {
  const controls = [];
  const output = h('div', { 'aria-live': 'polite', 'aria-atomic': 'true', class: 'clinical-scores-summary print-handout' });
  function renderResult() {
    const cows = scoreCows(state.cows);
    const ciwa = scoreCiwaAr(state.ciwa, state.risks);
    const bands = { minimal: text('minimal', 'mínimo'), mild: text('mild', 'leve'), moderate: text('moderate', 'moderado'), moderately_severe: text('moderately severe', 'moderadamente intenso'), severe: text('severe', 'intenso') };
    clear(output);
    output.append(h('h2', null, text('Withdrawal self-check summary', 'Resumen de autoevaluación de abstinencia')),
      p(text('Printed or copied information remains outside Quick Exit’s control.', 'La información impresa o copiada queda fuera del control de Salida rápida.')),
      p(cows.complete ? `COWS: ${cows.score}/48 — ${bands[cows.band]}` : text('COWS: answer all 11 items; no total interpretation yet.', 'COWS: responda las 11 preguntas; aún no hay interpretación.')),
      p(ciwa.complete ? `CIWA-Ar: ${ciwa.score}/67 — ${bands[ciwa.band]}` : text('CIWA-Ar: answer all 10 items; no total interpretation yet.', 'CIWA-Ar: responda las 10 preguntas; aún no hay interpretación.')),
      p(text('Call 911 for seizures, confusion, hallucinations or trouble breathing; do not wait for a score. EMTALA protects emergency screening and stabilization or appropriate transfer at participating hospital emergency departments regardless of ability to pay.', 'Llame al 911 ante convulsiones, confusión, alucinaciones o dificultad respiratoria; no espere una puntuación. EMTALA protege evaluación y estabilización de emergencia o traslado apropiado en urgencias participantes sin importar capacidad de pago.')),
      p(text('These adapted self-checks require clinician confirmation. A low score does not rule out seizures or another emergency. Do not use scores to decide when to start buprenorphine or to dose medicines.', 'Estas autoevaluaciones adaptadas requieren confirmación clínica. Una puntuación baja no descarta convulsiones u otra emergencia. No use puntuaciones para iniciar buprenorfina ni calcular medicamentos.')));
    if (ciwa.emergency || ciwa.urgent) output.append(h('div', { class: 'callout callout-emergency', role: 'alert' },
      h('h3', null, ciwa.emergency ? text('Call 911 now', 'Llame al 911 ahora') : text('Get urgent medical assessment', 'Busque evaluación médica urgente')),
      p(ciwa.emergency ? text('Seizure, confusion, hallucinations or trouble breathing can be life-threatening. Do not drive yourself or wait to finish this form.', 'Las convulsiones, confusión, alucinaciones o dificultad respiratoria pueden ser mortales. No conduzca ni espere a terminar el formulario.') : text('Severe symptoms, prior withdrawal seizures/DTs, or daily benzodiazepine use need a clinician-led plan. Do not abruptly stop alcohol or benzodiazepines on your own.', 'Los síntomas intensos, antecedentes de convulsiones/delirium tremens o uso diario de benzodiacepinas requieren un plan clínico. No suspenda alcohol o benzodiacepinas de golpe por su cuenta.')),
      tel('911', text('Call 911 for an emergency', 'Llame al 911 ante una emergencia'), { class: 'btn btn-emergency' })));
  }
  function fields(kind, items) {
    return items.map((field) => {
      const id = `${kind}-${field.key}`;
      const select = h('select', { id, class: 'input', onchange: (event) => {
        if (event.target.value === '') delete state[kind][field.key];
        else state[kind][field.key] = Number(event.target.value);
        renderResult();
      } }, h('option', { value: '' }, text('Choose a response', 'Elija una respuesta')),
      field.options.map((entry) => h('option', { value: entry.value }, `${entry.value} — ${text(entry.en, entry.es)}`)));
      select.value = state[kind][field.key] ?? '';
      controls.push({ element: select, kind, key: field.key });
      return h('div', { class: 'field' }, h('label', { class: 'label', for: id }, text(field.en, field.es)), select);
    });
  }
  const riskInputs = [
    ['seizureNow', 'Seizure happening now or just occurred', 'Convulsión actual o reciente'],
    ['confusionNow', 'New confusion, hallucinations or disorientation', 'Confusión, alucinaciones o desorientación nuevas'],
    ['breathingProblem', 'Slow breathing, blue lips or cannot wake up', 'Respiración lenta, labios azules o no despierta'],
    ['priorSeizureOrDT', 'Previous alcohol/benzodiazepine withdrawal seizure or delirium tremens', 'Convulsión o delirium tremens anterior por abstinencia de alcohol/benzodiacepinas'],
    ['dailySedativeUse', 'Daily benzodiazepine or other sedative use', 'Uso diario de benzodiacepinas u otros sedantes'],
  ].map(([key, en, es]) => {
    const input = h('input', { type: 'checkbox', checked: state.risks[key], onchange: (event) => { state.risks[key] = event.target.checked; renderResult(); } });
    controls.push({ element: input, kind: 'risks', key });
    return h('label', { class: 'check' }, input, text(en, es));
  });
  const resetForm = () => { for (const { element, kind, key } of controls) { if (kind === 'risks') element.checked = false; else element.value = ''; } renderResult(); };
  resets.add(resetForm);
  const view = h('div', { class: 'clinical-scores-view' },
    pageHeader(text('COWS & CIWA-Ar withdrawal self-checks', 'Autoevaluaciones de abstinencia COWS y CIWA-Ar'), text('For a conversation with a clinician; not a diagnosis, medical advice, or an emergency service. Answers stay in browser memory only.', 'Para hablar con un profesional; no es diagnóstico, consejo médico ni servicio de emergencias. Las respuestas solo están en la memoria del navegador.')),
    section('withdrawal-danger', text('Check immediate safety first', 'Primero revise la seguridad inmediata'),
      p(text('Call 911 for seizures, confusion, hallucinations, chest pain or breathing trouble. Alcohol and benzodiazepine withdrawal can be fatal even with a low or incomplete score.', 'Llame al 911 ante convulsiones, confusión, alucinaciones, dolor de pecho o dificultad respiratoria. La abstinencia de alcohol y benzodiacepinas puede ser mortal incluso con puntuación baja o incompleta.')), ...riskInputs),
    section('cows', text('COWS: opioid withdrawal', 'COWS: abstinencia de opioides'), p(text('Only rate signs attributable to opioid withdrawal. Several items need another person or a clinician to observe them. This does not detect xylazine/medetomidine withdrawal reliably.', 'Puntúe solo signos atribuibles a abstinencia de opioides. Varios requieren observación de otra persona o profesional. No detecta de forma fiable la abstinencia de xilacina/medetomidina.')), ...fields('cows', COWS_ITEMS)),
    section('ciwa', text('CIWA-Ar: alcohol withdrawal', 'CIWA-Ar: abstinencia de alcohol'), p(text('Adapted educational rating aid, not a validated self-administered test. Intermediate values describe symptoms between the anchors. CIWA-Ar is unsuitable for delirium or anyone unable to communicate and is not a benzodiazepine withdrawal scale.', 'Ayuda educativa adaptada; no es una prueba validada para uso sin profesional. Los valores intermedios describen síntomas entre los ejemplos. CIWA-Ar no sirve para delirium ni para quien no puede comunicarse y no mide abstinencia de benzodiacepinas.')), ...fields('ciwa', CIWA_ITEMS)),
    output,
    section('withdrawal-rights', text('Emergency care rights', 'Derechos de atención de emergencia'), p(text('EMTALA requires Medicare-participating hospital emergency departments to offer a medical screening exam and, for an emergency medical condition, stabilization or appropriate transfer regardless of insurance or ability to pay. This does not make all hospital care free.', 'EMTALA exige a urgencias hospitalarias participantes en Medicare ofrecer evaluación y, ante una emergencia médica, estabilización o traslado apropiado sin importar seguro ni capacidad de pago. No significa que toda atención sea gratuita.'))),
    h('div', { class: 'actions no-print' }, h('button', { type: 'button', class: 'btn btn-secondary', onclick: () => printClinicalHandout(output) }, text('Print summary', 'Imprimir resumen')),
      h('button', { type: 'button', class: 'btn btn-ghost', onclick: resetClinicalScoresState }, text('Clear answers', 'Borrar respuestas')),
      h('a', { href: '#/withdrawal-planner', class: 'btn btn-secondary' }, text('Withdrawal care reference', 'Referencia de atención de abstinencia')),
      h('a', { href: '#/treatment', class: 'btn btn-primary', 'data-navigator-handoff': 'true', onclick: () => setNavigatorHandoffState({ codes: scoreCiwaAr(state.ciwa, state.risks).urgent ? ['DT', 'HI'] : ['DT', 'BU', 'OTP'] }) }, text('Find care', 'Buscar atención'))),
    section('scores-sources', text('Clinical references', 'Referencias clínicas'), ul([
      ext('https://nida.nih.gov/sites/default/files/ClinicalOpiateWithdrawalScale.pdf', 'NIDA — COWS'),
      ext('https://www.csam-asam.org/ciwa-ar', 'CSAM — CIWA-Ar'),
      ext('https://www.asam.org/quality-care/clinical-guidelines/alcohol-withdrawal-management-guideline', text('ASAM — alcohol withdrawal guidance', 'ASAM — guía de abstinencia de alcohol')),
      ext('https://www.cms.gov/priorities/your-patient-rights/emergency-room-rights', 'CMS — EMTALA'),
    ])));
  view._cleanup = () => {
    resets.delete(resetForm);
    for (const { element, kind } of controls) {
      if (kind === 'risks') element.checked = false;
      else element.value = '';
    }
    controls.length = 0;
    clear(output);
    clear(view);
  };
  renderResult();
  return view;
}

export default clinicalScoresView;
