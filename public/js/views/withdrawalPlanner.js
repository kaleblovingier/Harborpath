import { h, clear, tel, ext } from '../dom.js';
import { getLang } from '../i18n.js';
import { pageHeader, section, p, ul } from './common.js';
import { registerQuickExitHandler as onQuickExit } from '../quickExitRegistry.js';
import { setNavigatorHandoffState } from './navigatorHandoff.js';
import { printClinicalHandout } from '../components/printHandout.js';

const text = (en, es) => getLang() === 'es' ? es : en;

// ASHP September 2025 FAQ, Table 1, standard sample LDBI protocol.
// Reference only: not an individually calculated prescription or a pregnancy
// protocol. The treating prescriber must set overlap, monitoring and end dose.
export const BERNESE_REFERENCE = Object.freeze([
  Object.freeze({ day: 1, doseMg: 0.5, dosesPerDay: 1, dailyMg: 0.5 }),
  Object.freeze({ day: 2, doseMg: 0.5, dosesPerDay: 2, dailyMg: 1 }),
  Object.freeze({ day: 3, doseMg: 1, dosesPerDay: 2, dailyMg: 2 }),
  Object.freeze({ day: 4, doseMg: 2, dosesPerDay: 2, dailyMg: 4 }),
  Object.freeze({ day: 5, doseMg: 4, dosesPerDay: 2, dailyMg: 8 }),
  Object.freeze({ day: 6, doseMg: 8, dosesPerDay: 2, dailyMg: 16 }),
]);

let state = { day: 1, pregnancy: false, alpha2Exposure: false, clinicianPlan: false, naloxone: false };
const resets = new Set();
export function getWithdrawalPlannerState() { return { ...state }; }
export function setWithdrawalPlannerState(patch = {}) {
  if (Number.isInteger(patch.day) && patch.day >= 1 && patch.day <= 6) state.day = patch.day;
  for (const key of ['pregnancy', 'alpha2Exposure', 'clinicianPlan', 'naloxone']) {
    if (typeof patch[key] === 'boolean') state[key] = patch[key];
  }
  return getWithdrawalPlannerState();
}
export function resetWithdrawalPlannerState() {
  state = { day: 1, pregnancy: false, alpha2Exposure: false, clinicianPlan: false, naloxone: false };
  for (const reset of resets) {
    try { reset(); } catch { /* Continue wiping other mounted forms. */ }
  }
}
onQuickExit(resetWithdrawalPlannerState);

export function withdrawalPlannerView() {
  const controls = [];
  const summary = h('div', { class: 'withdrawal-planner-summary print-handout', 'aria-live': 'polite' });
  function renderSummary() {
    clear(summary);
    const row = BERNESE_REFERENCE[state.day - 1];
    summary.append(h('h2', null, text('Low-dose buprenorphine: clinician discussion checklist', 'Buprenorfina en dosis bajas: lista para la consulta')),
      p(text('Educational reference only, not medical advice or a prescription. Follow an individualized clinician plan; the six-day example is not a universal or pregnancy protocol.', 'Solo referencia educativa, no consejo médico ni receta. Siga un plan clínico individual; el ejemplo de seis días no es un protocolo universal ni para embarazo.')),
      p(text('Printed or copied information remains outside Quick Exit’s control.', 'La información impresa o copiada queda fuera del control de Salida rápida.')),
      p(text('Selected reference day: ', 'Día de referencia seleccionado: ') + state.day),
      state.pregnancy
        ? p(text('Pregnancy/postpartum selected: this sample is not a pregnancy protocol. Contact your obstetric/addiction team for an individual plan; do not change prescribed methadone or buprenorphine on your own.', 'Embarazo/posparto seleccionado: este ejemplo no es un protocolo de embarazo. Contacte a su equipo obstétrico/de adicciones para un plan individual; no cambie metadona ni buprenorfina recetadas por su cuenta.'))
        : p(text('Published example, not your prescription: ', 'Ejemplo publicado, no su receta: ') + `${row.doseMg} mg × ${row.dosesPerDay} = ${row.dailyMg} mg` + text(' buprenorphine that day. Follow only your own clinician’s written plan.', ' de buprenorfina ese día. Siga solo el plan escrito de su profesional.')),
      ul([
        state.clinicianPlan ? text('Written clinician plan discussed. Confirm exact product, dose, overlap, and whom to contact if symptoms worsen.', 'Plan escrito conversado. Confirme producto, dosis, solapamiento y contacto si empeoran los síntomas.') : text('Arrange a clinician/pharmacist review before starting or changing medicine.', 'Consiga revisión clínica/farmacéutica antes de iniciar o cambiar medicamentos.'),
        state.naloxone ? text('Naloxone available. Make sure a trusted person knows where it is and how to help.', 'Naloxona disponible. Asegúrese de que alguien de confianza sepa dónde está y cómo ayudar.') : text('Ask for naloxone and an overdose response plan.', 'Pida naloxona y un plan de respuesta a sobredosis.'),
        state.alpha2Exposure ? text('Tell clinicians about possible xylazine/medetomidine exposure. MOUD alone may not control alpha-2 rebound.', 'Informe posible exposición a xilacina/medetomidina. MOUD sola puede no controlar el rebote alfa-2.') : text('Mention all sedatives, alcohol, and other medicines to the clinician.', 'Informe todos los sedantes, alcohol y otros medicamentos al profesional.'),
      ]), p(text('Call 911 for seizures, confusion, hallucinations, chest pain, fainting or breathing problems. Severe alcohol/benzodiazepine or alpha-2 sedative withdrawal needs urgent medical assessment.', 'Llame al 911 ante convulsiones, confusión, alucinaciones, dolor de pecho, desmayo o dificultad respiratoria. La abstinencia intensa de alcohol/benzodiacepinas o sedantes alfa-2 necesita evaluación médica urgente.')));
  }
  const daySelect = h('select', { id: 'berne-day', class: 'input', onchange: (event) => { setWithdrawalPlannerState({ day: Number(event.target.value) }); renderSummary(); } },
    BERNESE_REFERENCE.map((row) => h('option', { value: row.day }, text('Reference day ', 'Día de referencia ') + row.day)));
  daySelect.value = String(state.day);
  const checks = [
    ['pregnancy', 'Pregnant or postpartum', 'Embarazo o posparto'],
    ['alpha2Exposure', 'Possible xylazine or medetomidine exposure', 'Posible exposición a xilacina o medetomidina'],
    ['clinicianPlan', 'I have discussed an individual written plan with my clinician', 'He conversado un plan escrito individual con mi profesional'],
    ['naloxone', 'Naloxone is available', 'Hay naloxona disponible'],
  ].map(([key, en, es]) => {
    const input = h('input', { type: 'checkbox', checked: state[key], onchange: (event) => { setWithdrawalPlannerState({ [key]: event.target.checked }); renderSummary(); } });
    controls.push({ key, input });
    return h('label', { class: 'check' }, input, text(en, es));
  });
  const resetForm = () => { daySelect.value = '1'; for (const { input } of controls) input.checked = false; renderSummary(); };
  resets.add(resetForm);
  const view = h('div', { class: 'withdrawal-planner-view' },
    pageHeader(text('Withdrawal care & low-dose buprenorphine reference', 'Referencia de abstinencia y buprenorfina en dosis bajas'), text('An educational planning aid for your clinician visit. This is not medical advice or a prescription. Every selection stays in browser memory and clears with Quick Exit.', 'Ayuda educativa para su consulta clínica. No es consejo médico ni receta. Cada selección queda en la memoria del navegador y se borra con Salida rápida.')),
    h('div', { class: 'callout callout-emergency' }, h('h2', null, text('Do not wait for a score or a plan in an emergency', 'No espere una puntuación ni un plan ante una emergencia')),
      p(text('Call 911 for seizures, confusion, hallucinations, chest pain, fainting, blue lips, or difficulty breathing. Alcohol/benzodiazepine withdrawal and severe medetomidine withdrawal may need hospital care.', 'Llame al 911 ante convulsiones, confusión, alucinaciones, dolor de pecho, desmayo, labios azules o dificultad respiratoria. La abstinencia de alcohol/benzodiacepinas y medetomidina intensa puede necesitar hospital.')),
      tel('911', text('Call 911', 'Llame al 911'), { class: 'btn btn-emergency' }), ' ', h('a', { href: '#/overdose', class: 'btn btn-secondary' }, text('Overdose response', 'Respuesta a sobredosis'))),
    section('berne-overview', text('Six-day low-dose (“Bernese”) example', 'Ejemplo de seis días de dosis bajas (“método Bernese”)'),
      p(text('Low-dose initiation gradually introduces buprenorphine with an individualized opioid overlap plan. It is an off-label approach and may help some people exposed to fentanyl or with prior precipitated withdrawal. It does not eliminate withdrawal or overdose risk. Six days is one published example; timing and doses often differ.', 'El inicio en dosis bajas introduce buprenorfina gradualmente con solapamiento de opioides individualizado. Es un uso fuera de indicación y puede ayudar a algunas personas expuestas a fentanilo o con abstinencia precipitada previa. No elimina abstinencia ni riesgo de sobredosis. Seis días es un ejemplo publicado; las dosis y tiempos pueden variar.')),
      p(text('Do not use this table to self-dose, split a product, continue fentanyl, or stop prescribed opioids. Your clinician must specify the medicine/formulation, exact timing, opioid overlap and stopping point, monitoring, and response to worsening symptoms; your pharmacist should confirm whether the prescribed product can be divided accurately.', 'No use esta tabla para automedicarse, dividir un producto, continuar fentanilo ni suspender opioides recetados. Su profesional debe indicar medicamento/formulación, horario, solapamiento y momento de suspensión, vigilancia y respuesta al empeoramiento; su farmacéutico debe confirmar si puede dividirse el producto con precisión.')),
      h('div', { class: 'table-scroll' }, h('table', null,
        h('caption', null, text('ASHP 2025 sample: sublingual buprenorphine component, not a personal prescription', 'Ejemplo ASHP 2025: componente de buprenorfina sublingual, no receta personal')),
        h('thead', null, h('tr', null, h('th', { scope: 'col' }, text('Day', 'Día')), h('th', { scope: 'col' }, text('Sample dose', 'Dosis de ejemplo')), h('th', { scope: 'col' }, text('Daily total', 'Total diario')))),
        h('tbody', null, BERNESE_REFERENCE.map((row) => h('tr', null, h('th', { scope: 'row' }, row.day), h('td', null, `${row.doseMg} mg ` + (row.dosesPerDay === 1 ? text('once', 'una vez') : text('twice daily', 'dos veces al día'))), h('td', null, `${row.dailyMg} mg`)))))),
      p(text('The source example ends full-agonist overlap on day 6. That is not an automatic instruction for you: transition from methadone or fentanyl and pregnancy need clinician-specific decisions. Keep close contact with the treating team; sudden worsening after a dose needs prompt clinical help.', 'El ejemplo de la fuente termina el solapamiento del agonista completo el día 6. No es una instrucción automática para usted: pasar de metadona o fentanilo y el embarazo requieren decisiones clínicas individuales. Mantenga contacto estrecho con su equipo; empeoramiento repentino tras una dosis necesita ayuda clínica pronta.')),
      h('label', { class: 'label', for: 'berne-day' }, text('Explore a reference day', 'Explore un día de referencia')), daySelect, ...checks),
    summary,
    section('alpha2-rebound', text('Xylazine / medetomidine: a separate withdrawal risk', 'Xilacina / medetomidina: otro riesgo de abstinencia'),
      p(text('These non-opioid alpha-2 sedatives can cause severe rebound high blood pressure, fast pulse, agitation and vomiting when stopped. Opioid withdrawal treatment alone may not control this. Naloxone still treats the opioid component of an overdose; support breathing and call 911.', 'Estos sedantes alfa-2 no opioides pueden causar rebote grave de presión alta, pulso rápido, agitación y vómitos al suspenderse. Tratar solo la abstinencia de opioides puede no bastar. La naloxona aún trata el componente opioide de una sobredosis; apoye la respiración y llame al 911.')),
      ul([
        text('Clinician protocols may use clonidine, guanfacine or tizanidine; they are not interchangeable. Blood pressure, pulse, sedation, interactions and a gradual clinician-directed taper require monitoring. Do not combine them or stop prescribed clonidine suddenly on your own.', 'Los protocolos clínicos pueden usar clonidina, guanfacina o tizanidina; no son intercambiables. Hay que vigilar presión, pulso, sedación, interacciones y reducción gradual dirigida. No las combine ni suspenda clonidina recetada de golpe por su cuenta.'),
        text('Repeated vomiting, very high blood pressure, severe headache, chest pain or altered alertness require urgent hospital evaluation. Severe cases may need monitored IV dexmedetomidine. Tell the team about recent exposures and prior hospital withdrawal.', 'Vómitos repetidos, presión muy alta, dolor de cabeza intenso, dolor de pecho o alerta alterada requieren evaluación hospitalaria urgente. Los casos graves pueden necesitar dexmedetomidina IV vigilada. Informe exposiciones recientes y hospitalizaciones previas por abstinencia.'),
        text('For wounds: gently rinse with clean water or saline and cover with a clean non-adherent dressing. Avoid peroxide, alcohol, picking or cutting tissue. Ask a wound clinician about enzymatic debridement (such as collagenase) and infection assessment. Spreading redness, fever, worsening pain, black tissue or exposed tendon/bone need prompt care.', 'Para heridas: enjuague suavemente con agua limpia o solución salina y cubra con apósito limpio no adherente. Evite peróxido, alcohol, arrancar o cortar tejido. Consulte sobre desbridamiento enzimático (como colagenasa) y evaluación de infección. Enrojecimiento extendido, fiebre, dolor creciente, tejido negro o tendón/hueso expuesto necesitan atención pronta.'),
      ])),
    section('withdrawal-pregnancy', text('Pregnancy & postpartum: ACOG care standards', 'Embarazo y posparto: normas de ACOG'), p(text('Methadone or buprenorphine treatment with prenatal/addiction care is preferred to withdrawal alone because return to use and overdose can be dangerous. Do not abruptly stop treatment or switch from methadone without your treating team. This six-day reference is not a pregnancy regimen. Alcohol or benzodiazepine dependence also needs supervised care. Keep naloxone available in pregnancy and after birth.', 'El tratamiento con metadona o buprenorfina junto con atención prenatal/de adicciones es preferible a solo abstinencia, porque volver al consumo y sobredosis pueden ser peligrosos. No suspenda el tratamiento ni cambie metadona sin su equipo. Esta referencia de seis días no es un régimen para embarazo. La dependencia de alcohol o benzodiacepinas también requiere supervisión. Tenga naloxona durante el embarazo y después del parto.'))),
    section('withdrawal-bridge', text('Emergency bridge access: DEA 72-Hour Rule', 'Acceso puente de emergencia: regla DEA de 72 horas'),
      p(text('21 CFR § 1306.07(b) permits an otherwise authorized practitioner who is not an OTP to dispense, but not prescribe under this exception, up to a three-day supply of a narcotic medicine to relieve acute withdrawal while arranging referral. The emergency treatment cannot be renewed or extended under this rule; state and federal requirements still apply. This is legal permission, not a guarantee a hospital will offer methadone or a right to take-home dosing. Buprenorphine prescribing has separate authorization requirements.', '21 CFR § 1306.07(b) permite a un profesional autorizado que no es un OTP dispensar, pero no recetar bajo esta excepción, hasta tres días de un medicamento narcótico para aliviar abstinencia aguda mientras gestiona derivación. No puede renovar ni extender este tratamiento bajo la regla; siguen vigentes requisitos estatales y federales. Es permiso legal, no garantía de que el hospital ofrezca metadona ni derecho a dosis para casa. Recetar buprenorfina tiene requisitos de autorización distintos.')),
      p(text('You can ask: “Can you assess my withdrawal, discuss an emergency bridge under 21 CFR 1306.07(b), and arrange ongoing treatment?” EMTALA protects emergency screening and stabilization or appropriate transfer at Medicare-participating hospital emergency departments regardless of ability to pay; it does not guarantee a particular medicine.', 'Puede preguntar: “¿Pueden evaluar mi abstinencia, considerar un puente bajo 21 CFR 1306.07(b) y coordinar tratamiento continuo?” EMTALA protege evaluación de emergencia y estabilización o traslado apropiado en urgencias participantes en Medicare sin importar capacidad de pago; no garantiza un medicamento específico.'))),
    h('div', { class: 'actions no-print' }, h('button', { type: 'button', class: 'btn btn-secondary', onclick: () => printClinicalHandout(summary) }, text('Print discussion checklist', 'Imprimir lista para conversar')),
      h('button', { type: 'button', class: 'btn btn-ghost', onclick: resetWithdrawalPlannerState }, text('Clear selections', 'Borrar selecciones')),
      h('a', { class: 'btn btn-secondary', href: '#/clinical-scores' }, text('COWS / CIWA-Ar self-checks', 'Autoevaluaciones COWS / CIWA-Ar')),
      h('a', { class: 'btn btn-primary', href: '#/treatment', 'data-navigator-handoff': 'true', onclick: () => setNavigatorHandoffState({ codes: state.pregnancy ? ['PW', 'BU', 'OTP'] : ['BU', 'OTP'] }) }, text('Find medication treatment', 'Buscar tratamiento con medicamentos'))),
    section('withdrawal-reference-sources', text('Sources to review with your clinician', 'Fuentes para revisar con su profesional'), ul([
      ext('https://www.ashp.org/-/media/assets/pharmacy-practice/resource-centers/ambulatory-care/docs/Low-dose-Buprenorphine-Induction-FAQ.pdf', text('ASHP — low-dose buprenorphine FAQ (2025)', 'ASHP — buprenorfina en dosis bajas (2025)')),
      ext('https://www.hivguidelines.org/guideline/opioid-use-disorder/', text('NYSDOH — opioid use disorder care', 'NYSDOH — atención del trastorno por uso de opioides')),
      ext('https://www.cdc.gov/han/php/notices/han00527.html', text('CDC — medetomidine health advisory (2026)', 'CDC — aviso de medetomidina (2026)')),
      ext('https://penncamp.org/wp-content/uploads/2026/06/PDPH-HAN-MWD-06.22.2026.html', text('Philadelphia Health Department — alpha-2 withdrawal monitoring', 'Departamento de Salud de Filadelfia — vigilancia de abstinencia alfa-2')),
      ext('https://www.acog.org/womens-health/faqs/opioid-use-disorder-and-pregnancy', text('ACOG — opioid use disorder and pregnancy', 'ACOG — trastorno por uso de opioides y embarazo')),
      ext('https://www.ecfr.gov/current/title-21/section-1306.07', '21 CFR § 1306.07(b)'),
      ext('https://www.cms.gov/priorities/your-patient-rights/emergency-room-rights', 'CMS — EMTALA'),
    ])));
  view._cleanup = () => {
    resets.delete(resetForm);
    daySelect.value = '1';
    for (const { input } of controls) input.checked = false;
    controls.length = 0;
    clear(summary);
    clear(view);
  };
  renderSummary();
  return view;
}

export default withdrawalPlannerView;
