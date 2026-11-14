import { INTERACTIONS, NALTREXONE_WASHOUT_GUIDANCE, NON_OPIOID_PAIN_ALTERNATIVES, REGIMEN_AGENTS, evaluateRegimenSafety, evaluatePolypharmacyRegimen, evaluateDrugInteractions, getRegimenAgentLabel, localizeInteraction } from './pharmacologyEngine.js';
export { INTERACTIONS, NALTREXONE_WASHOUT_GUIDANCE, NON_OPIOID_PAIN_ALTERNATIVES, calculateNaltrexoneWashout, REGIMEN_AGENTS, evaluateRegimenSafety, evaluatePolypharmacyRegimen, evaluateDrugInteractions } from './pharmacologyEngine.js';
import { h, clear, ext, tel, icon, announce } from '../dom.js';
import { pageHeader, section, p, fine, ul, strong, tocNav, emergencyCallout } from './common.js';
import { t, getLang } from '../i18n.js';
import { registerQuickExitHandler } from '../quickExitRegistry.js';

// Quick Exit clears this module's in-memory state (see runQuickExitResets in app.js).
registerQuickExitHandler(resetPharmacologyState);

const tr = (en, es) => (getLang() === 'es' ? es : en);

const medicationsState = {
  activeCategory: 'all',
  activeSubstance: 'all',
  medicationSearch: '',
  interactionSearch: '',
  selectedRegimen: new Set(),
  plainLanguage: false,
  washoutOpioid: 'fentanyl',
};

let activeMedicationsReset = null;

export function getMedicationsState() {
  return {
    activeCategory: medicationsState.activeCategory,
    activeSubstance: medicationsState.activeSubstance,
    medicationSearch: medicationsState.medicationSearch,
    interactionSearch: medicationsState.interactionSearch,
    selectedRegimen: [...medicationsState.selectedRegimen],
    plainLanguage: Boolean(medicationsState.plainLanguage),
    washoutOpioid: medicationsState.washoutOpioid,
  };
}

export function resetMedicationsState() {
  medicationsState.activeCategory = 'all';
  medicationsState.activeSubstance = 'all';
  medicationsState.medicationSearch = '';
  medicationsState.interactionSearch = '';
  medicationsState.selectedRegimen.clear();
  medicationsState.plainLanguage = false;
  medicationsState.washoutOpioid = 'fentanyl';
  if (typeof activeMedicationsReset === 'function' && typeof globalThis.document !== 'undefined' && typeof globalThis.document.createElement === 'function') {
    activeMedicationsReset();
  }
}

/** Public reset contract; the engine itself is pure and holds no patient state. */
export function resetPharmacologyState() {
  resetMedicationsState();
}

export const MEDICATION_CATEGORIES = [
  { id: 'all', label: 'All medications' },
  { id: 'oud', label: 'Opioid Use Disorder (MOUD)' },
  { id: 'aud', label: 'Alcohol Use Disorder (MAUD)' },
  { id: 'reversal', label: 'Overdose Reversal' },
  { id: 'stimulant_nicotine', label: 'Stimulants & Nicotine' },
];

export const MEDICATIONS = [
  // ---------------------------------------------------------------- OUD (MOUD)
  {
    id: 'buprenorphine',
    category: 'oud',
    name: 'Buprenorphine',
    searchTerms: ['Bernese Method', 'micro-induction', 'microinducción'],
    brands: [
      'Suboxone (buprenorphine/naloxone film or tablet)',
      'Zubsolv (buprenorphine/naloxone sublingual tablet)',
      'Subutex / generic buprenorphine mono-product',
      'Sublocade (monthly extended-release subcutaneous injection)',
      'Brixadi (weekly or monthly extended-release subcutaneous injection)',
    ],
    forms: 'Daily sublingual film/tablet (dissolved under the tongue or inside the cheek) or weekly/monthly subcutaneous depot injection given by a clinician.',
    samhsaCodes: ['BU'],
    finderHref: '#/treatment?codes=BU',
    finderLabel: 'Find buprenorphine prescribers & clinics',
    summary: 'An FDA-approved medication for opioid use disorder that can reduce withdrawal and cravings. Treatment with buprenorphine is associated with lower overdose risk, but it does not eliminate that risk.',
    mechanism: 'Buprenorphine is a partial mu-opioid receptor agonist. Its respiratory-depressant effects have a ceiling relative to full agonists, but breathing can still slow dangerously—especially with alcohol, benzodiazepines, or other sedatives.',
    howToStart: 'The timing and method of starting buprenorphine depend on the person, the opioid used, and clinical circumstances. A clinician may discuss a standard start after withdrawal begins or a low-dose approach; neither a fixed wait nor a particular approach guarantees that precipitated withdrawal will not occur. This self-check is not a dosing or start-time guide.',
    access: 'A practitioner with the required DEA registration and state authority may prescribe buprenorphine for opioid use disorder; the former federal X-waiver is no longer required. Scope-of-practice and other requirements still apply.',
    clinicalPearls: [
      'Do not change a prescribed dose or start method based on this guide. Ask the prescriber or pharmacist about product-specific instructions.',
      'Combining buprenorphine with alcohol, benzodiazepines, or other sedatives can cause dangerous breathing problems. Do not stop a regularly used benzodiazepine suddenly; ask a clinician about a safe plan.',
      'During pregnancy or breastfeeding, do not stop buprenorphine without speaking with a clinician. The choice of formulation and plan should be individualized.',
      'Dental problems have been reported with transmucosal buprenorphine. Follow the product instructions and ask a dental or medical professional about oral care.',
    ],
    translations: {
      es: {
        summary: 'La buprenorfina es un medicamento aprobado por la FDA para el trastorno por consumo de opioides que puede reducir la abstinencia y los antojos. El tratamiento se asocia con menor riesgo de sobredosis, pero no lo elimina.',
        mechanism: 'La buprenorfina es un agonista parcial de los receptores opioides mu. Sus efectos depresores de la respiración tienen un límite en comparación con los agonistas completos, pero aun así puede ralentizar la respiración de forma peligrosa, especialmente junto con alcohol, benzodiacepinas u otros sedantes.',
        howToStart: 'El momento y el método para iniciar la buprenorfina dependen de la persona, el opioide usado y las circunstancias clínicas. Un profesional puede hablar sobre un inicio estándar cuando comienza la abstinencia o un método de dosis bajas; ningún tiempo de espera ni método garantiza que no ocurra abstinencia precipitada. Esta autoevaluación no indica dosis ni cuándo iniciar.',
        access: 'Un profesional con el registro requerido de la DEA y autorización estatal puede recetar buprenorfina para el trastorno por consumo de opioides; ya no se requiere la exención federal X-waiver anterior. Siguen aplicando el alcance profesional y otros requisitos.',
        clinicalPearls: [
          'No cambie una dosis recetada ni el método de inicio basándose en esta guía. Consulte las instrucciones del producto con quien lo receta o con un farmacéutico.',
          'Combinar buprenorfina con alcohol, benzodiacepinas u otros sedantes puede causar problemas respiratorios peligrosos. No suspenda de repente una benzodiacepina que usa con regularidad; consulte a un profesional sobre un plan seguro.',
          'Durante el embarazo o la lactancia, no suspenda la buprenorfina sin hablar con un profesional. La elección de formulación y el plan deben individualizarse.',
          'Se han reportado problemas dentales con la buprenorfina transmucosa. Siga las instrucciones del producto y consulte sobre el cuidado bucal con un profesional dental o médico.',
        ],
      },
    },
    sources: [
      ['SAMHSA Buprenorphine Guide', 'https://www.samhsa.gov/substance-use/treatment/options/buprenorphine'],
      ['ASAM National Practice Guideline', 'https://www.asam.org/quality-care/clinical-guidelines/national-practice-guideline'],
    ],
  },
  {
    id: 'methadone',
    category: 'oud',
    name: 'Methadone',
    brands: [
      'Methadose (oral liquid concentrate / dispersible tablet)',
      'Dolophine (oral tablet)',
    ],
    forms: 'Daily oral liquid, dissolvable diskette, or tablet dispensed through a certified Opioid Treatment Program (OTP).',
    samhsaCodes: ['OTP', 'MU'],
    finderHref: '#/treatment?codes=OTP',
    finderLabel: 'Find methadone clinics (OTPs)',
    summary: 'Methadone is an FDA-approved, full opioid agonist used to treat opioid use disorder. It can reduce withdrawal and cravings; its effects can accumulate, so initiation and dose changes require individualized clinical monitoring.',
    mechanism: 'Methadone activates mu-opioid receptors. Unlike partial agonists, it has no ceiling on respiratory-depressant effects; overdose risk can increase during initiation or when combined with other sedating substances.',
    howToStart: 'Methadone treatment for opioid use disorder is started and adjusted by a qualified clinician. There is no patient-specific dose or schedule that can be safely inferred from this guide; do not take extra or unprescribed methadone.',
    access: 'Methadone for opioid use disorder is generally provided through a SAMHSA-certified Opioid Treatment Program (OTP). Federal rules also contain limited emergency and hospital provisions; availability depends on the setting, practitioner authority, and applicable law. The 2024 Part 8 rule allows individualized OTP decisions about take-home medication and telehealth screening; it does not guarantee a particular take-home amount or remote start.',
    clinicalPearls: [
      'Methadone can cause life-threatening breathing problems, particularly during dose changes or when taken with alcohol, benzodiazepines, or other sedatives. Follow the prescription exactly.',
      'Tell the treatment team about all medicines and substances; some can change methadone effects or affect heart rhythm. A clinician decides whether monitoring or a dose change is needed.',
      'Do not stop methadone or change the dose without contacting the treatment team. Pregnancy and acute pain need an individualized care plan.',
    ],
    translations: {
      es: {
        summary: 'La metadona es un agonista opioide completo aprobado por la FDA para tratar el trastorno por consumo de opioides. Puede reducir la abstinencia y los antojos; sus efectos pueden acumularse, por lo que el inicio y los cambios de dosis requieren monitoreo clínico individualizado.',
        mechanism: 'La metadona activa los receptores opioides mu. A diferencia de los agonistas parciales, no tiene un límite para sus efectos depresores de la respiración; el riesgo de sobredosis puede aumentar al iniciar el tratamiento o combinarla con otras sustancias sedantes.',
        howToStart: 'Un profesional calificado inicia y ajusta la metadona para tratar el trastorno por consumo de opioides. Esta guía no puede determinar una dosis ni un horario seguros para una persona; no tome metadona adicional ni que no le hayan recetado.',
        access: 'La metadona para el trastorno por consumo de opioides generalmente se ofrece en un Programa de Tratamiento con Opioides (OTP) certificado por SAMHSA. Las normas federales también incluyen disposiciones limitadas para emergencias y hospitales; la disponibilidad depende del lugar, la autoridad del profesional y la ley aplicable. La norma Parte 8 de 2024 permite decisiones individualizadas del OTP sobre medicamentos para llevar y evaluaciones por telesalud; no garantiza una cantidad específica ni un inicio remoto.',
        clinicalPearls: [
          'La metadona puede causar problemas respiratorios potencialmente mortales, especialmente durante cambios de dosis o al combinarla con alcohol, benzodiacepinas u otros sedantes. Siga exactamente la receta.',
          'Informe al equipo de tratamiento sobre todos sus medicamentos y sustancias; algunos pueden cambiar los efectos de la metadona o afectar el ritmo cardíaco. Un profesional decide si se requiere monitoreo o un cambio de dosis.',
          'No suspenda la metadona ni cambie la dosis sin comunicarse con el equipo de tratamiento. El embarazo y el dolor agudo requieren un plan de atención individualizado.',
        ],
      },
    },
    sources: [
      ['SAMHSA Methadone Guide', 'https://www.samhsa.gov/substance-use/treatment/options/methadone'],
      ['SAMHSA 42 CFR Part 8 Final Rule (2024)', 'https://www.samhsa.gov/medications-substance-use-disorders/statutes-regulations-guidelines/42-cfr-part-8'],
    ],
  },
  {
    id: 'xr-naltrexone',
    category: 'oud',
    name: 'Extended-Release Naltrexone (for OUD)',
    brands: [
      'Vivitrol (380 mg monthly intramuscular injection)',
    ],
    forms: 'Once-monthly (every 4 weeks) deep intramuscular gluteal injection administered by a healthcare professional.',
    samhsaCodes: ['NU'],
    finderHref: '#/treatment?codes=NU',
    finderLabel: 'Find extended-release naltrexone providers',
    summary: 'Extended-release naltrexone is an opioid antagonist used to treat opioid use disorder after an opioid-free interval. It does not treat an active opioid overdose and can precipitate severe withdrawal if opioids remain in the body.',
    mechanism: 'Competitive mu-opioid receptor antagonist. It binds tightly to opioid receptors without activating them, preventing heroin, fentanyl, or prescription opioids from attaching or producing euphoria or sedation.',
    howToStart: 'A clinician must assess readiness after an opioid-free interval. FDA labeling describes a typical interval after short-acting opioids and warns that transition from buprenorphine or methadone may require longer. Fentanyl exposure and long-acting products need individualized assessment; a urine test or challenge does not guarantee that starting is safe.',
    access: 'Can be prescribed and administered by any licensed physician, nurse practitioner, or physician assistant in primary care, psychiatry, or outpatient addiction clinics—no special certification required.',
    clinicalPearls: [
      'Opioid tolerance may be lower during or after naltrexone treatment. Trying to overcome the blockade or returning to a previously tolerated amount can cause fatal overdose. Keep naloxone available and seek urgent care for suspected overdose.',
      'Do not use opioid pain medicines with naltrexone without a clinician’s plan. Tell emergency and pain-care teams that you take naltrexone.',
      'Contraindicated in acute hepatitis or liver failure, and cannot be used alongside opioid pain medications (non-opioid or regional pain control must be used in emergencies).',
    ],
    translations: {
      es: {
        summary: 'La naltrexona de liberación prolongada es un antagonista opioide para tratar el trastorno por consumo de opioides después de un período sin opioides. No trata una sobredosis activa y puede precipitar abstinencia grave si aún quedan opioides en el cuerpo.',
        howToStart: 'Un profesional debe evaluar si está listo después de un período sin opioides. La etiqueta de la FDA describe un intervalo típico después de opioides de acción corta y advierte que la transición desde buprenorfina o metadona puede requerir más tiempo. La exposición al fentanilo y los productos de acción prolongada requieren una evaluación individual; una prueba de orina o de provocación no garantiza que sea seguro iniciar.',
        clinicalPearls: [
          'La tolerancia a opioides puede ser menor durante o después del tratamiento con naltrexona. Intentar vencer el bloqueo o volver a una cantidad antes tolerada puede causar una sobredosis mortal. Tenga naloxona disponible y busque atención urgente ante una posible sobredosis.',
          'No use analgésicos opioides junto con naltrexona sin un plan profesional. Informe a los equipos de urgencias y de tratamiento del dolor que toma naltrexona.',
          'La naltrexona está contraindicada en ciertas afecciones hepáticas graves; un profesional debe revisar su salud y la etiqueta del producto.',
        ],
      },
    },
    sources: [
      ['SAMHSA Naltrexone Guide', 'https://www.samhsa.gov/substance-use/treatment/options/naltrexone'],
      ['NIDA Medications for OUD', 'https://nida.nih.gov/publications/research-reports/medications-to-treat-opioid-addiction/overview'],
    ],
  },

  // ---------------------------------------------------------------- AUD (MAUD)
  {
    id: 'naltrexone-aud',
    category: 'aud',
    name: 'Naltrexone (Oral & Monthly Injectable for AUD)',
    brands: [
      'ReVia / generic naltrexone (50 mg oral tablet)',
      'Vivitrol (380 mg monthly intramuscular injection)',
    ],
    forms: 'Once-daily 50 mg oral tablet (or targeted dosing prior to drinking) or once-monthly 380 mg intramuscular injection.',
    samhsaCodes: ['NU', 'PMAT'],
    finderHref: '#/treatment?codes=PMAT',
    finderLabel: 'Find alcohol use disorder medication providers',
    summary: 'A first-line FDA-approved medication for alcohol use disorder that blunts the brain’s endorphin reward from alcohol, significantly reducing cravings and heavy drinking days.',
    mechanism: 'Mu-opioid receptor antagonist. Alcohol triggers the release of natural endorphins in the brain’s mesolimbic reward pathway; naltrexone blocks those endorphin receptors so drinking feels less rewarding and the urge to keep drinking after one drink ("loss of control") diminishes.',
    howToStart: 'Oral naltrexone may be started while someone is still drinking under a clinician’s care. The Vivitrol injection label requires that patients not be actively drinking at the first injection. Neither formulation treats acute alcohol withdrawal. Opioid-free readiness and liver health must be assessed before either formulation.',
    access: 'Available by prescription from any primary care provider, telehealth doctor, psychiatrist, or addiction program.',
    clinicalPearls: [
      'Naltrexone does not cause the disulfiram-alcohol reaction. Drinking can still be dangerous; physical dependence requires a medically planned withdrawal approach.',
      'Taking the first few oral doses with food or starting at 25 mg for 2–3 days before increasing to 50 mg minimizes mild stomach upset or headache.',
      'Must be avoided in anyone taking opioid pain medications, buprenorphine, or methadone, or anyone with acute hepatitis or decompensated cirrhosis.',
    ],
    sources: [
      ['NIAAA Alcohol Treatment Navigator', 'https://alcoholtreatment.niaaa.nih.gov/'],
      ['SAMHSA TIP 49: Incorporating Alcohol Pharmacotherapies', 'https://library.samhsa.gov/'],
    ],
  },
  {
    id: 'acamprosate',
    category: 'aud',
    name: 'Acamprosate',
    brands: [
      'Campral / generic acamprosate calcium (333 mg delayed-release tablets)',
    ],
    forms: 'Delayed-release oral tablets, typically two 333 mg tablets (666 mg) taken three times daily.',
    samhsaCodes: ['PMAT'],
    finderHref: '#/treatment?codes=PMAT',
    finderLabel: 'Find AUD medication providers',
    summary: 'An FDA-approved first-line medication that calms the overactive glutamate system after stopping alcohol, easing protracted restlessness, insomnia, and anxiety to help maintain abstinence.',
    mechanism: 'Modulates NMDA glutamate receptor hyperactivity and supports GABAergic balance. Chronic alcohol use upregulates excitatory glutamate receptors; when alcohol is stopped, unopposed glutamate excess causes lingering brain hyperexcitability and cravings that acamprosate helps normalize.',
    howToStart: 'Works best when initiated as soon as acute alcohol withdrawal is complete and the person has achieved initial abstinence. Continue taking it even if a brief slip occurs.',
    access: 'Prescribed by primary care clinicians, psychiatrists, and outpatient treatment programs.',
    clinicalPearls: [
      'Excreted 100% unchanged by the kidneys with zero liver metabolism—making acamprosate the safest first-line FDA-approved AUD medication for people with alcohol-associated liver disease or hepatitis, and safe for people taking opioids.',
      'Requires kidney function check before starting: dose is reduced to one 333 mg tablet three times daily for moderate kidney impairment (CrCl 30–50 mL/min) and avoided in severe kidney disease (CrCl <= 30 mL/min).',
      'Pairing three-times-daily dosing with meals or setting phone alarms helps maintain steady blood levels.',
    ],
    sources: [
      ['NIAAA Healthcare Professional Core Resource', 'https://www.niaaa.nih.gov/health-professionals-communities/core-resource-on-alcohol'],
      ['APA Practice Guideline for AUD Pharmacotherapy', 'https://www.psychiatry.org/psychiatrists/practice/clinical-practice-guidelines'],
    ],
  },
  {
    id: 'disulfiram',
    category: 'aud',
    name: 'Disulfiram',
    brands: [
      'Antabuse / generic disulfiram (250 mg and 500 mg oral tablets)',
    ],
    forms: 'Once-daily oral tablet (typically 250 mg daily).',
    samhsaCodes: ['PMAT'],
    finderHref: '#/treatment?codes=PMAT',
    finderLabel: 'Find AUD medication providers',
    summary: 'An FDA-approved deterrent medication that blocks the breakdown of alcohol, causing an immediate, intensely unpleasant physical reaction if any alcohol is consumed.',
    mechanism: 'Irreversible inhibitor of aldehyde dehydrogenase (ALDH). If alcohol is consumed, toxic acetaldehyde rapidly accumulates in the bloodstream within 10–30 minutes, causing facial flushing, throbbing headache, nausea, vomiting, chest tightness, rapid heart rate, and blood pressure drops.',
    howToStart: 'Requires strict abstinence from alcohol for at least 12–48 hours (and a zero blood alcohol level) before the first dose. Works best for individuals committed to complete abstinence, especially when taken with supportive supervision (such as a partner, pharmacist, or clinic nurse) or before high-risk events.',
    access: 'Available by prescription from primary care providers, psychiatrists, and addiction specialists.',
    clinicalPearls: [
      'Because disulfiram permanently disables the ALDH enzyme until your body synthesizes new enzyme, the alcohol reaction can still happen for up to 14 days after your last pill.',
      'Avoid all hidden alcohol sources: alcohol-based mouthwashes, liquid cold/cough syrups (elixirs), cooking wine, vinegars, kombucha, aftershaves, and certain sauces.',
      'Contraindicated in severe coronary artery disease, psychosis, or decompensated liver cirrhosis; requires baseline and periodic liver function blood tests.',
    ],
    sources: [
      ['NIAAA Medications for AUD', 'https://www.niaaa.nih.gov/publications/brochures-and-fact-sheets/treatment-alcohol-problems-finding-and-getting-help'],
    ],
  },
  {
    id: 'off-label-aud',
    category: 'aud',
    name: 'Evidence-Based Off-Label AUD Pharmacotherapy (Topiramate, Gabapentin, Baclofen)',
    brands: [
      'Topiramate (Topamax)',
      'Gabapentin (Neurontin)',
      'Baclofen (Lioresal / generic)',
    ],
    forms: 'Oral capsules or tablets prescribed individually based on symptoms, liver/kidney health, and goals.',
    samhsaCodes: ['PMAT'],
    finderHref: '#/treatment?codes=PMAT',
    finderLabel: 'Find AUD medication prescribers',
    summary: 'Guideline-supported medications (recommended by the American Psychiatric Association and VA/DoD guidelines) used when first-line FDA-approved options are not tolerated, or to target protracted insomnia, anxiety, or advanced liver disease.',
    mechanism: 'Topiramate enhances GABA activity and antagonizes AMPA/kainate glutamate receptors to reduce dopamine release from alcohol. Gabapentin modulates voltage-gated calcium channels (alpha-2-delta subunit) in the amygdala, calming stress-induced cravings and sleep disruption. Baclofen is a GABA-B receptor agonist that suppresses alcohol cravings.',
    howToStart: 'Can be initiated in primary care or specialty clinics. Topiramate is titrated slowly over several weeks (up to 150–300 mg/day) and can be started while still drinking. Gabapentin (typically 900–1800 mg/day divided) is particularly effective for people with alcohol withdrawal-related insomnia and anxiety.',
    access: 'Widely available generics at any pharmacy with a prescription from a primary care clinician or psychiatrist.',
    clinicalPearls: [
      'Topiramate has strong randomized trial evidence for reducing heavy drinking days and promoting abstinence, and may also reduce cigarette smoking; titrate slowly to avoid word-finding difficulty or tingling in fingers/toes.',
      'Gabapentin relieves protracted withdrawal insomnia and anxiety without hepatic metabolism, but use caution and medical supervision if you also take opioids due to additive respiratory depression risk.',
      'Baclofen is primarily excreted by the kidneys and has randomized trial support specifically in patients with advanced alcohol-associated liver cirrhosis where naltrexone and disulfiram are unsafe.',
    ],
    sources: [
      ['VA/DoD Substance Use Disorder Clinical Practice Guideline', 'https://www.healthquality.va.gov/guidelines/MH/sud/'],
      ['APA Practice Guideline for Alcohol Use Disorder', 'https://www.psychiatry.org/psychiatrists/practice/clinical-practice-guidelines'],
    ],
  },

  // ---------------------------------------------------------------- Overdose Reversal
  {
    id: 'naloxone-nalmefene',
    category: 'reversal',
    name: 'Naloxone & Nalmefene (Opioid Overdose Reversal)',
    brands: [
      'Narcan / RiVive / generic naloxone (3 mg or 4 mg intranasal spray — OTC)',
      'Kloxxado (8 mg intranasal naloxone spray)',
      'Injectable IM Naloxone (0.4 mg/mL single-dose vials + intramuscular syringes)',
      'Zimhi (5 mg/0.5 mL high-dose naloxone single-dose prefilled syringe, IM/SC — prescription)',
      'Opvee (2.7 mg intranasal nalmefene spray — prescription)',
      'Zurnai (1.5 mg nalmefene IM/SC auto-injector — prescription, FDA-approved Aug 2024)',
    ],
    forms: 'Ready-to-use single-step nasal spray or intramuscular (IM) vial/syringe injected into the outer thigh or upper arm.',
    samhsaCodes: ['NOE'],
    finderHref: '#/treatment?codes=NOE',
    finderLabel: 'Find free naloxone & overdose education',
    summary: 'Naloxone and nalmefene can reverse opioid effects during a suspected overdose. They are temporary treatments; call 911 and follow the specific product instructions.',
    mechanism: 'Naloxone and nalmefene are opioid-receptor antagonists. Naloxone may restore breathing within minutes, but response and duration vary, and more than one dose may be needed. Nalmefene lasts longer and can cause withdrawal symptoms that last longer.',
    howToStart: 'For a suspected overdose, give naloxone promptly, call 911, and support breathing as trained or directed by the dispatcher. Follow the product label for repeat doses if breathing does not improve or worsens. Stay with the person until emergency help arrives.',
    access: '4 mg and 3 mg naloxone nasal sprays (Narcan, RiVive, generics) are available Over-The-Counter (OTC) without a prescription at pharmacies, grocery stores, and online, and are distributed for free by harm reduction programs, health departments, and mail-based programs like NEXT Distro.',
    clinicalPearls: [
      'Use the naloxone product available without delay. One observational study found no survival difference and more withdrawal symptoms with 8 mg than 4 mg nasal naloxone in the study population; this does not establish that one product is best for every overdose.',
      'Naloxone does not reverse xylazine or other non-opioid sedatives. Give it for any suspected opioid-involved overdose, call 911, support breathing, and continue monitoring because sedation or breathing problems may persist.',
      'If the person does not respond or breathing becomes abnormal again, follow the product instructions for repeat doses while waiting for emergency help.',
    ],
    translations: {
      es: {
        summary: 'La naloxona y el nalmefeno pueden revertir los efectos opioides durante una posible sobredosis. Son tratamientos temporales; llame al 911 y siga las instrucciones del producto específico.',
        mechanism: 'La naloxona y el nalmefeno son antagonistas de los receptores opioides. La naloxona puede restablecer la respiración en minutos, pero la respuesta y la duración varían y puede requerirse más de una dosis. El nalmefeno dura más y puede causar síntomas de abstinencia más prolongados.',
        howToStart: 'Ante una posible sobredosis, administre naloxona de inmediato, llame al 911 y apoye la respiración según su capacitación o las instrucciones de la persona operadora. Siga la etiqueta del producto para repetir dosis si la respiración no mejora o empeora. Quédese con la persona hasta que llegue ayuda de emergencia.',
        clinicalPearls: [
          'Use sin demora el producto de naloxona disponible. Un estudio observacional no halló diferencia de supervivencia y encontró más síntomas de abstinencia con naloxona nasal de 8 mg que de 4 mg en la población estudiada; esto no demuestra que un producto sea mejor para todas las sobredosis.',
          'La naloxona no revierte la xilacina ni otros sedantes no opioides. Adminístrela ante cualquier posible sobredosis con opioides, llame al 911, apoye la respiración y siga vigilando porque la sedación o los problemas respiratorios pueden continuar.',
          'Si la persona no responde o la respiración vuelve a ser anormal, siga las instrucciones del producto para repetir dosis mientras espera ayuda de emergencia.',
        ],
      },
    },
    sources: [
      ['ACMT & AACT Position Statement on Nalmefene vs Naloxone', 'https://www.acmt.net/'],
      ['SAMHSA Overdose Prevention and Response Toolkit', 'https://library.samhsa.gov/product/overdose-prevention-response-toolkit/pep23-03-00-001'],
      ['CDC Clinical Guidance on Xylazine', 'https://www.cdc.gov/overdose-prevention/about/what-you-should-know-about-xylazine.html'],
    ],
  },

  // ---------------------------------------------------------------- Stimulant & Nicotine
  {
    id: 'stimulant-care',
    category: 'stimulant_nicotine',
    name: 'Stimulant Use Disorder Care (Contingency Management & Pharmacotherapy)',
    brands: [
      'Contingency Management (CMI) + CBT / Community Reinforcement',
      'Extended-Release Bupropion + Injectable Naltrexone (ADAPT-2 protocol for methamphetamine)',
      'Mirtazapine (Remeron — off-label for methamphetamine)',
      'Topiramate / Bupropion (off-label for cocaine)',
    ],
    forms: 'Structured incentive-based behavioral therapy combined with targeted off-label oral/injectable medications tailored by an addiction specialist.',
    samhsaCodes: ['CMI'],
    finderHref: '#/treatment?codes=CMI',
    finderLabel: 'Find programs offering contingency management',
    summary: 'While no single medication is yet FDA-approved specifically for methamphetamine or cocaine use disorder, Contingency Management (CMI) paired with evidence-based pharmacotherapy significantly increases abstinence and reduces cravings.',
    mechanism: 'Contingency Management rebuilds natural dopamine reward circuitry through immediate, tangible positive reinforcement. Pharmacologically, combining bupropion (a norepinephrine-dopamine reuptake inhibitor that eases post-stimulant dysphoria and cravings) with extended-release naltrexone (which modulates opioid-mediated reward pathways) produced significant reductions in methamphetamine use in the landmark NEJM ADAPT-2 trial.',
    howToStart: 'Can be started immediately—even during active stimulant use or early "crash" recovery (fatigue, depression, hypersomnia). Ask for clinicians familiar with the 2023 ASAM/AAAP Clinical Practice Guideline on Stimulant Use Disorders.',
    access: 'Contingency management is increasingly covered by state Medicaid waivers, VA medical centers, and SAMHSA-listed outpatient programs (`CMI`). Off-label medications can be prescribed by any primary care or psychiatric prescriber.',
    clinicalPearls: [
      'In the NEJM ADAPT-2 trial, naltrexone plus bupropion produced a weighted response of 13.6% versus 2.5% with placebo. This was a study-specific response, not a cure rate. Treatment is off-label and unsuitable during opioid agonist treatment; bupropion requires seizure-risk screening.',
      'ASAM/AAAP gives mirtazapine a conditional recommendation with low-certainty evidence for amphetamine-type stimulant use disorder. Discuss sedation, weight gain, depression, and the limits of the evidence with your clinician.',
      'Always carry naloxone and fentanyl test strips even if you only use cocaine, crack, or methamphetamine—cross-contamination in the stimulant supply is a leading cause of unexpected opioid overdose in people with zero opioid tolerance.',
    ],
    sources: [
      ['ASAM/AAAP Clinical Practice Guideline on Stimulant Use Disorders', 'https://www.asam.org/quality-care/clinical-guidelines/stimulant-use-disorders'],
      ['NIDA Methamphetamine Combination Treatment (ADAPT-2)', 'https://nida.nih.gov/about-nida/organization/cctn/ctn/research-studies/accelerated-development-additive-pharmacotherapy-treatment-adapt-2-methamphetamine-use-disorder'],
    ],
  },
  {
    id: 'nicotine-tobacco',
    category: 'stimulant_nicotine',
    name: 'Nicotine & Tobacco Cessation (Combination NRT, Varenicline, Bupropion)',
    brands: [
      'Combination NRT: 24-hour Nicotine Patch + Nicotine Gum, Lozenge, Inhaler, or Nasal Spray',
      'Varenicline (Chantix / generic)',
      'Bupropion SR (Zyban / Wellbutrin SR)',
    ],
    forms: 'Over-the-counter transdermal patches, gum, and lozenges; prescription oral tablets (varenicline, bupropion) or nasal spray.',
    samhsaCodes: ['NRT', 'NSC'],
    finderHref: '#/treatment?codes=NRT',
    finderLabel: 'Find programs offering nicotine replacement',
    summary: 'Treating tobacco and vaping dependence alongside substance use recovery does NOT jeopardize sobriety—in fact, clinical trials show quitting smoking improves long-term alcohol and drug recovery rates by up to 25%.',
    mechanism: 'Varenicline is a high-affinity partial agonist at alpha-4 beta-2 nicotinic acetylcholine receptors: it provides gentle baseline dopamine release to stop nicotine withdrawal while blocking inhaled nicotine from binding. Combination NRT pairs a steady 24-hour patch ("controller") with rapid-acting gum or lozenge ("reliever") for breakthrough cravings.',
    howToStart: 'Both varenicline and Combination NRT can be started BEFORE your target quit date ("pre-loading" or "reduce-to-quit") so cravings shrink before you put down cigarettes or vapes.',
    access: 'Nicotine patches, gum, and lozenges are sold OTC at any pharmacy, and most Medicaid and ACA health plans cover both OTC NRT and varenicline at $0 copay when a doctor or pharmacist writes a prescription. Call 1-800-QUIT-NOW for free patches/lozenges by mail in most states.',
    clinicalPearls: [
      'Pharmacist pearl on Combination NRT: Using a 21 mg nicotine patch every morning PLUS 2 mg or 4 mg nicotine gum or lozenge for sudden cravings is safe and nearly doubles quit success compared to using a patch or gum alone.',
      'How to use nicotine gum ("Park and Chew"): Chew slowly until you feel a peppery tingle, then "park" the gum between your cheek and gum so nicotine absorbs through the mouth lining. Chewing continuously like regular gum swallows the nicotine, causing hiccups and heartburn instead of craving relief.',
      'The 8,000-person EAGLES trial confirmed that varenicline, bupropion, and NRT do not increase neuropsychiatric side effects in people with stable mental health or substance use conditions, and varenicline is the single most effective monotherapy.',
    ],
    sources: [
      ['CDC Smokefree.gov & Quitlines (1-800-QUIT-NOW)', 'https://smokefree.gov/'],
      ['USPHS Clinical Practice Guideline: Treating Tobacco Use', 'https://www.ahrq.gov/prevention/guidelines/tobacco/index.html'],
    ],
  },
];

export const INTERACTION_SUBSTANCES = [
  { id: 'all', label: 'All substances' },
  { id: 'opioids', label: 'Opioids (fentanyl, heroin, oxycodone)' },
  { id: 'buprenorphine', label: 'Buprenorphine (Suboxone)' },
  { id: 'methadone', label: 'Methadone' },
  { id: 'naltrexone', label: 'Naltrexone (Vivitrol)' },
  { id: 'alcohol', label: 'Alcohol' },
  { id: 'benzodiazepines', label: 'Benzodiazepines & sleep meds' },
  { id: 'xylazine', label: 'Xylazine / Medetomidine ("Tranq")' },
  { id: 'gabapentinoids', label: 'Gabapentin / Pregabalin' },
  { id: 'stimulants', label: 'Stimulants (cocaine, meth)' },
  { id: 'disulfiram', label: 'Disulfiram (Antabuse)' },
];

export const BERNESE_EXAMPLE_SCHEDULE = [];

export const REVERSAL_COMPARISON = [
  {
    product: 'Naloxone nasal spray (RiVive 3 mg or Narcan 4 mg — OTC)',
    productEs: 'Naloxona en aerosol nasal (RiVive 3 mg o Narcan 4 mg, de venta libre)',
    onset: 'May work within minutes',
    onsetEs: 'Puede hacer efecto en minutos',
    duration: 'Temporary; effects may wear off before the opioid',
    durationEs: 'Temporal; sus efectos pueden terminar antes que los del opioide',
    guidance: 'Give the available product without delay for a suspected opioid overdose. Call 911, support breathing, and follow the device label for repeat doses.',
    guidanceEs: 'Administre sin demora el producto disponible ante una posible sobredosis con opioides. Llame al 911, apoye la respiración y siga la etiqueta del dispositivo para repetir dosis.',
  },
  {
    product: 'Injectable IM Naloxone (0.4 mg/mL vial + syringe)',
    productEs: 'Naloxona inyectable IM (vial de 0,4 mg/ml y jeringa)',
    onset: 'May work within minutes',
    onsetEs: 'Puede hacer efecto en minutos',
    duration: 'Temporary; effects may wear off before the opioid',
    durationEs: 'Temporal; sus efectos pueden terminar antes que los del opioide',
    guidance: 'Use only if you have the product and training; follow its instructions. Call 911 and support breathing.',
    guidanceEs: 'Úsela solo si tiene el producto y la capacitación; siga sus instrucciones. Llame al 911 y apoye la respiración.',
  },
  {
    product: 'High-Dose Naloxone 8 mg Nasal Spray (Kloxxado)',
    productEs: 'Naloxona nasal de dosis alta de 8 mg (Kloxxado)',
    onset: 'May work within minutes',
    onsetEs: 'Puede hacer efecto en minutos',
    duration: 'Temporary; effects may wear off before the opioid',
    durationEs: 'Temporal; sus efectos pueden terminar antes que los del opioide',
    guidance: 'In one observational study of law-enforcement responses, no survival difference was observed between 8 mg and 4 mg; withdrawal symptoms were more common with 8 mg. These findings do not establish which product is best for every overdose.',
    guidanceEs: 'En un estudio observacional de respuestas policiales no se observó diferencia de supervivencia entre 8 mg y 4 mg; los síntomas de abstinencia fueron más comunes con 8 mg. Estos resultados no determinan qué producto es mejor para todas las sobredosis.',
  },
  {
    product: 'Nalmefene 2.7 mg Nasal Spray (Opvee — Rx)',
    productEs: 'Nalmefeno nasal de 2,7 mg (Opvee, con receta)',
    onset: 'Follow the product information',
    onsetEs: 'Consulte la información del producto',
    duration: 'Longer-acting than naloxone',
    durationEs: 'De acción más prolongada que la naloxona',
    guidance: 'Nalmefene can cause withdrawal symptoms that last longer. Call 911, follow the product instructions, and stay with the person.',
    guidanceEs: 'El nalmefeno puede causar síntomas de abstinencia más prolongados. Llame al 911, siga las instrucciones del producto y quédese con la persona.',
  },
  {
    product: 'Nalmefene 1.5 mg IM/SC Auto-Injector (Zurnai — Rx, FDA-approved Aug 2024)',
    productEs: 'Nalmefeno IM/SC de 1,5 mg en autoinyector (Zurnai, con receta)',
    onset: 'Follow the product information',
    onsetEs: 'Consulte la información del producto',
    duration: 'Longer-acting than naloxone',
    durationEs: 'De acción más prolongada que la naloxona',
    guidance: 'Use only according to the product labeling. Nalmefene may cause longer-lasting withdrawal symptoms; call 911 and stay with the person.',
    guidanceEs: 'Úselo únicamente según la etiqueta del producto. El nalmefeno puede causar síntomas de abstinencia más prolongados; llame al 911 y quédese con la persona.',
  },
];

export const PRESCRIBER_QUESTIONS = [
  'What are all of my medication options (buprenorphine, methadone, extended-release naltrexone, acamprosate, topiramate, or gabapentin), and which fits my health history and daily schedule best?',
  'If I have been using street fentanyl, can we use a low-dose / micro-induction ("Bernese Method") schedule or comfort medications (clonidine, Lofexidine, hydroxyzine, ondansetron, trazodone) so I don’t get sick with precipitated withdrawal?',
  'Would a weekly or monthly extended-release injection (like Sublocade, Brixadi, or Vivitrol) be covered by my insurance or Medicaid so I don’t have to worry about daily pills or films?',
  'If I start methadone at an Opioid Treatment Program (OTP), what is your clinic’s timeline for take-home doses under the 2024 SAMHSA 42 CFR Part 8 flexibilities?',
  'Could any of my current prescriptions (antidepressants, anxiety meds, HIV/Hep C meds, antibiotics, or sleep aids) interact with this medication or affect my heart rhythm (QTc) or liver/kidney function?',
  'What happens if I miss a dose, run out early, or have a return to use? Will the clinic adjust my dose rather than discharging me?',
  'Can you also prescribe over-the-counter or prescription naloxone and nicotine replacement therapy (patch + gum/lozenge) so my insurance covers them at $0 copay?',
];

export const SPECIAL_POPULATIONS_PHARM = [
  {
    id: 'pregnancy_lactation',
    title: 'Pregnancy, Postpartum & Breastfeeding',
    summary: 'Buprenorphine and methadone are the gold-standard, ACOG- and ASAM-recommended treatments during pregnancy. Continuing medication prevents fetal withdrawal cycles, preterm birth, and postpartum overdose.',
    keyPoints: [
      'Never stop buprenorphine or methadone abruptly ("detox") during pregnancy—repeated opioid withdrawal causes placental stress and high return-to-use risk.',
      'Both mono-product buprenorphine and combination buprenorphine/naloxone (Suboxone) have strong human safety data in pregnancy; no switch is required if you are stable on combination film/tablets.',
      'Blood volume and liver enzyme activity increase in the 2nd and 3rd trimesters: methadone or buprenorphine doses often need to be increased or split into twice-daily dosing to prevent evening withdrawal.',
      'Breastfeeding is safe and strongly encouraged on buprenorphine or methadone: tiny amounts pass into breastmilk, and skin-to-skin breastfeeding reduces the severity of Neonatal Opioid Withdrawal Syndrome (NOWS) and hospital stay length.',
    ],
    samhsaCodes: ['PW', 'BU', 'OTP'],
  },
  {
    id: 'hepatic_hcv',
    title: 'Liver Disease, Cirrhosis & Hepatitis C',
    summary: 'Liver inflammation or cirrhosis changes how some medications are processed, but effective addiction and Hepatitis C treatments remain safe and available.',
    keyPoints: [
      'For Alcohol Use Disorder in significant liver disease or cirrhosis, Acamprosate (100% kidney-cleared, zero liver metabolism) and off-label Baclofen or Gabapentin are preferred over disulfiram or naltrexone.',
      'Buprenorphine and methadone are safe in compensated Hepatitis C and mild-to-moderate liver impairment; in severe decompensated cirrhosis (Child-Pugh C), buprenorphine mono-product is preferred over buprenorphine/naloxone because impaired hepatic first-pass clearance can raise systemic naloxone levels.',
      'Direct-Acting Antiviral (DAA) pills cure Hepatitis C in 8–12 weeks (>95% cure rate) and are fully compatible with buprenorphine, methadone, and active substance use—you do NOT need to be abstinent to be cured of Hep C.',
    ],
    samhsaCodes: ['HCT', 'PMAT'],
  },
  {
    id: 'renal_ckd',
    title: 'Kidney Disease (CKD) & Dialysis',
    summary: 'Unlike morphine or codeine (which build up toxic metabolites in kidney failure), buprenorphine and methadone are cleared primarily through the liver and gut, making them safe in chronic kidney disease and dialysis.',
    keyPoints: [
      'Buprenorphine (including Sublocade and Brixadi) and methadone do not require routine dose reduction in chronic kidney disease or hemodialysis, and neither is significantly removed by dialysis.',
      'Acamprosate is excreted unchanged by the kidneys: reduce the dose by 50% (333 mg three times daily) for moderate kidney impairment (CrCl 30–50 mL/min) and avoid if CrCl is 30 mL/min or lower.',
      'Gabapentin and pregabalin depend 100% on renal clearance—doses must be carefully adjusted for kidney function to prevent severe sedation, myoclonus, and respiratory depression.',
    ],
    samhsaCodes: ['BU', 'OTP', 'PMAT'],
  },
  {
    id: 'acute_pain_perioperative',
    title: 'Acute Pain, Dental Work & Surgery While Taking MOUD',
    summary: 'If you have a fracture, dental procedure, labor/delivery, or surgery, clinical guidelines (ASAM, APS, SAMHSA) are clear: continue your daily buprenorphine or methadone.',
    keyPoints: [
      'Do NOT stop buprenorphine or methadone before surgery or dental work. Stopping destabilizes recovery, creates baseline opioid debt, and makes postoperative pain harder to control.',
      'Buprenorphine’s analgesic effect lasts 6–8 hours even though craving protection lasts 24+ hours: temporarily splitting your daily buprenorphine into every-6-to-8-hour doses (e.g., 4 mg four times daily) provides strong baseline pain relief.',
      'Combine scheduled multimodal non-opioid pain control (acetaminophen, NSAIDs like ibuprofen/ketorolac, local/regional nerve blocks) with short-acting high-affinity full agonists if needed in the hospital.',
      'If you take extended-release naltrexone (Vivitrol), tell your surgical/dental team in advance: oral naltrexone is held 72 hours before planned surgery, and Vivitrol requires non-opioid multimodal analgesia or regional nerve blocks for 4 weeks after the last injection.',
    ],
    samhsaCodes: ['BU', 'OTP', 'NU'],
  },
];

export const FORMULATION_MATRIX = [
  {
    id: 'bup_sl',
    name: 'Daily Sublingual Buprenorphine/Naloxone Film or Tablet',
    brandExamples: 'Suboxone, Zubsolv, generic buprenorphine/naloxone or mono-product',
    disorder: 'oud',
    frequency: 'daily',
    route: 'Sublingual / buccal (dissolved under tongue or cheek in 5–10 minutes)',
    setting: 'home_telehealth',
    childSafetyNote: 'High pediatric ingestion risk: even one film or tablet can cause fatal respiratory depression in a toddler. Always store in child-resistant packaging inside a locked box or high cabinet, and swish with water after dissolving to protect teeth.',
    costCoverage: 'Generic tablets and films are widely covered by Medicaid, Medicare, VA, and commercial insurance (often $0–$15 copay), and discounted at HRSA 340B community health center pharmacies.',
    bestFitFor: 'People who want flexible at-home dosing, telehealth initiation, or split-dosing for concurrent chronic pain.',
    samhsaCode: 'BU',
  },
  {
    id: 'bup_depot',
    name: 'Weekly or Monthly Extended-Release Buprenorphine Injection',
    brandExamples: 'Sublocade (monthly depot), Brixadi (weekly or monthly depot)',
    disorder: 'oud',
    frequency: 'weekly_monthly',
    route: 'Subcutaneous depot injection administered by a clinician (abdomen, thigh, buttock, or upper arm)',
    setting: 'clinic_office',
    childSafetyNote: 'Zero household child or pet exposure risk—no pills or films stored at home, and cannot be lost, stolen, or forgotten.',
    costCoverage: 'Covered by most state Medicaid programs, Medicare Part B/D, VA, and commercial specialty pharmacies; manufacturer copay assistance often reduces commercial out-of-pocket cost to $0–$5.',
    bestFitFor: 'People who want steady 24/7 receptor protection without daily pill burden, people living with young children or in shared housing, or people facing frequent travel or unstable housing.',
    samhsaCode: 'BU',
  },
  {
    id: 'methadone_otp',
    name: 'Daily Liquid/Tablet Methadone via OTP (with 2024 Expanded Take-Homes)',
    brandExamples: 'Methadose oral concentrate, Dolophine tablets, dispersible diskettes',
    disorder: 'oud',
    frequency: 'daily',
    route: 'Oral liquid or dissolved tablet swallowed once daily (or split-dosed in pregnancy / rapid metabolizers)',
    setting: 'otp_only',
    childSafetyNote: 'Critical pediatric poison hazard: liquid methadone looks like juice or cough syrup and is lethal to children in tiny sips. Keep take-home bottles in a locked box out of sight and never transfer into drinking cups.',
    costCoverage: 'Bundled coverage (medication + clinical visits) is mandated under Medicare Part B, covered by Medicaid in all states, and supported by state block-grant slots at public OTPs.',
    bestFitFor: 'People with high tolerance from potent street fentanyl who need full-agonist stabilization without any risk of precipitated withdrawal upon starting. Under the 2024 SAMHSA 42 CFR Part 8 Final Rule, stable patients can earn up to 7 take-home doses in the first 14 days, 14 by day 15, and 28 by day 31.',
    samhsaCode: 'OTP',
  },
  {
    id: 'naltrexone_im',
    name: 'Monthly Extended-Release Naltrexone Injection',
    brandExamples: 'Vivitrol (380 mg microsphere intramuscular suspension)',
    disorder: 'oud',
    disorders: ['oud', 'aud'],
    frequency: 'weekly_monthly',
    route: 'Once-monthly (every 4 weeks) deep intramuscular gluteal injection by a clinician',
    setting: 'clinic_office',
    childSafetyNote: 'Zero household storage risk because it is administered in the clinic once every 28 days.',
    costCoverage: 'Covered by Medicaid, Medicare, and commercial insurers for both Opioid Use Disorder and Alcohol Use Disorder; manufacturer copay savings programs are available for commercially insured patients.',
    bestFitFor: 'For OUD: people who have already completed a full 7–14+ day opioid-free washout and prefer a non-opioid monthly receptor blockade. For AUD: people who want a once-monthly shot to curb heavy drinking and alcohol cravings without taking daily pills (no opioid-free wait needed if not taking opioids).',
    samhsaCode: 'NU',
  },
  {
    id: 'naltrexone_po',
    name: 'Daily or Targeted Oral Naltrexone Tablet',
    brandExamples: 'ReVia, generic naltrexone HCl (50 mg scored oral tablet)',
    disorder: 'aud',
    frequency: 'daily',
    route: 'Oral tablet taken once daily (50 mg) or 1 hour before anticipated drinking (targeted / Sinclair dosing)',
    setting: 'home_telehealth',
    childSafetyNote: 'Non-controlled and non-sedating, though all prescriptions should be stored in child-resistant containers out of reach.',
    costCoverage: 'Inexpensive generic oral tablet (typically $10–$30/month cash price with pharmacy discount cards, or $0–$10 copay on Medicaid/insurance).',
    bestFitFor: 'First-line choice for reducing alcohol cravings and heavy drinking days—can be started immediately via primary care or telehealth even while still drinking (as long as no opioids are in your system).',
    samhsaCode: 'PMAT',
  },
  {
    id: 'acamprosate_po',
    name: 'Three-Times-Daily Oral Acamprosate Delayed-Release Tablet',
    brandExamples: 'Campral, generic acamprosate calcium (333 mg enteric-coated tablets)',
    disorder: 'aud',
    frequency: 'daily',
    route: 'Oral delayed-release tablets (typically two 333 mg tablets taken three times daily with meals)',
    setting: 'home_telehealth',
    childSafetyNote: 'Non-sedating, non-addictive, and safe around household members when stored in standard child-resistant bottles.',
    costCoverage: 'Generic available on most Medicaid and commercial formularies; primary care and telehealth prescribers can send directly to any retail or mail-order pharmacy.',
    bestFitFor: 'Supporting alcohol abstinence after withdrawal—especially ideal for people with alcohol-associated liver disease/cirrhosis (100% kidney-cleared, zero liver metabolism) or people who also take buprenorphine, methadone, or opioid pain medications.',
    samhsaCode: 'PMAT',
  },
];

export function matchFormulationPreferences({ disorder = 'all', frequency = 'all', setting = 'all' } = {}) {
  const d = String(disorder || 'all').trim().toLowerCase();
  const f = String(frequency || 'all').trim().toLowerCase();
  const s = String(setting || 'all').trim().toLowerCase();

  return FORMULATION_MATRIX.filter((item) => {
    if (d !== 'all') {
      const matchesDisorder = item.disorder === d || (Array.isArray(item.disorders) && item.disorders.includes(d));
      if (!matchesDisorder) return false;
    }
    if (f !== 'all' && item.frequency !== f) return false;
    if (s !== 'all' && item.setting !== s) return false;
    return true;
  });
}

/**
 * Educational transition prompts. These are not individual clearance intervals.
 */
export const WASHOUT_GUIDELINES = {
  naltrexone: {
    targetName: 'Naltrexone (Oral ReVia / Injectable Vivitrol)',
    sources: {
      short_acting_opioid: {
        fromName: 'Short-acting full opioid (heroin, oxycodone, morphine, hydrocodone)',
        minHours: null,
        recommendedDays: 'Individual clinician assessment; no calculator clearance',
        opioidFreeRequired: true,
        cowsThreshold: null,
        guidance: 'The FDA labeling describes a typical opioid-free interval before naltrexone, but timing depends on the opioid, formulation, and person. A clinician must assess readiness; a negative urine test or challenge does not guarantee that starting is safe.',
      },
      fentanyl: {
        fromName: 'Fentanyl (illicit street fentanyl / analogues)',
        minHours: null,
        recommendedDays: 'Individual clinician assessment; no fixed fentanyl interval',
        opioidFreeRequired: true,
        cowsThreshold: null,
        guidance: 'There is no fixed fentanyl-specific interval in this guide that can establish readiness. A clinician must assess recent exposure and the product labeling; do not rely on elapsed time or a test alone.',
      },
      methadone: {
        fromName: 'Methadone',
        minHours: null,
        recommendedDays: 'Individual clinician assessment; may require longer',
        opioidFreeRequired: true,
        cowsThreshold: null,
        guidance: 'Transition from methadone may require a longer opioid-free interval than short-acting opioids. A clinician must assess timing and readiness; do not stop or change treatment to follow a calculator.',
      },
      buprenorphine: {
        fromName: 'Buprenorphine (Suboxone, Subutex, Sublocade)',
        minHours: null,
        recommendedDays: 'Individual clinician assessment; may require longer',
        opioidFreeRequired: true,
        cowsThreshold: null,
        guidance: 'Transition from buprenorphine may require a longer opioid-free interval. A clinician must assess the formulation, timing, and readiness; do not stop or change treatment to follow a calculator.',
      },
    },
  },
  buprenorphine_traditional: {
    targetName: 'Buprenorphine Standard Induction',
    sources: {
      short_acting_opioid: {
        fromName: 'Short-acting full opioid (heroin, oxycodone, morphine)',
        minHours: null,
        recommendedDays: 'Individual clinician assessment; no fixed start time',
        recommendedDaysEs: 'Evaluación profesional individual; no hay una hora fija para iniciar',
        opioidFreeRequired: false,
        requiresWithdrawal: true,
        cowsThreshold: null,
        guidance: 'The timing of a standard start varies. A clinician should assess withdrawal and other factors; do not use elapsed time or this self-check to choose a dose or start time.',
        guidanceEs: 'El momento para un inicio estándar varía. Un profesional debe evaluar la abstinencia y otros factores; no use el tiempo transcurrido ni esta autoevaluación para elegir una dosis o el momento de inicio.',
      },
      methadone: {
        fromName: 'Methadone',
        minHours: null,
        recommendedDays: 'Individual clinician assessment; no fixed start time',
        recommendedDaysEs: 'Evaluación profesional individual; no hay una hora fija para iniciar',
        opioidFreeRequired: false,
        requiresWithdrawal: true,
        cowsThreshold: null,
        guidance: 'Transition from methadone requires an individualized plan because starting buprenorphine too soon can cause precipitated withdrawal. Do not taper or stop methadone or use a score to choose timing without a clinician.',
        guidanceEs: 'La transición desde metadona requiere un plan individualizado porque iniciar buprenorfina demasiado pronto puede causar abstinencia precipitada. No reduzca ni suspenda la metadona ni use una puntuación para elegir el momento sin consultar a un profesional.',
      },
      fentanyl: {
        fromName: 'Fentanyl (illicit street fentanyl)',
        minHours: null,
        recommendedDays: 'Individual clinician assessment; no fixed fentanyl interval',
        recommendedDaysEs: 'Evaluación profesional individual; no hay un intervalo fijo para fentanilo',
        opioidFreeRequired: false,
        requiresWithdrawal: true,
        cowsThreshold: null,
        alternativeStrategy: 'discuss_with_clinician',
        guidance: 'Fentanyl exposure can make timing difficult to predict. Standard and low-dose approaches may be discussed with a clinician, but this guide cannot select a method or schedule and no approach guarantees avoidance of precipitated withdrawal.',
        guidanceEs: 'La exposición al fentanilo puede dificultar predecir el momento. Un profesional puede hablar sobre métodos estándar o de dosis bajas, pero esta guía no puede elegir un método ni un horario y ningún método garantiza evitar la abstinencia precipitada.',
      },
    },
  },
  alcohol_after_disulfiram: {
    targetName: 'Alcohol Consumption After Disulfiram',
    sources: {
      disulfiram: {
        fromName: 'Disulfiram (Antabuse)',
        minHours: 336,
        recommendedDays: '14 days',
        opioidFreeRequired: false,
        requiresWithdrawal: false,
        guidance: 'Disulfiram irreversibly inhibits aldehyde dehydrogenase. Wait at least 14 days after the last dose before consuming any alcohol to avoid acute acetaldehyde toxicity.',
      },
      metronidazole: {
        fromName: 'Metronidazole / Tinidazole',
        minHours: 72,
        recommendedDays: '3 days',
        opioidFreeRequired: false,
        requiresWithdrawal: false,
        guidance: 'Wait at least 72 hours (3 days) after completing metronidazole before consuming alcohol.',
      },
    },
  },
  opioid_after_naltrexone: {
    targetName: 'Full-Agonist Opioids After Naltrexone (Elective Surgery)',
    sources: {
      oral_naltrexone: {
        fromName: 'Oral Naltrexone (ReVia)',
        minHours: 72,
        recommendedDays: '72 hours (3 days)',
        opioidFreeRequired: false,
        guidance: 'Oral naltrexone receptor blockade clears over 48–72 hours. Elective surgery requiring opioid analgesia should be scheduled at least 72 hours after the last oral dose.',
      },
      injectable_naltrexone: {
        fromName: 'Injectable XR-Naltrexone (Vivitrol)',
        minHours: 672,
        recommendedDays: '28–30 days',
        opioidFreeRequired: false,
        guidance: 'XR-naltrexone suppresses opioid response for 28–30 days. Coordinate with the surgical and anesthesiology team for multimodal non-opioid pain plans.',
      },
    },
  },
};

/** Looks up transition guidance. A null minimum means the tool cannot determine timing. */
export function calculateWashout(arg1, arg2) {
  let fromRaw, toRaw;
  if (typeof arg1 === 'object' && arg1 !== null) {
    fromRaw = arg1.currentSubstance ?? arg1.from ?? '';
    toRaw = arg1.targetMedication ?? arg1.to ?? '';
  } else {
    fromRaw = arg1 ?? '';
    toRaw = arg2 ?? '';
  }

  const norm = (s) => String(s || '').trim().toLowerCase().replace(/[- /_]+/g, '_');
  const from = norm(fromRaw);
  const to = norm(toRaw);

  // Normalize targets
  let targetGroup = null;
  if (to.includes('naltrexone') || to.includes('vivitrol')) {
    targetGroup = 'naltrexone';
  } else if (to.includes('bup') || to.includes('suboxone')) {
    targetGroup = 'buprenorphine_traditional';
  } else if (to.includes('alcohol') && (from.includes('disulfiram') || from.includes('metro'))) {
    targetGroup = 'alcohol_after_disulfiram';
  } else if (to.includes('opioid') || to.includes('fentanyl') || to.includes('morphine') || to.includes('surgery')) {
    targetGroup = 'opioid_after_naltrexone';
  }

  // Normalize sources
  let sourceKey = null;
  if (from.includes('fentanyl')) sourceKey = 'fentanyl';
  else if (from.includes('methadone')) sourceKey = 'methadone';
  else if (from.includes('bup') || from.includes('suboxone')) sourceKey = 'buprenorphine';
  else if (from.includes('disulfiram') || from.includes('antabuse')) sourceKey = 'disulfiram';
  else if (from.includes('metronidazole') || from.includes('metro')) sourceKey = 'metronidazole';
  else if (from.includes('oral') && from.includes('naltrexone')) sourceKey = 'oral_naltrexone';
  else if (from.includes('inject') || from.includes('vivitrol')) sourceKey = 'injectable_naltrexone';
  else if (from.includes('naltrexone')) sourceKey = 'oral_naltrexone';
  else if (from.includes('heroin') || from.includes('oxy') || from.includes('hydro') || from.includes('morphine') || from.includes('opioid')) {
    sourceKey = 'short_acting_opioid';
  }

  const guideline = targetGroup && sourceKey ? WASHOUT_GUIDELINES[targetGroup]?.sources?.[sourceKey] : null;

  if (guideline) {
    return {
      requiresWashout: true,
      target: WASHOUT_GUIDELINES[targetGroup].targetName,
      source: guideline.fromName,
      minimumHours: guideline.minHours,
      recommendedDays: getLang() === 'es'
        ? guideline.recommendedDaysEs ?? guideline.recommendedDays
        : guideline.recommendedDays,
      opioidFreeRequired: Boolean(guideline.opioidFreeRequired),
      requiresWithdrawal: Boolean(guideline.requiresWithdrawal),
      cowsThreshold: guideline.cowsThreshold ?? null,
      alternativeStrategy: guideline.alternativeStrategy ?? null,
      clinicalGuidance: getLang() === 'es'
        ? guideline.guidanceEs ?? guideline.guidance
        : guideline.guidance,
      clinicalGuidanceEs: guideline.guidanceEs ?? guideline.guidance,
      recommendedDaysEs: guideline.recommendedDaysEs ?? guideline.recommendedDays,
    };
  }

  // Default: no known mandatory washout conflict
  return {
    requiresWashout: false,
    target: toRaw || 'Unspecified Target',
    source: fromRaw || 'Unspecified Current Substance',
    minimumHours: 0,
    recommendedDays: '0 days',
    opioidFreeRequired: false,
    requiresWithdrawal: false,
    cowsThreshold: null,
    alternativeStrategy: null,
    clinicalGuidance: 'No mandatory multi-day receptor washout interval identified for this combination. Confirm with your clinical pharmacist or prescriber.',
  };
}

/**
 * Evaluates sedative load and calculates cumulative respiratory depression risk score
 * across single or polypharmacy depressant regimens.
 */
export function scoreRespiratoryRisk(selectedIds = []) {
  const ids = [...new Set(Array.from(selectedIds || []).map((id) => String(id).trim()))];
  const weights = {
    opioids_fentanyl: { weight: 3.5, label: 'Full-Agonist Opioids (fentanyl, heroin, oxycodone)' },
    methadone: { weight: 3.5, label: 'Methadone (full agonist)' },
    buprenorphine: { weight: 1.5, label: 'Buprenorphine (partial agonist ceiling alone)' },
    benzos_sedatives: { weight: 2.5, label: 'Benzodiazepines / Sedative-Hypnotics (GABA-A)' },
    alcohol: { weight: 2.5, label: 'Alcohol' },
    xylazine_medetomidine: { weight: 2.5, label: 'Xylazine / Medetomidine (central alpha-2 agonist)' },
    gabapentinoids: { weight: 1.5, label: 'Gabapentinoids (gabapentin, pregabalin)' },
  };

  const matchedDepressants = [];
  let rawScore = 0;
  for (const id of ids) {
    if (weights[id]) {
      matchedDepressants.push({ id, ...weights[id] });
      rawScore += weights[id].weight;
    }
  }

  const depressantCount = matchedDepressants.length;
  // Non-linear synergy multipliers: multiple depressants compound fatal breathing arrest risk
  let multiplier = 1.0;
  if (depressantCount >= 3) {
    multiplier = 2.0; // Critical multi-depressant synergy
  } else if (depressantCount === 2) {
    multiplier = 1.5; // High synergy
  }

  const finalScore = Number((rawScore * multiplier).toFixed(1));

  let riskLevel = 'none';
  if (depressantCount === 0) {
    riskLevel = 'none';
  } else if (finalScore < 3.0) {
    riskLevel = 'low';
  } else if (finalScore < 5.5) {
    riskLevel = 'moderate';
  } else if (finalScore < 8.0) {
    riskLevel = 'high';
  } else {
    riskLevel = 'critical';
  }

  const riskFactors = [];
  const hasFullOpioid = ids.includes('opioids_fentanyl') || ids.includes('methadone');
  const hasAnyOpioid = hasFullOpioid || ids.includes('buprenorphine');
  const hasGaba = ids.includes('benzos_sedatives') || ids.includes('alcohol');
  const hasXylazine = ids.includes('xylazine_medetomidine');

  if (hasFullOpioid && hasGaba) {
    riskFactors.push('Synergistic brainstem respiratory depression (mu-opioid + GABA-A potentiated sedation).');
  }
  if (hasXylazine && hasAnyOpioid) {
    riskFactors.push('Xylazine central alpha-2 depression blunts blood pressure and heart rate; naloxone alone does not reverse non-opioid xylazine sedation.');
  }
  if (ids.includes('gabapentinoids') && hasAnyOpioid) {
    riskFactors.push('Gabapentinoid reversal of opioid tolerance and compounding medullary breathing suppression.');
  }
  if (depressantCount >= 3) {
    riskFactors.push('Triple+ depressant synergy: compounding risk of fatal respiratory arrest.');
  }

  const harmReductionActions = [];
  if (hasAnyOpioid || depressantCount >= 1) {
    harmReductionActions.push('Keep multiple 4 mg naloxone (Narcan) nasal sprays immediately accessible.');
    harmReductionActions.push('Call Never Use Alone at 1-800-484-3731 or ensure someone is with you when using.');
  }
  if (hasGaba || hasXylazine) {
    harmReductionActions.push('Perform rescue breathing (1 breath every 5 seconds) if breathing is shallow or stopped—essential for non-opioid sedatives.');
  }
  if (riskLevel === 'critical' || riskLevel === 'high') {
    harmReductionActions.push('In an emergency if someone is unresponsive or blue/gray, call 911 immediately and administer naloxone.');
  }

  return {
    score: finalScore,
    riskLevel,
    depressantCount,
    depressants: matchedDepressants.map((d) => d.id),
    riskFactors,
    harmReductionActions,
  };
}


export function filterMedications({ category = 'all', query = '' } = {}) {
  const cat = String(category || 'all').trim().toLowerCase();
  const q = String(query || '').trim().toLowerCase();
  return MEDICATIONS.filter((med) => {
    if (cat !== 'all' && med.category !== cat) return false;
    if (!q) return true;
    const haystack = [
      med.name,
      ...(med.searchTerms || []),
      ...(med.brands || []),
      med.forms,
      med.summary,
      med.mechanism,
      med.howToStart,
      med.access,
      ...(med.clinicalPearls || []),
      ...(med.samhsaCodes || []),
    ].join(' ').toLowerCase();
    return haystack.includes(q);
  });
}

export function filterInteractions({ substance = 'all', query = '' } = {}) {
  const sub = String(substance || 'all').trim().toLowerCase();
  const q = String(query || '').trim().toLowerCase();
  return INTERACTIONS.filter((item) => {
    if (sub !== 'all' && !item.substances.includes(sub)) return false;
    if (!q) return true;
    const haystack = [
      item.id,
      item.title,
      item.summary,
      item.mechanism,
      item.action,
      ...(item.substances || []),
      item.source?.[0] || '',
    ].join(' ').toLowerCase();
    return haystack.includes(q);
  });
}

function severityBadge(severity) {
  if (severity === 'critical') {
    return h('span', { class: 'chip chip-extra' }, icon('alert'), ' ', t('meds.severity.critical', 'Critical polypharmacy risk'));
  }
  if (severity === 'high') {
    return h('span', { class: 'chip chip-extra' }, icon('alert'), ' ', t('meds.severity.high', 'High-risk interaction'));
  }
  if (severity === 'moderate') {
    return h('span', { class: 'chip chip-care' }, icon('info'), ' ', t('meds.severity.moderate', 'Monitor / dose check'));
  }
  return h('span', { class: 'chip chip-med' }, icon('info'), ' ', t('meds.severity.info', 'Clinical note'));
}

function specialPopulationCard(pop) {
  return h('article', { class: 'card facility', id: `pop-${pop.id}`, 'aria-labelledby': `pop-title-${pop.id}` },
    h('div', { class: 'facility-head' },
      h('h3', { class: 'facility-name', id: `pop-title-${pop.id}` }, pop.title),
      h('ul', { class: 'chips', 'aria-label': 'Related SAMHSA codes' },
        pop.samhsaCodes.map((c) => h('li', { class: 'chip chip-care' }, `SAMHSA: ${c}`))),
    ),
    p(pop.summary),
    ul(pop.keyPoints),
    h('div', { class: 'actions' },
      h('a', {
        class: 'btn btn-secondary btn-small',
        href: `#/treatment?codes=${pop.samhsaCodes[0]}`,
      }, icon('pin'), `Search ${pop.samhsaCodes[0]} programs`),
    ),
  );
}

function medicationCard(med) {
  const content = med.translations?.[getLang()] ?? med;
  return h('article', { class: 'card facility', id: `med-${med.id}`, 'aria-labelledby': `med-title-${med.id}` },
    h('div', { class: 'facility-head' },
      h('div', null,
        h('h3', { class: 'facility-name', id: `med-title-${med.id}` }, med.name),
        h('p', { class: 'subname' }, med.brands.join(' · ')),
      ),
      h('ul', { class: 'chips', 'aria-label': 'SAMHSA search codes' },
        med.samhsaCodes.map((code) => h('li', { class: 'chip chip-med' }, `SAMHSA: ${code}`))),
    ),
    p(content.summary ?? med.summary),
    h('dl', { class: 'service-list' },
      h('dt', null, t('meds.field.forms', 'Forms & dosing')),
      h('dd', null, content.forms ?? med.forms),
      h('dt', null, t('meds.field.mechanism', 'How it works')),
      h('dd', null, content.mechanism ?? med.mechanism),
      h('dt', null, t('meds.field.start', 'Starting safely')),
      h('dd', null, content.howToStart ?? med.howToStart),
      h('dt', null, t('meds.field.access', 'Where to get it')),
      h('dd', null, content.access ?? med.access),
    ),
    h('div', { class: 'callout callout-info' },
      h('p', { class: 'callout-title' }, icon('shield'), t('meds.field.pearls', 'Clinical pharmacist pearls')),
      ul(content.clinicalPearls ?? med.clinicalPearls),
    ),
    h('div', { class: 'actions' },
      h('a', { class: 'btn btn-primary btn-small', href: med.finderHref },
        icon('pin'), med.finderLabel),
      ...(med.sources || []).map(([label, url]) =>
        h('a', { class: 'btn btn-ghost btn-small', href: url, target: '_blank', rel: 'noopener noreferrer' },
          icon('globe'), label, h('span', { class: 'visually-hidden' }, ' (opens in a new tab)'))),
    ),
  );
}

function interactionCard(item) {
  item = localizeInteraction(item, getLang());
  return h('article', { class: 'card', id: `ix-${item.id}`, 'aria-labelledby': `ix-title-${item.id}` },
    h('div', { class: 'facility-head' },
      h('h3', { class: 'facility-name', id: `ix-title-${item.id}` }, item.title),
      severityBadge(item.severity),
    ),
    p(strong(tr('What happens: ', 'Qué sucede: ')), item.summary),
    h('dl', { class: 'service-list' },
      h('dt', null, t('meds.ix.mechanism', 'Pharmacology')),
      h('dd', null, item.mechanism),
      h('dt', null, t('meds.ix.action', 'How to stay safer')),
      h('dd', null, item.action),
    ),
    item.source && fine(tr('Source: ', 'Fuente: '), ext(item.source[1], tr(item.source[0], 'Referencia clínica'))),
  );
}

function currentPharmacologyReference() {
  const cards = [
    [tr('Alcohol medication comparison', 'Comparación de medicamentos para el alcohol'),
      tr('Acamprosate supports abstinence after withdrawal and can be used with MOUD when kidney function permits. Oral or XR naltrexone reduces heavy drinking or supports abstinence, but cannot be combined with opioid agonists. Disulfiram deters drinking through an alcohol reaction; it does not treat cravings or withdrawal and needs informed consent and liver review. Gabapentin and topiramate are off-label alternatives: discuss sedation/renal function with gabapentin and cognitive effects, kidney stones, and pregnancy risks with topiramate. None replaces emergency alcohol-withdrawal care.', 'El acamprosato ayuda a mantener la abstinencia tras la retirada y puede usarse con tratamiento opioide si los riñones lo permiten. La naltrexona oral o inyectable puede reducir el consumo o apoyar la abstinencia, pero no se combina con agonistas opioides. El disulfiram provoca una reacción al beber; no trata el deseo ni la abstinencia y requiere consentimiento y evaluación hepática. Gabapentina y topiramato son alternativas fuera de indicación: revise sedación y riñones con gabapentina, y efectos cognitivos, cálculos y riesgos del embarazo con topiramato. Ninguno sustituye la atención de urgencia por abstinencia de alcohol.'),
      'https://www.niaaa.nih.gov/health-professionals-communities/core-resource-on-alcohol/recommend-evidence-based-treatment-know-options'],
    [tr('Stimulant care: evidence and limits', 'Atención por estimulantes: evidencia y límites'),
      tr('Contingency management (CMI), with CBT or community reinforcement, is the standard of care. Naltrexone + bupropion and mirtazapine may be considered off-label for selected patients; benefits are not guaranteed. Naltrexone is incompatible with methadone, buprenorphine, or other opioids; bupropion needs seizure-risk review. Mirtazapine evidence is limited. Chest pain, seizure, severe overheating, or breathing problems require 911.', 'El manejo de contingencias (CMI), con terapia cognitivo-conductual o refuerzo comunitario, es la referencia de tratamiento. Naltrexona + bupropión y mirtazapina pueden considerarse fuera de indicación en algunas personas; no garantizan beneficios. Naltrexona no se combina con metadona, buprenorfina ni otros opioides; bupropión requiere evaluar convulsiones. La evidencia para mirtazapina es limitada. Dolor de pecho, convulsiones, sobrecalentamiento intenso o problemas respiratorios requieren llamar al 911.'),
      'https://www.asam.org/quality-care/clinical-guidelines/stimulant-use-disorders'],
    [tr('MOUD and benzodiazepines', 'Tratamiento opioide y benzodiacepinas'),
      tr('FDA guidance says buprenorphine or methadone should not be withheld solely because someone takes benzodiazepines or other CNS depressants. The combination still increases overdose risk. Coordinate prescribers, check sedation, carry naloxone, and plan any sedative taper with a clinician; abrupt benzodiazepine withdrawal can cause seizures.', 'La FDA indica que no debe negarse buprenorfina o metadona solo por tomar benzodiacepinas u otros depresores. La combinación sí aumenta el riesgo de sobredosis. Coordine profesionales, vigile la sedación, tenga naloxona y acuerde cualquier reducción de sedantes; suspender benzodiacepinas de golpe puede causar convulsiones.'),
      'https://www.fda.gov/drugs/drug-safety-and-availability/fda-requiring-boxed-warning-updated-improve-safe-use-benzodiazepine-drug-class'],
    [tr('4 mg versus 8 mg nasal naloxone', 'Naloxona nasal de 4 mg frente a 8 mg'),
      tr('A CDC observational study found similar survival and more withdrawal with 8 mg than 4 mg. Give whichever approved product is available promptly; do not delay rescue to find a preferred strength. Nalmefene lasts longer and can cause prolonged withdrawal, but recurrent overdose remains possible. Call 911, support breathing or CPR as directed, and repeat rescue medication according to its device instructions.', 'Un estudio observacional de CDC encontró supervivencia similar y más abstinencia con 8 mg que con 4 mg. Use de inmediato el producto aprobado disponible; no demore el rescate para buscar otra concentración. El nalmefeno dura más y puede prolongar la abstinencia, pero la sobredosis puede reaparecer. Llame al 911, apoye la respiración o RCP según las instrucciones y repita el medicamento según el dispositivo.'),
      'https://www.cdc.gov/mmwr/volumes/73/wr/mm7305a4.htm'],
  ];
  return section('pharmacology-reference', tr('Medication decisions to discuss with your clinician', 'Decisiones sobre medicamentos para conversar con su profesional'),
    ...cards.map(([title, body, source]) => h('article', { class: 'card' }, h('h3', null, title), p(body), fine(ext(source, tr('Primary clinical reference', 'Referencia clínica primaria'))))),
  );
}

export function medicationsView({ query } = {}) {
  const initialCategory = MEDICATION_CATEGORIES.some((c) => c.id === query?.get?.('category'))
    ? query.get('category')
    : 'all';
  const initialSubstance = INTERACTION_SUBSTANCES.some((s) => s.id === query?.get?.('substance'))
    ? query.get('substance')
    : 'all';

  let activeCategory = initialCategory;
  let activeSubstance = initialSubstance;
  let interactionSearch = '';
  medicationsState.activeCategory = activeCategory;
  medicationsState.activeSubstance = activeSubstance;
  medicationsState.medicationSearch = '';
  medicationsState.interactionSearch = '';
  medicationsState.selectedRegimen.clear();

  const plainSummarySlot = h('div', { id: 'meds-plain-summary-slot' });
  const plainToggleBtn = h('button', {
    type: 'button',
    id: 'meds-plain-language-toggle',
    class: 'preset',
    'aria-pressed': String(Boolean(medicationsState.plainLanguage)),
    onclick: () => {
      medicationsState.plainLanguage = !medicationsState.plainLanguage;
      plainToggleBtn.setAttribute('aria-pressed', String(medicationsState.plainLanguage));
      if (medicationsState.plainLanguage) plainToggleBtn.setAttribute('aria-current', 'true');
      else plainToggleBtn.removeAttribute('aria-current');
      renderPlainSummary();
      announce(medicationsState.plainLanguage
        ? t('meds.plain.active', 'Resumen en lenguaje sencillo activado')
        : t('meds.plain.inactive', 'Detalle clínico estándar activado'));
    },
  }, icon('info'), ' ', t('meds.plain.toggle', 'Plain-language summary (6th-grade reading level)'));

  function renderPlainSummary() {
    clear(plainSummarySlot);
    if (!medicationsState.plainLanguage) return;
    plainSummarySlot.append(
      h('div', {
        class: 'callout callout-info plain-language-box',
        role: 'region',
        'aria-label': tr('Plain-language medication summary', 'Resumen de medicamentos en lenguaje sencillo'),
      },
        h('p', { class: 'callout-title' },
          icon('pill'),
          tr('In plain words: How addiction medications & polypharmacy risks work', 'En palabras sencillas: Cómo funcionan los medicamentos de adicción y los riesgos de polifarmacia')),
        ul([
          [
            strong(tr('Buprenorphine (Suboxone, Sublocade, Brixadi): ', 'Buprenorfina (Suboxone, Sublocade, Brixadi): ')),
            tr('Can reduce opioid withdrawal and cravings. Treatment is associated with lower overdose risk, but it does not eliminate that risk. A clinician helps choose the start method and timing.', 'Puede reducir la abstinencia y los antojos de opioides. El tratamiento se asocia con menor riesgo de sobredosis, pero no lo elimina. Un profesional ayuda a elegir el método y el momento para iniciar.'),
          ],
          [
            strong(tr('Starting buprenorphine after fentanyl: ', 'Iniciar buprenorfina después del fentanilo: ')),
            tr('Withdrawal timing varies. A self-check or fixed waiting period cannot tell you when it is safe to start. Ask a clinician about available approaches; no approach guarantees that precipitated withdrawal will not occur.', 'El momento de la abstinencia varía. Una autoevaluación o un tiempo de espera fijo no indican cuándo es seguro iniciar. Consulte a un profesional sobre las opciones; ningún método garantiza que no ocurra abstinencia precipitada.'),
          ],
          [
            strong(tr('Methadone (at OTP clinics): ', 'Metadona (en clínicas OTP): ')),
            tr('Methadone is an effective treatment option for opioid use disorder. A qualified clinician must determine whether and how to start it and monitor for sedation and interactions. Ask an OTP about its current take-home policies.', 'La metadona es una opción eficaz para tratar el trastorno por consumo de opioides. Un profesional calificado debe decidir si iniciar el tratamiento y cómo hacerlo, y vigilar la sedación y las interacciones. Consulte al OTP sobre sus políticas actuales para llevar medicamentos.'),
          ],
          [
            strong(tr('Naltrexone (Vivitrol): ', 'Naltrexona (Vivitrol): ')),
            tr('Starting too soon after opioids can cause severe precipitated withdrawal. The opioid-free interval depends on the medication and situation; a clinician must assess readiness. Do not rely on a fixed fentanyl wait or a test alone.', 'Iniciarla demasiado pronto después de usar opioides puede causar abstinencia precipitada grave. El período sin opioides depende del medicamento y de la situación; un profesional debe evaluar si está listo. No dependa de un tiempo fijo tras el fentanilo ni de una sola prueba.'),
          ],
          [
            strong(tr('Xylazine and overdose response: ', 'Xilacina y respuesta a una sobredosis: ')),
            tr('Xylazine is a non-opioid sedative found in parts of the unregulated drug supply. Naloxone does not reverse xylazine, but give it for a suspected opioid-involved overdose. Call 911, support breathing, and stay with the person; they may remain sedated or have breathing problems.', 'La xilacina es un sedante no opioide que se encuentra en partes del suministro de drogas no regulado. La naloxona no revierte la xilacina, pero adminístrela ante una posible sobredosis con opioides. Llame al 911, apoye la respiración y quédese con la persona; puede seguir sedada o tener problemas respiratorios.'),
          ],
          [
            strong(tr('Alcohol medications (Naltrexone & Acamprosate): ', 'Medicamentos para el alcohol (Naltrexona y Acamprosato): ')),
            tr('These medications may help some people with alcohol use disorder, but they have different risks and eligibility requirements. A clinician should review opioid use, liver and kidney health, and alcohol-withdrawal risk before treatment.', 'Estos medicamentos pueden ayudar a algunas personas con trastorno por consumo de alcohol, pero tienen distintos riesgos y requisitos. Un profesional debe revisar el uso de opioides, la salud del hígado y los riñones, y el riesgo de abstinencia de alcohol antes del tratamiento.'),
          ],
          [
            strong(tr('Emergency and print note: ', 'Emergencias e impresión: ')),
            tr('For a suspected overdose, call 911 and follow dispatcher instructions. Any printed or copied information is outside Quick Exit’s control.', 'Ante una posible sobredosis, llame al 911 y siga las instrucciones de la persona operadora. La información impresa o copiada queda fuera del control de Salida rápida.'),
          ],
        ]),
      ),
    );
  }

  renderPlainSummary();

  const medPanel = h('div', {
    class: 'results-list',
    id: 'med-category-panel',
    role: 'tabpanel',
  });
  const medStatus = h('p', { class: 'results-status', role: 'status', 'aria-live': 'polite' });
  const catButtons = [];

  function renderMedications(shouldAnnounce = false) {
    medicationsState.activeCategory = activeCategory;
    for (const btn of catButtons) {
      const selected = btn.dataset.category === activeCategory;
      btn.setAttribute('aria-selected', String(selected));
      btn.tabIndex = selected ? 0 : -1;
    }
    medPanel.setAttribute('aria-labelledby', `med-tab-${activeCategory}`);
    const list = filterMedications({ category: activeCategory });
    const catLabel = MEDICATION_CATEGORIES.find((c) => c.id === activeCategory)?.label ?? 'All medications';
    const msg = `Showing ${list.length} medication guide${list.length === 1 ? '' : 's'} in ${catLabel}.`;
    medStatus.textContent = msg;
    if (shouldAnnounce) announce(msg);
    clear(medPanel).append(...list.map(medicationCard));
  }

  const categoryTablist = h('div', {
    class: 'tabs',
    role: 'tablist',
    'aria-label': t('meds.tabs.label', 'Medication categories'),
  }, MEDICATION_CATEGORIES.map((cat) => {
    const btn = h('button', {
      type: 'button',
      role: 'tab',
      id: `med-tab-${cat.id}`,
      class: 'tab',
      'aria-controls': 'med-category-panel',
      dataset: { category: cat.id },
      onclick: () => {
        activeCategory = cat.id;
        renderMedications(true);
      },
      onkeydown: (e) => {
        if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)) return;
        e.preventDefault();
        const idx = MEDICATION_CATEGORIES.findIndex((c) => c.id === cat.id);
        let nextIdx = idx;
        if (e.key === 'ArrowRight') nextIdx = (idx + 1) % MEDICATION_CATEGORIES.length;
        else if (e.key === 'ArrowLeft') nextIdx = (idx + MEDICATION_CATEGORIES.length - 1) % MEDICATION_CATEGORIES.length;
        else if (e.key === 'Home') nextIdx = 0;
        else if (e.key === 'End') nextIdx = MEDICATION_CATEGORIES.length - 1;
        const nextCat = MEDICATION_CATEGORIES[nextIdx];
        activeCategory = nextCat.id;
        renderMedications(true);
        catButtons.find((b) => b.dataset.category === nextCat.id)?.focus();
      },
    }, cat.label);
    catButtons.push(btn);
    return btn;
  }));

  renderMedications(false);

  // ---------------------------------------------------------------- Naltrexone Washout Calculator
  let activeWashoutOpioid = medicationsState.washoutOpioid || 'fentanyl';
  const washoutPills = [];
  const washoutOutputSlot = h('div', {
    id: 'naltrexone-washout-output',
    role: 'region',
    'aria-live': 'polite',
    'aria-label': tr('Naltrexone transition information', 'Información sobre transición a naltrexona'),
  });

  function renderWashoutCalculator(shouldAnnounce = false) {
    medicationsState.washoutOpioid = activeWashoutOpioid;
    for (const pill of washoutPills) {
      const active = pill.dataset.opioidId === activeWashoutOpioid;
      pill.setAttribute('aria-pressed', String(active));
      if (active) pill.setAttribute('aria-current', 'true');
      else pill.removeAttribute('aria-current');
    }

    const selectedOpioid = ({
      fentanyl: tr('Fentanyl', 'Fentanilo'),
      methadone: tr('Methadone', 'Metadona'),
      buprenorphine: tr('Buprenorphine', 'Buprenorfina'),
      short_acting: tr('Short-acting opioid', 'Opioide de acción corta'),
    })[activeWashoutOpioid] ?? tr('Selected opioid', 'Opioide seleccionado');
    clear(washoutOutputSlot);

    if (shouldAnnounce) {
      announce(tr(`General transition information for ${selectedOpioid}. No fixed interval can confirm readiness.`, `Información general de transición para ${selectedOpioid}. Ningún intervalo fijo confirma que esté listo.`));
    }

    washoutOutputSlot.append(
      h('div', { class: 'card facility' },
        h('div', { class: 'facility-head' },
          h('h4', { class: 'facility-name' }, tr('Naltrexone transition', 'Transición a naltrexona')),
          h('span', { class: 'chip chip-extra' }, icon('alert'), ' ', tr('Clinician assessment required', 'Se requiere evaluación profesional')),
        ),
        p(strong(tr('Selected opioid: ', 'Opioide seleccionado: ')), selectedOpioid),
        p(tr('The opioid-free interval depends on the opioid, formulation, and individual circumstances. No fixed interval in this tool can confirm that starting oral or extended-release naltrexone is safe. Transitions from methadone or buprenorphine may require longer planning.', 'El período sin opioides depende del opioide, la formulación y las circunstancias individuales. Ningún intervalo fijo de esta herramienta confirma que sea seguro iniciar naltrexona oral o de liberación prolongada. Las transiciones desde metadona o buprenorfina pueden requerir más planificación.')),
        h('div', { class: 'callout callout-info' },
          h('p', { class: 'callout-title' }, icon('shield'), tr('Before starting', 'Antes de iniciar')),
          p(tr('A clinician may consider a naloxone challenge test. A negative urine test or a tolerated challenge cannot confirm that it is safe to start. Ask a clinician to review the product labeling and your situation before changing prescribed treatment.', 'Un profesional puede considerar una prueba de desafío con naloxona. Un análisis de orina negativo o una prueba tolerada no confirman que sea seguro iniciar. Pida a un profesional que revise la etiqueta del producto y su situación antes de cambiar un tratamiento recetado.')),
        ),
        fine(ext('https://www.accessdata.fda.gov/drugsatfda_docs/label/2022/021897s057lbl.pdf', tr('FDA Vivitrol prescribing information', 'Información de prescripción de Vivitrol de la FDA'))),
      ),
      h('div', { class: 'table-wrap', tabindex: '0', role: 'region', 'aria-label': 'Non-opioid acute and perioperative pain alternative options' },
        h('table', null,
          h('caption', { class: 'visually-hidden' }, 'Non-opioid acute and perioperative pain alternative options'),
          h('thead', null,
            h('tr', null,
              h('th', { scope: 'col' }, 'Category'),
              h('th', { scope: 'col' }, 'Recommended Regimens'),
              h('th', { scope: 'col' }, 'Mechanism'),
              h('th', { scope: 'col' }, 'Safety Guidance'),
            ),
          ),
          h('tbody', null,
            NON_OPIOID_PAIN_ALTERNATIVES.map((row) => h('tr', null,
              h('th', { scope: 'row' }, row.category),
              h('td', null, row.agents),
              h('td', null, row.clinicalMechanism),
              h('td', null, row.safetyGuidance),
            )),
          ),
        ),
      ),
      h('div', { class: 'callout callout-emergency' },
        h('p', { class: 'callout-title' }, icon('alert'), t('meds.washout.overrideWarn', 'PELIGRO CRÍTICO: Nunca intente vencer el bloqueo de la naltrexona con dosis altas de opioides. Cuando los niveles de naltrexona disminuyan o los niveles de opioides alcancen su punto máximo, puede ocurrir un paro respiratorio mortal inmediato.')),
        p(t('meds.washout.walletCard', 'Lleve siempre una tarjeta de alerta médica o pulsera que indique que toma naltrexona/Vivitrol para que el personal de urgencias utilice analgesia regional o protocolos no opioides.')),
      ),
      h('p', { class: 'actions no-print' },
        h('button', {
          type: 'button',
          id: 'print-naltrexone-handout-btn',
          class: 'btn btn-secondary btn-small',
          onclick: () => window.print(),
        }, icon('printer'), t('meds.washout.print', 'Imprimir folleto de lavado de naltrexona y alternativas para el dolor')),
        fine(tr('Printed or copied information is outside Quick Exit’s control.', 'La información impresa o copiada queda fuera del control de Salida rápida.')),
      ),
    );
  }

  const washoutSelectorBar = h('div', {
    class: 'presets',
    role: 'group',
    'aria-label': t('meds.washout.selectOpioid', 'Select last opioid used for washout calculator'),
  }, NALTREXONE_WASHOUT_GUIDANCE.map((item) => {
    const btn = h('button', {
      type: 'button',
      class: 'preset',
      dataset: { opioidId: item.id },
      onclick: () => {
        activeWashoutOpioid = item.id;
        renderWashoutCalculator(true);
      },
    }, item.label.split(' (')[0]);
    washoutPills.push(btn);
    return btn;
  }));

  renderWashoutCalculator(false);

  // ---------------------------------------------------------------- Interaction explorer
  const ixListEl = h('div', { class: 'results-list', id: 'interactions-results' });
  const ixStatus = h('p', { class: 'results-status', role: 'status', 'aria-live': 'polite' });
  const subButtons = [];

  const ixSearchInput = h('input', {
    type: 'search',
    id: 'interaction-search',
    class: 'input',
    placeholder: t('meds.ix.searchPlaceholder', 'Search by drug, medication, or symptom (e.g., fentanyl, Xanax, QTc, tranq)…'),
    'aria-label': t('meds.ix.searchLabel', 'Search drug and medication interactions'),
    oninput: (e) => {
      interactionSearch = e.target.value ?? '';
      renderInteractions(true);
    },
  });

  function renderInteractions(shouldAnnounce = false) {
    medicationsState.activeSubstance = activeSubstance;
    medicationsState.interactionSearch = interactionSearch;
    for (const b of subButtons) {
      const on = b.dataset.substance === activeSubstance;
      if (on) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
      b.setAttribute('aria-pressed', String(on));
    }
    const matches = filterInteractions({ substance: activeSubstance, query: interactionSearch });
    const msg = `${matches.length} interaction${matches.length === 1 ? '' : 's'} shown.`;
    ixStatus.textContent = msg;
    if (shouldAnnounce) announce(msg);
    clear(ixListEl);
    if (!matches.length) {
      ixListEl.append(
        h('div', { class: 'empty' },
          icon('search'),
          p('No interactions matched that filter. Try clearing the search box or choosing “All substances”.'),
          h('div', { class: 'empty-actions' },
            h('button', {
              type: 'button',
              class: 'btn btn-secondary btn-small',
              onclick: () => {
                activeSubstance = 'all';
                interactionSearch = '';
                ixSearchInput.value = '';
                renderInteractions(true);
              },
            }, 'Show all interactions')),
        ),
      );
      return;
    }
    ixListEl.append(...matches.map(interactionCard));
  }

  const substanceFilterBar = h('div', {
    class: 'presets',
    role: 'group',
    'aria-label': t('meds.ix.filterGroup', 'Filter interactions by substance'),
  }, INTERACTION_SUBSTANCES.map((s) => {
    const b = h('button', {
      type: 'button',
      class: 'preset',
      dataset: { substance: s.id },
      onclick: () => {
        activeSubstance = s.id;
        renderInteractions(true);
      },
    }, s.label);
    subButtons.push(b);
    return b;
  }));

  renderInteractions(false);

  // ---------------------------------------------------------------- Multi-substance regimen safety checker
  const selectedRegimen = new Set();
  const regimenPills = [];
  const regimenOutput = h('div', {
    id: 'regimen-safety-output',
    role: 'region',
    'aria-live': 'polite',
    'aria-label': t('meds.regimen.outputLabel', 'Multi-substance combination evaluation'),
  });

  function renderRegimenChecker(shouldAnnounce = false) {
    medicationsState.selectedRegimen = new Set(selectedRegimen);
    for (const pill of regimenPills) {
      const checked = selectedRegimen.has(pill.dataset.agentId);
      pill.setAttribute('aria-pressed', String(checked));
      if (checked) pill.setAttribute('aria-current', 'true'); else pill.removeAttribute('aria-current');
    }

    clear(regimenOutput);
    const chosenIds = [...selectedRegimen];
    if (chosenIds.length < 2) {
      regimenOutput.append(
        fine(t('meds.regimen.prompt', 'Select 2 or more substances or medications above to check for multi-drug respiratory, receptor-displacement (precipitated withdrawal), or cardiac/metabolic risks. Checked only in your browser memory.')),
      );
      return;
    }

    const result = evaluateDrugInteractions(chosenIds, { lang: getLang() });
    const calloutTone = result.riskLevel === 'critical' || result.riskLevel === 'high'
      ? 'callout callout-emergency'
      : result.riskLevel === 'moderate'
        ? 'callout callout-warn'
        : 'callout callout-info';

    const summaryTitle = result.riskLevel === 'critical'
      ? tr('Critical Multi-Substance Risk Detected', 'Riesgo crítico por varias sustancias')
      : result.riskLevel === 'high'
        ? tr('High-Risk Combination Detected', 'Combinación de alto riesgo')
        : result.riskLevel === 'moderate'
          ? tr('Moderate Interaction — Clinical Monitoring Recommended', 'Interacción moderada: se recomienda vigilancia clínica')
          : tr('Combination Pharmacology Note', 'Nota sobre la combinación');

    if (shouldAnnounce) {
      announce(tr(`${summaryTitle}: ${result.alerts.length} clinical alerts and ${result.matchedInteractions.length} pairwise interactions.`, `${summaryTitle}: ${result.alerts.length} alertas clínicas y ${result.matchedInteractions.length} interacciones.`));
    }

    regimenOutput.append(
      h('div', { class: calloutTone },
        h('div', { class: 'facility-head' },
          h('p', { class: 'callout-title' },
            icon(result.riskLevel === 'info' ? 'info' : 'alert'),
            summaryTitle),
          severityBadge(result.riskLevel),
        ),
        result.depressantCount > 0 && p(
          strong(tr('Selected sedatives/depressants: ', 'Sedantes/depresores seleccionados: ')),
          String(result.depressantCount),
        ),
        fine(tr('Educational interaction flags, not a validated risk score or a safe-use clearance. Missing alerts do not establish safety. A pharmacist or prescriber must review your full regimen.', 'Alertas educativas, no una escala de riesgo validada ni una autorización de uso seguro. La ausencia de alertas no demuestra seguridad. Un profesional debe revisar todos sus medicamentos.')),
        result.alerts.length > 0 && ul(
          result.alerts.map((a) => [strong(`${a.title}: `), a.detail]),
        ),
        result.matchedInteractions.length > 0 && h('div', { class: 'results-list' },
          ...result.matchedInteractions.map(interactionCard),
        ),
        result.actionSteps.length > 0 && h('div', null,
          p(strong(tr('Clinical Pharmacist Harm-Reduction Steps:', 'Pasos para reducir daños:'))),
          ul(result.actionSteps),
        ),
        h('p', { class: 'actions' },
          h('button', {
            type: 'button',
            class: 'btn btn-ghost btn-small',
            onclick: () => {
              selectedRegimen.clear();
              renderRegimenChecker(true);
            },
          }, icon('x'), tr('Clear selection', 'Borrar selección')),
        ),
      ),
    );
  }

  const regimenCheckerPanel = h('div', { class: 'card', id: 'regimen-safety-checker' },
    h('h3', null, t('meds.regimen.title', 'Multi-Substance Regimen & Polypharmacy Safety Check')),
    p(tr('Select 2 or more medications or substances below to review sedation, precipitated withdrawal, and heart rhythm or metabolism warnings. This is not a dosing tool. All selections stay in browser memory.', 'Seleccione dos o más medicamentos o sustancias para revisar alertas de sedación, abstinencia precipitada, ritmo cardíaco o metabolismo. No calcula dosis. Todo queda en la memoria del navegador.')),
    h('div', {
      class: 'presets',
      role: 'group',
      'aria-label': t('meds.regimen.groupLabel', 'Select substances or medications in combination'),
    }, REGIMEN_AGENTS.map((agent) => {
      const btn = h('button', {
        type: 'button',
        class: 'preset',
        dataset: { agentId: agent.id },
        onclick: () => {
          if (selectedRegimen.has(agent.id)) selectedRegimen.delete(agent.id);
          else selectedRegimen.add(agent.id);
          renderRegimenChecker(true);
        },
      }, getRegimenAgentLabel(agent.id, getLang()));
      regimenPills.push(btn);
      return btn;
    })),
    regimenOutput,
  );

  renderRegimenChecker(false);

  activeMedicationsReset = () => {
    activeCategory = 'all';
    activeSubstance = 'all';
    interactionSearch = '';
    ixSearchInput.value = '';
    selectedRegimen.clear();
    activeWashoutOpioid = 'fentanyl';
    plainToggleBtn.setAttribute('aria-pressed', 'false');
    plainToggleBtn.removeAttribute('aria-current');
    renderPlainSummary();
    renderMedications(false);
    renderWashoutCalculator(false);
    renderInteractions(false);
    renderRegimenChecker(false);
  };

  return h('div', { class: 'view view-medications' },
    pageHeader(
      t('meds.title', 'Medications & Pharmacology Guide'),
      t('meds.lede', 'Plain-language clinical pharmacist guidance on FDA-approved medications for opioid, alcohol, stimulant, and nicotine use disorders, low-dose fentanyl transition protocols, overdose reversal science, and drug interactions.'),
    ),
    emergencyCallout(),
    h('div', { class: 'actions no-print' },
      plainToggleBtn,
      h('button', {
        type: 'button',
        class: 'btn btn-secondary btn-small',
        onclick: () => window.print(),
      }, icon('printer'), tr('Print Bernese Method & Pharmacist Handout', 'Imprimir folleto de Método Bernese y preguntas')),
      fine(tr('Selections and reading mode stay in your browser’s memory and are cleared on Quick exit.', 'Las selecciones y el modo de lectura se mantienen en la memoria de su navegador y se borran con Salida rápida.')),
      fine(tr('Printed or copied information is outside Quick Exit’s control.', 'La información impresa o copiada queda fuera del control de Salida rápida.')),
    ),
    plainSummarySlot,
    tocNav([
      ['quick-find', 'Find medication providers'],
      ['profiles', 'Medication guide'],
      ['bernese-guide', 'Fentanyl & micro-induction ("Bernese Method")'],
      ['naltrexone-washout', tr('Naltrexone transition planning', 'Planificación de transición a naltrexona')],
      ['otp-rules', 'Methadone & 2024 take-home rules'],
      ['reversal-science', 'Naloxone vs. nalmefene & xylazine'],
      ['special-populations', 'Pregnancy, liver/kidney & surgery'],
      ['interactions', 'Drug interaction explorer'],
      ['questions', 'Questions for your prescriber or pharmacist'],
    ]),

    section('quick-find', t('meds.quickFind.title', 'Find providers by medication or service'),
      p('Jump straight to state-licensed clinics and prescribers in SAMHSA’s national directory filtered for the exact medication or service you want:'),
      h('nav', { class: 'presets', 'aria-label': 'Direct medication search filters' },
        h('a', { class: 'preset', href: '#/treatment?codes=BU' }, icon('pin'), ' Buprenorphine (BU)'),
        h('a', { class: 'preset', href: '#/treatment?codes=OTP' }, icon('pin'), ' Methadone clinic / OTP (OTP)'),
        h('a', { class: 'preset', href: '#/treatment?codes=NU' }, icon('pin'), ' Naltrexone / Vivitrol (NU)'),
        h('a', { class: 'preset', href: '#/treatment?codes=PMAT' }, icon('pin'), ' Alcohol medications (PMAT)'),
        h('a', { class: 'preset', href: '#/treatment?codes=NOE' }, icon('shield'), ' Free naloxone & training (NOE)'),
        h('a', { class: 'preset', href: '#/treatment?codes=CMI' }, icon('check-circle'), ' Contingency management (CMI)'),
        h('a', { class: 'preset', href: '#/treatment?codes=NRT' }, icon('heart'), ' Nicotine replacement (NRT)'),
        h('a', { class: 'preset', href: '#/nicotine-care' }, icon('heart'), ' Tobacco, Nicotine & Vaping Recovery Guide'),
        h('a', { class: 'preset', href: '#/benzodiazepine-care' }, icon('shield'), ' Benzodiazepine Ashton Taper & BIND Guide'),
        h('a', { class: 'preset', href: '#/adhd-care' }, icon('activity'), ' ADHD & Non-Stimulant Medications Guide'),
        h('a', { class: 'preset', href: '#/hospital-care' }, icon('shield'), ' Hospital Addiction Care, Acute Pain on MOUD & Patient Rights'),
        h('a', { class: 'preset', href: '#/novel-substances' }, icon('alert'), ' Novel Substances, Kratom, Tianeptine & OTC Misuse'),
        h('a', { class: 'preset', href: '#/gabapentinoid-care' }, icon('shield'), ' Gabapentinoid Safety & Hyperbolic Deprescribing Guide'),
        h('a', { class: 'preset', href: '#/psychedelic-care' }, icon('alert'), ' Psychedelic Harm Reduction, Lithium Seizures & HPPD Guide'),
        h('a', { class: 'preset', href: '#/liver-care' }, icon('activity'), ' Liver Health, Cirrhosis & MOUD Safety Navigator'),
      ),
    ),

    currentPharmacologyReference(),
    section('profiles', t('meds.profiles.title', 'Evidence-based medication profiles'),
      p('Taking medication for an opioid or alcohol use disorder is NOT "trading one addiction for another." Stabilizing receptor signaling stops the cycle of withdrawal and cravings, heals brain circuitry, and—for opioid use disorder—staying on methadone or buprenorphine is linked to fewer overdose deaths.'),
      categoryTablist,
      medStatus,
      medPanel,
    ),

    section('bernese-guide', tr('Starting buprenorphine after fentanyl', 'Iniciar buprenorfina después del fentanilo'),
      p(tr('If you have had sudden withdrawal after taking buprenorphine, that experience does not mean treatment cannot help. Fentanyl exposure can make the timing of a standard start difficult to predict. A low-dose approach is one option a clinician may discuss, but evidence and protocols vary and it does not guarantee avoidance of precipitated withdrawal.', 'Si tuvo abstinencia repentina después de tomar buprenorfina, esa experiencia no significa que el tratamiento no pueda ayudar. La exposición al fentanilo puede dificultar predecir el momento de un inicio estándar. Un profesional puede hablar sobre un método de dosis bajas, pero la evidencia y los protocolos varían y no garantizan evitar la abstinencia precipitada.')),
      h('div', { class: 'callout callout-info' },
        h('p', { class: 'callout-title' }, icon('info'), tr('Starting buprenorphine is individualized', 'El inicio de buprenorfina es individualizado')),
        ul([
          [strong(tr('Precipitated withdrawal: ', 'Abstinencia precipitada: ')), tr('Buprenorphine can displace other opioids from receptors and trigger sudden withdrawal. The risk and timing vary; elapsed time and a symptom score cannot reliably predict an individual start.', 'La buprenorfina puede desplazar otros opioides de los receptores y provocar abstinencia repentina. El riesgo y el momento varían; el tiempo transcurrido y una puntuación de síntomas no predicen de manera fiable el inicio para una persona.')],
          [strong(tr('Low-dose approaches: ', 'Métodos de dosis bajas: ')), tr('Some clinicians use a low-dose approach, but protocols differ and evidence is still developing. There is no single validated schedule for everyone. Do not follow a dosing schedule from this page or continue using non-prescribed opioids based on it.', 'Algunos profesionales usan un método de dosis bajas, pero los protocolos varían y la evidencia sigue desarrollándose. No existe un horario validado único para todas las personas. No siga una pauta de dosis de esta página ni continúe usando opioides no recetados basándose en ella.')],
        ]),
      ),
      h('div', { class: 'callout callout-warn', role: 'note' },
        h('p', { class: 'callout-title' }, icon('alert'), tr('For discussion with a clinician—not for self-dosing', 'Para conversar con un profesional; no para ajustar dosis por cuenta propia')),
        p(tr('Do not start, change, or combine doses based on an online schedule. Ask a licensed clinician or pharmacist to review your recent opioid exposure, other medicines, health conditions, and options. A self-check cannot diagnose withdrawal or determine treatment.', 'No inicie, cambie ni combine dosis basándose en un horario en línea. Pida a un profesional autorizado o farmacéutico que revise su exposición reciente a opioides, otros medicamentos, condiciones de salud y opciones. Una autoevaluación no diagnostica abstinencia ni determina el tratamiento.')),
      ),
      fine(tr('If someone is hard to wake or not breathing normally, call 911. Printed or copied information is outside Quick Exit’s control.', 'Si alguien no despierta o no respira normalmente, llame al 911. La información impresa o copiada queda fuera del control de Salida rápida.')),
      h('p', { class: 'actions no-print' },
        h('button', {
          type: 'button',
          id: 'print-bernese-handout-btn',
          class: 'btn btn-secondary btn-small',
          onclick: () => window.print(),
        }, icon('printer'), tr('Print Low-Dose Micro-Induction ("Bernese Method") & Pharmacist Handout', 'Imprimir folleto de microinducción ("Método Bernese") y preguntas')),
      ),
      p(h('a', { class: 'btn btn-secondary btn-small', href: '#/dental-care' }, icon('shield'), tr('FDA 2022 Buprenorphine Dental Safety & Enamel Protocol', 'Protocolo de Seguridad Dental y Protección del Esmalte FDA 2022'))),
    ),

    section('naltrexone-washout', tr('Naltrexone transition planning & non-opioid pain information', 'Planificación de transición a naltrexona e información sobre dolor no opioide'),
      p(tr('Starting oral or extended-release naltrexone too soon after opioids can cause severe precipitated withdrawal. The opioid-free interval varies by medication and individual circumstances. The calculator below is general education only: it cannot confirm that a person is opioid-free or ready to start. A clinician should review the product labeling, recent medications, and clinical context.', 'Iniciar naltrexona oral o de liberación prolongada demasiado pronto después de usar opioides puede causar abstinencia precipitada grave. El período sin opioides varía según el medicamento y las circunstancias individuales. La calculadora siguiente es solo información general: no confirma que una persona esté libre de opioides ni lista para iniciar. Un profesional debe revisar la etiqueta del producto, los medicamentos recientes y el contexto clínico.')),
      washoutSelectorBar,
      washoutOutputSlot,
    ),

    section('otp-rules', t('meds.otp.title', 'Methadone Access & the 2024 SAMHSA 42 CFR Part 8 Final Rule'),
      p(tr('The 2024 federal rule expands access at Opioid Treatment Programs (OTPs). State requirements and individualized clinical decisions still apply:', 'La norma federal de 2024 amplía el acceso en programas de tratamiento con opioides (OTP). También aplican los requisitos estatales y las decisiones clínicas individuales:')),
      ul([
        tr('Methadone take-home ceilings: up to 7 days during the first 14 days, up to 14 days from day 15, and up to 28 days from day 31. These are permitted maximums, not automatic entitlements; the OTP documents an individualized safety decision.', 'Límites de metadona para llevar: hasta 7 días durante los primeros 14 días, hasta 14 días desde el día 15 y hasta 28 días desde el día 31. Son máximos permitidos, no derechos automáticos; el OTP documenta la decisión de seguridad individual.'),
        tr('Telehealth screening: buprenorphine may use audio-only or video when an adequate evaluation is possible. Methadone generally requires audio-visual screening. The narrow audio-only exception requires the patient to be physically with an appropriately DEA-registered licensed practitioner; audio-only is not a general home methadone start.', 'Evaluación por telesalud: la buprenorfina puede evaluarse por audio o video si la evaluación es adecuada. La metadona generalmente requiere audio y video. La excepción limitada de solo audio exige que la persona esté físicamente con un profesional habilitado y registrado ante la DEA; no autoriza un inicio general de metadona desde casa por teléfono.'),
        tr('Adults no longer need to prove a full year of opioid addiction before admission. Counseling should be offered; refusal alone does not bar MOUD.', 'Los adultos ya no deben demostrar un año completo de adicción a opioides para ingresar. Se debe ofrecer asesoramiento; rechazarlo por sí solo no impide recibir medicación.'),
      ]),
      fine(ext('https://www.samhsa.gov/substance-use/treatment/opioid-treatment-program/42-cfr-part-8/faqs', tr('SAMHSA Part 8 implementation questions', 'Preguntas de SAMHSA sobre la Parte 8'))),
      p(h('a', { class: 'btn btn-secondary', href: '#/treatment?codes=OTP' }, icon('pin'), 'Search certified OTP methadone clinics near me')),
      p(h('a', { class: 'btn btn-secondary', href: '#/methadone-access' }, icon('shield'), 'Open Methadone 2024 Take-Home Calculator & Patient Rights Guide')),
    ),

    section('reversal-science', t('meds.reversal.title', 'Overdose Reversal Pharmacology: 4 mg vs. 8 mg Naloxone, Nalmefene & Xylazine'),
      p(tr('For a suspected overdose, give naloxone, call 911, support breathing, and follow the product instructions. Naloxone is temporary and does not reverse non-opioid sedatives such as xylazine.', 'Ante una posible sobredosis, administre naloxona, llame al 911, apoye la respiración y siga las instrucciones del producto. La naloxona es temporal y no revierte sedantes no opioides como la xilacina.')),
      h('div', { class: 'table-wrap', tabindex: '0', role: 'region', 'aria-label': tr('Comparison of opioid overdose reversal medications', 'Comparación de medicamentos para revertir sobredosis de opioides') },
        h('table', null,
          h('caption', { class: 'visually-hidden' }, tr('Comparison of opioid overdose reversal medications', 'Comparación de medicamentos para revertir sobredosis de opioides')),
          h('thead', null,
            h('tr', null,
              h('th', { scope: 'col' }, tr('Reversal agent', 'Medicamento de rescate')),
              h('th', { scope: 'col' }, tr('Onset', 'Inicio del efecto')),
              h('th', { scope: 'col' }, tr('Duration', 'Duración')),
              h('th', { scope: 'col' }, tr('Safety guidance', 'Consejos de seguridad')),
            ),
          ),
          h('tbody', null,
            REVERSAL_COMPARISON.map((r) => h('tr', null,
              h('th', { scope: 'row' }, tr(r.product, r.productEs)),
              h('td', null, tr(r.onset, r.onsetEs)),
              h('td', null, tr(r.duration, r.durationEs)),
              h('td', null, tr(r.guidance, r.guidanceEs)),
            )),
          ),
        ),
      ),
      h('div', { class: 'callout callout-warn' },
        h('p', { class: 'callout-title' }, icon('alert'), tr('Xylazine: naloxone does not replace emergency care', 'Xilacina: la naloxona no sustituye la atención de emergencia')),
        p(tr('Naloxone can reverse an opioid component but will not reverse xylazine. Give naloxone for a suspected overdose, call 911, provide rescue breaths if trained or directed, and stay with the person. Follow the product label and dispatcher instructions if breathing does not improve or becomes abnormal again; sedation can continue after naloxone.', 'La naloxona puede revertir el componente opioide, pero no revierte la xilacina. Adminístrela ante una posible sobredosis, llame al 911, dé respiraciones de rescate si tiene capacitación o se lo indican, y quédese con la persona. Siga la etiqueta del producto y las instrucciones de la persona operadora si la respiración no mejora o vuelve a ser anormal; la sedación puede continuar después de la naloxona.')),
        p(tr('Xylazine withdrawal can be severe. Evidence and treatment approaches continue to develop; seek medical assessment rather than trying to manage withdrawal or change medications alone.', 'La abstinencia de xilacina puede ser grave. La evidencia y los métodos de tratamiento siguen desarrollándose; busque una evaluación médica en vez de intentar controlar la abstinencia o cambiar medicamentos por cuenta propia.')),
        fine(ext('https://www.cdc.gov/overdose-prevention/about/what-you-should-know-about-xylazine.html', tr('CDC guidance on xylazine and overdose response', 'Guía de los CDC sobre xilacina y respuesta a sobredosis'))),
      ),
    ),

    section('special-populations', t('meds.specialPopulations.title', 'Special Populations & Clinical Situations (Pregnancy, Liver/Kidney Health & Surgery)'),
      p('Clinical pharmacology guidance for common medical situations where dosing, organ clearance, or acute pain management matters:'),
      h('div', { class: 'results-list' },
        ...SPECIAL_POPULATIONS_PHARM.map(specialPopulationCard),
      ),
    ),

    section('interactions', t('meds.interactions.title', 'Interactive Drug & Medication Interaction Explorer'),
      regimenCheckerPanel,
      p('Filter by substance or search any medication, street supply adulterant, or prescription drug class to review mechanism and harm-reduction guidance:'),
      substanceFilterBar,
      h('div', { class: 'finder-search' },
        h('div', { class: 'combo' },
          icon('search'),
          ixSearchInput,
        ),
      ),
      ixStatus,
      ixListEl,
      fine('Have a question about a specific prescription combination right now? Call Poison Help at ',
        tel('18002221222', '1-800-222-1222'), ' (free, confidential, 24/7 clinical pharmacists and nurses) or ask your local pharmacist.'),
    ),

    section('questions', t('meds.questions.title', 'Questions for My Prescriber or Pharmacist'),
      p('You have the right to respectful, collaborative medical care. Bring or print these questions for your next appointment or pharmacy visit:'),
      h('ol', { class: 'checklist' },
        PRESCRIBER_QUESTIONS.map((q) => h('li', null, q)),
      ),
      p(
        h('button', {
          type: 'button',
          class: 'btn btn-secondary',
          onclick: () => window.print(),
        }, icon('printer'), t('meds.questions.print', 'Print this checklist')),
      ),
    ),
  );
}
