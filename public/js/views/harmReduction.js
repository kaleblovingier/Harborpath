import { h, clear, ext, tel, icon, announce } from '../dom.js';
import { HOTLINES } from '../content/hotlines.js';
import { getLang } from '../i18n.js';
import {
  testStripCalculator,
  getTestStripState,
  resetTestStripState,
  calculateDilutionRatio,
  DILUTION_PROTOCOLS,
  TEST_STRIP_INTERPRETATIONS,
} from '../components/testStripCalculator.js';
import {
  pageHeader,
  section,
  p,
  fine,
  ul,
  strong,
  resourceList,
  hotlineGrid,
  tocNav,
  emergencyCallout,
} from './common.js';

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

export const NALOXONE_ACTION_STEPS = [
  {
    step: 1,
    id: 'identify-overdose',
    title: 'Recognize the signs of an opioid or fentanyl overdose',
    titleEs: 'Reconozca las señales de sobredosis de opioides o fentanilo',
    clinicalDetail:
      'Assess for unresponsiveness to physical/verbal stimuli (sternal rub), profound respiratory depression (apnea, hypopnea, or respiratory rate <8–10 bpm), central cyanosis (blue, purple, or ashen lips and fingernail beds), pinpoint pupils (miosis), and irregular snoring or gurgling sounds ("death rattle").',
    plainDetail:
      'Check for the signs: The person will not wake up even if you shake them or rub their breastbone hard. Breathing is very slow, stopped, or makes loud snoring/choking sounds. Lips, skin, or fingernails turn blue, purple, or pale gray.',
    clinicalDetailEs:
      'Evalúe la falta de respuesta a estímulos verbales/dolorosos (frotar esternón), depresión respiratoria grave (<8-10 respiraciones/minuto), cianosis central (labios y uñas azules o cenizas), pupilas puntiformes y sonidos guturales o de gorgoteo.',
    plainDetailEs:
      'Compruebe las señales: La persona no despierta aunque la mueva fuerte o frote el pecho. Su respiración es lenta o hace ruidos de gorgoteo. Labios o uñas están azules o grises.',
  },
  {
    step: 2,
    id: 'give-naloxone',
    title: 'Administer naloxone (Narcan nasal spray)',
    titleEs: 'Administre naloxona (aerosol nasal Narcan)',
    clinicalDetail:
      'Peel open the blister packaging. Place thumb on the bottom of the plunger and two fingers on the nozzle. Insert the nozzle fully into one nostril until your fingers touch the bottom of the person’s nose. Press plunger firmly to release the entire 4 mg dose. Does NOT require priming or testing.',
    plainDetail:
      'Peel open the box. Insert the nozzle into one nostril until your fingers touch the bottom of their nose. Push the plunger firmly with your thumb. You do not need to prime, pump, or test it first.',
    clinicalDetailEs:
      'Abra el empaque. Inserte la boquilla completamente en una fosa nasal hasta que sus dedos toquen la base de la nariz. Presione el émbolo con fuerza para aplicar los 4 mg completos. No requiere prueba previa.',
    plainDetailEs:
      'Abra el paquete. Meta la punta en una fosa nasal hasta que sus dedos toquen la base de la nariz. Empuje el botón con el pulgar para aplicar la dosis.',
  },
  {
    step: 3,
    id: 'call-911',
    title: 'Call 911 immediately — Good Samaritan legal protections apply',
    titleEs: 'Llame al 911 de inmediato — Aplican leyes de protección del Buen Samaritano',
    clinicalDetail:
      'Dial 911 right away. Report: "A person is unresponsive and not breathing" along with your exact location. Good Samaritan overdose laws in over 48 states and Washington D.C. provide criminal immunity for minor drug and paraphernalia possession for calling.',
    plainDetail:
      'Call 911 right away. Tell the operator: "Someone is unresponsive and not breathing" and give your address. Good Samaritan laws in almost all states protect you from minor drug possession charges when calling for medical help.',
    clinicalDetailEs:
      'Llame al 911 de inmediato. Informe: "Hay una persona inconsciente que no respira" y dé la dirección exacta. Las leyes de Buen Samaritano protegen contra cargos menores de posesión al pedir ayuda médica.',
    plainDetailEs:
      'Llame al 911 de inmediato. Diga: "Alguien no responde y no respira" y dé la dirección. Las leyes del Buen Samaritano le protegen de arresto por posesión menor al pedir auxilio.',
  },
  {
    step: 4,
    id: 'rescue-breathing',
    title: 'Deliver rescue breaths (1 breath every 5 seconds)',
    titleEs: 'Dé respiraciones de rescate (1 respiración cada 5 segundos)',
    clinicalDetail:
      'Naloxone takes 2 to 3 minutes to displace synthetic opioids at central mu receptors. Lack of oxygen causes hypoxic brain injury within minutes. Tilt the head backward, lift the chin to open airway, pinch nostrils closed, and deliver 1 slow breath every 5 seconds, confirming chest rise.',
    plainDetail:
      'Naloxone takes 2 to 3 minutes to kick in, but the brain needs oxygen right now. Tilt their head back, lift their chin, pinch their nose shut, and give 1 breath every 5 seconds. Make sure their chest rises with each breath.',
    clinicalDetailEs:
      'La naloxona tarda 2–3 minutos en surtir efecto. Abra la vía aérea inclinando la cabeza, tape la nariz y dé 1 respiración de rescate boca a boca cada 5 segundos, verificando que el pecho se eleve.',
    plainDetailEs:
      'La naloxona tarda 2 o 3 minutos en actuar, pero el cerebro necesita aire ya. Incline la cabeza, tape la nariz y dé 1 respiración en su boca cada 5 segundos.',
  },
  {
    step: 5,
    id: 'repeat-if-needed',
    title: 'Re-evaluate after 2–3 minutes & give second dose if still unresponsive',
    titleEs: 'Reevalúe a los 2–3 minutos y dé una segunda dosis si sigue inconsciente',
    clinicalDetail:
      'If spontaneous, adequate breathing (at least 10–12 breaths/minute) does not resume after 2 to 3 minutes, administer a second 4 mg naloxone dose into the OPPOSITE nostril and resume rescue breathing until emergency medical responders take over.',
    plainDetail:
      'Wait 2 to 3 minutes. If they are still not breathing normally or responding, spray a second dose of naloxone into the OTHER nostril. Continue rescue breaths until help arrives.',
    clinicalDetailEs:
      'Si tras 2 a 3 minutos la persona no respira espontáneamente (≥10–12 respiraciones/minuto), aplique una segunda dosis de 4 mg en la OTRA fosa nasal y mantenga la respiración asistida.',
    plainDetailEs:
      'Espere de 2 a 3 minutos. Si aún no respira normalmente, aplique un segundo aerosol en la OTRA fosa nasal. Siga dando respiraciones de rescate hasta que llegue la ayuda.',
  },
  {
    step: 6,
    id: 'recovery-position',
    title: 'Roll into the recovery position once breathing is restored',
    titleEs: 'Coloque en posición de recuperación cuando vuelva a respirar',
    clinicalDetail:
      'Once the patient resumes breathing, roll them onto their side with their upper knee bent forward at a 90-degree angle to stabilize the body, with their hand supporting the head. This keeps the airway clear and prevents pulmonary aspiration if they vomit upon waking.',
    plainDetail:
      'When they start breathing, roll them onto their side into the recovery position (with their top knee bent forward to prop them up, and their hand under their cheek). This keeps their throat open and prevents choking if they wake up sick to their stomach.',
    clinicalDetailEs:
      'Cuando respiren, colóquelos de costado con la rodilla doblada hacia adelante y la mano sosteniendo la cabeza para evitar broncoaspiración si vomitan al despertar.',
    plainDetailEs:
      'Cuando respiren, gírelos de lado con la rodilla doblada para que no rueden y la mano bajo la cara. Esto evita que se ahoguen si vomitan al despertar.',
  },
];

export const GOOD_SAMARITAN_STEPS = [
  {
    step: 1,
    id: 'call-immediately',
    title: 'Call 911 without delay',
    titleEs: 'Llame al 911 sin dudarlo',
    detail:
      'Every minute without oxygen increases the risk of brain injury or death. State clearly: "Someone is unresponsive and not breathing at [address]." You do not need to mention drug use on the initial dispatch call; focusing on respiratory arrest ensures immediate paramedic dispatch.',
    detailEs:
      'Cada minuto sin oxígeno aumenta el riesgo de daño cerebral o muerte. Diga claramente: "Hay una persona inconsciente que no respira en [dirección]". Enfocarse en la falta de respiración moviliza paramédicos inmediatamente.',
  },
  {
    step: 2,
    id: 'know-protections',
    title: 'Core legal immunities: What Good Samaritan laws cover',
    titleEs: 'Inmunidades legales clave: Lo que cubren las leyes del Buen Samaritano',
    detail:
      'Over 48 states and Washington D.C. have enacted Overdose Good Samaritan laws. In most jurisdictions, both the caller seeking medical assistance AND the person overdosing receive legal immunity from arrest, charge, and prosecution for minor drug possession (personal use amounts) and drug paraphernalia possession.',
    detailEs:
      'Más de 48 estados y Washington D.C. cuentan con leyes del Buen Samaritano. En la gran mayoría, tanto la persona que llama como la persona que sufre la sobredosis reciben inmunidad contra arresto y cargos por posesión menor para consumo personal y posesión de parafernalia.',
  },
  {
    step: 3,
    id: 'naloxone-immunity',
    title: 'Civil and criminal protection for administering naloxone',
    titleEs: 'Protección civil y penal por administrar naloxona',
    detail:
      'All 50 states have passed naloxone access laws granting civil liability immunity and criminal immunity to lay responders who administer naloxone in good faith to someone suspected of experiencing an overdose. You cannot be sued or prosecuted for giving Narcan.',
    detailEs:
      'Los 50 estados otorgan inmunidad civil y penal a cualquier persona que administre naloxona de buena fe ante una sospecha de sobredosis. No puede ser demandado ni procesado por aplicar Narcan.',
  },
  {
    step: 4,
    id: 'know-limitations',
    title: 'Crucial limitations: What is NOT covered by Good Samaritan laws',
    titleEs: 'Límites cruciales: Lo que NO cubren las leyes del Buen Samaritano',
    detail:
      'Good Samaritan statutes generally do NOT protect against outstanding felony arrest warrants, drug sales/trafficking or possession with intent to distribute (large quantities), violent crimes, or weapons offenses. Protection requires remaining at the scene and cooperating with emergency responders by sharing medical details.',
    detailEs:
      'Las leyes del Buen Samaritano generalmente NO protegen contra órdenes de arresto pendientes por delitos graves, venta/tráfico de drogas o posesión con intención de distribuir (grandes cantidades), ni delitos violentos o de armas. La protección exige permanecer en el lugar y cooperar con el personal médico.',
  },
  {
    step: 5,
    id: 'responder-interaction',
    title: 'Interacting safely with first responders at the scene',
    titleEs: 'Cómo interactuar con seguridad con los socorristas en el lugar',
    detail:
      'Before emergency responders arrive, secure and store any extra drugs or paraphernalia out of plain view. When paramedics arrive, state the facts clearly: "They took [substance] and I administered [number] doses of naloxone at [time]." Paramedics are healthcare professionals whose priority is airway and oxygenation, not legal enforcement.',
    detailEs:
      'Antes de que lleguen los socorristas, guarde cualquier sustancia o parafernalia fuera de la vista. Cuando lleguen los paramédicos, informe con claridad: "Consumió [sustancia] y apliqué [número] dosis de naloxona a las [hora]". Su prioridad médica es salvar la vida y restaurar la oxigenación.',
  },
];

export const SUPPLY_PATHWAYS = [
  {
    id: 'ssp',
    badge: 'Syringe Services (SSPs)',
    badgeEs: 'Servicios de jeringas (SSP)',
    title: 'Syringe Services Programs (SSPs) & Community Exchanges',
    titleEs: 'Programas de Servicios de Jeringas (SSP) e intercambios comunitarios',
    desc:
      'State-authorized public health programs providing free sterile syringes, safe sharps disposal containers, sterile water, cookers, cottons, pipes, fentanyl/xylazine test strips, free naloxone kits, rapid HIV and hepatitis C testing, on-site wound care, and voluntary linkage to buprenorphine and methadone treatment without requiring abstinence.',
    descEs:
      'Programas de salud pública autorizados que ofrecen jeringas estériles gratuitas, contenedores de eliminación segura, agua estéril, cazoletas, algodones, pipas, tiras de fentanilo/xilacina, naloxona, pruebas rápidas de VIH y hepatitis C, cuidado de heridas y conexión voluntaria a tratamiento con buprenorfina o metadona sin exigir abstinencia.',
    link: 'https://nasen.org/directory/',
    linkText: 'NASEN Syringe Access Directory',
    linkTextEs: 'Directorio nacional de jeringas NASEN',
    internalLink: '#/treatment?codes=NOE',
    internalText: 'Find programs with naloxone & overdose education',
    internalTextEs: 'Buscar programas con naloxona y educación',
  },
  {
    id: 'vending',
    badge: '24/7 Vending Machines',
    badgeEs: 'Máquinas expendedoras 24/7',
    title: 'Community Naloxone & Harm Reduction Vending Machines',
    titleEs: 'Máquinas expendedoras comunitarias de naloxona y reducción de daños',
    desc:
      'Barrier-free automated smart lockers and dispensing machines located outside local health departments, fire stations, libraries, and transit stations. Free of charge ($0), with zero identification, zero registration, and zero insurance requirements. Most dispense Narcan twin-packs, fentanyl and xylazine test strips, CPR face shields, and hygiene supplies.',
    descEs:
      'Dispensadores automatizados exteriores disponibles las 24 horas, ubicados frente a departamentos de salud, estaciones de bomberos, bibliotecas y estaciones de tránsito. Totalmente gratuitos ($0), sin necesidad de identificación, seguro ni registro. Suelen suministrar paquetes de Narcan, tiras reactivas de fentanilo y xilacina, mascarillas de RCP y kits de higiene.',
    link: 'https://nextdistro.org/',
    linkText: 'NEXT Distro Community Locator',
    linkTextEs: 'Localizador comunitario NEXT Distro',
    internalLink: '#/states',
    internalText: 'Check state health agency resources',
    internalTextEs: 'Consultar recursos por estado',
  },
  {
    id: 'strips',
    badge: 'Drug Checking',
    badgeEs: 'Verificación de sustancias',
    title: 'Fentanyl and Xylazine Test Strips',
    titleEs: 'Tiras reactivas para fentanilo y xilacina',
    desc:
      'Rapid immunoassay test strips that detect fentanyl analogs and xylazine adulterants in street drug supplies, pressed pills, and powders. Available free at most SSPs, mobile outreach vans, and health clinics, or available by mail. Dilution protocol: mix ~10 mg of drug with 1/2 tsp water (or 1 full tsp water for methamphetamine/MDMA to prevent false positives), dip for 15s, and read in 2–5 minutes (1 line = detected; 2 lines = negative).',
    descEs:
      'Tiras rápidas de inmunoensayo que detectan análogos de fentanilo y adulterantes de xilacina en polvos, pastillas y estimulantes. Disponibles gratis en programas SSP, unidades móviles y clínicas de salud, o por correo. Protocolo: mezcle ~10 mg con ½ cucharadita de agua (o 1 cucharadita completa para metanfetamina/MDMA para evitar falsos positivos), sumerja 15 s y lea en 2–5 minutos (1 línea = positivo; 2 líneas = negativo).',
    link: 'https://dancesafe.org/',
    linkText: 'DanceSafe Drug Checking Guides & Kits',
    linkTextEs: 'Guías y kits de análisis DanceSafe',
    internalLink: '#/treatment?codes=NOE',
    internalText: 'Find local harm reduction supplies',
    internalTextEs: 'Buscar suministros locales',
  },
  {
    id: 'mail',
    badge: 'Discreet Mail Delivery',
    badgeEs: 'Envío discreto por correo',
    title: 'Mail-Based Anonymous Supply Distribution (NEXT Distro)',
    titleEs: 'Distribución anónima por correo (NEXT Distro)',
    desc:
      'A free, confidential harm reduction service delivering supplies directly to your residence, P.O. Box, or local post office General Delivery in plain, unmarked packages. Designed specifically for people in rural areas or towns without a physical syringe services program. Delivers intramuscular naloxone, Narcan nasal spray, test strips, and sterile supplies.',
    descEs:
      'Servicio gratuito y confidencial de reducción de daños que envía suministros directamente a su domicilio, apartado postal o entrega general de correos en paquetes totalmente discretos y sin marcas. Especialmente diseñado para personas en áreas rurales o sin programas de intercambio presenciales.',
    link: 'https://nextdistro.org/naloxone',
    linkText: 'Order Free Naloxone by Mail (NEXT Distro)',
    linkTextEs: 'Pedir naloxona gratis por correo (NEXT Distro)',
    internalLink: '#/states',
    internalText: 'Find state harm reduction networks',
    internalTextEs: 'Redes de reducción de daños estatales',
  },
  {
    id: 'mobile',
    badge: 'Mobile Outreach Vans',
    badgeEs: 'Unidades móviles de alcance',
    title: 'Mobile Outreach Vans & Street-Based Health Teams',
    titleEs: 'Camionetas móviles y equipos de salud en la calle',
    desc:
      'Peer-led mobile harm reduction units and outreach vans that travel directly to encampments, transit hubs, rural crossroads, and underserved neighborhoods. They offer direct sterile supply exchange, field wound triage and clean dressings, bad-batch alerts, weather gear, and low-barrier bridge buprenorphine induction without requiring a clinic appointment.',
    descEs:
      'Unidades móviles conducidas por promotores de salud y especialistas de apoyo mutuo que acuden a campamentos, estaciones de transporte y zonas rurales. Ofrecen intercambio de material estéril, curación de heridas en el terreno, alertas de lotes adulterados, ropa para el clima y prescripción puente de buprenorfina sin cita previa.',
    link: 'https://nasen.org/',
    linkText: 'Find Mobile Units on NASEN Directory',
    linkTextEs: 'Buscar unidades móviles en NASEN',
    internalLink: '#/health?tab=clinics',
    internalText: 'Find low-cost community health centers',
    internalTextEs: 'Centros de salud comunitarios',
  },
];

const harmReductionState = {
  plainLanguage: false,
  supplyFilter: 'all',
};

let activeHarmReset = null;

export function getHarmReductionState() {
  return {
    plainLanguage: Boolean(harmReductionState.plainLanguage),
    supplyFilter: String(harmReductionState.supplyFilter || 'all'),
  };
}

export function resetHarmReductionState() {
  harmReductionState.plainLanguage = false;
  harmReductionState.supplyFilter = 'all';
  resetTestStripState();
  if (typeof activeHarmReset === 'function') {
    activeHarmReset();
  }
}

export function buildNaloxoneActionCard({ plainLanguage = false } = {}) {
  const isEs = getLang() === 'es';
  return h('article', {
    class: 'card print-handout naloxone-action-card',
    id: 'naloxone-action-card',
    'aria-labelledby': 'naloxone-card-title',
  },
    h('div', { class: 'facility-head' },
      h('h3', { id: 'naloxone-card-title', class: 'facility-name' },
        icon('shield'), ' ',
        tr(
          'Naloxone (Narcan) Emergency Overdose Response Action Card',
          'Tarjeta de acción de emergencia: Respuesta a sobredosis con naloxona (Narcan)',
        )),
      h('span', { class: 'chip chip-extra' },
        tr('Printable Emergency Action Card', 'Tarjeta de acción imprimible')),
    ),
    p(plainLanguage
      ? tr(
          'Naloxone saves lives during an opioid or fentanyl overdose. Here are the 6 critical steps to save a life right away, with full Good Samaritan legal protections when calling 911.',
          'La naloxona salva vidas durante una sobredosis de opioides o fentanilo. Siga estos 6 pasos de emergencia para salvar una vida, con protección legal completa al llamar al 911.',
        )
      : tr(
          'Evidence-based clinical emergency protocol for immediate reversal of opioid-induced respiratory depression with 4 mg intranasal naloxone, airway management, and rescue breathing.',
          'Protocolo clínico de emergencia para la reversión inmediata de la depresión respiratoria inducida por opioides con 4 mg de naloxona intranasal y ventilación de rescate.',
        )),
    h('ol', { class: 'steps' },
      NALOXONE_ACTION_STEPS.map((item) => h('li', { class: 'step', id: `naloxone-step-${item.id}` },
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
        'aria-label': tr('Print Naloxone Emergency Action Card', 'Imprimir tarjeta de acción de naloxona'),
      }, icon('printer'), tr('Print this action card', 'Imprimir tarjeta de acción')),
      h('a', {
        class: 'btn btn-primary btn-small',
        href: '#/treatment?codes=NOE',
      }, icon('pin'), tr('Find free naloxone near me', 'Buscar naloxona gratuita cerca de mí')),
      ext('https://nextdistro.org/naloxone', tr('Order free mail-delivered naloxone (NEXT Distro)', 'Pedir naloxona gratis por correo (NEXT Distro)'), { class: 'btn btn-ghost btn-small' }),
      h('a', {
        class: 'btn btn-ghost btn-small',
        href: '#/overdose',
      }, icon('phone'), tr('Overdose emergency guide', 'Guía de emergencia por sobredosis')),
    ),
  );
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
      h('a', {
        class: 'btn btn-secondary btn-small',
        href: '#/adulterant-care',
      }, icon('shield'), tr('Clinical adulterants & sedation triage guide', 'Guía clínica de adulterantes y triaje de sedación')),
      h('a', {
        class: 'btn btn-secondary btn-small',
        href: '#/polysubstance-care',
      }, icon('shield'), tr('Polysubstance synergy & airway guide', 'Guía de sinergia de polisustancias y vía aérea')),
      h('a', {
        class: 'btn btn-secondary btn-small',
        href: '#/nightlife-care',
      }, icon('shield'), tr('Nightlife, club drugs & reagent testing', 'Ocio nocturno, drogas de club y reactivos')),
      h('a', {
        class: 'btn btn-secondary btn-small',
        href: '#/cannabis-care',
      }, icon('shield'), tr('Cannabinoid hyperemesis (CHS) & concentrates', 'Hiperémesis cannabinoide (SHC) y concentrados')),
      h('a', {
        class: 'btn btn-secondary btn-small',
        href: '#/viral-hepatitis',
      }, icon('shield'), tr('Hepatitis C cure, DAA & HIV PrEP/PEP', 'Curación VHC, AAD y PrEP/PEP VIH')),
      h('a', {
        class: 'btn btn-secondary btn-small',
        href: '#/nicotine-care',
      }, icon('heart'), tr('Tobacco, nicotine & vaping recovery', 'Cesación de tabaco, nicotina y vapeo')),
      h('a', {
        class: 'btn btn-secondary btn-small',
        href: '#/benzodiazepine-care',
      }, icon('shield'), tr('Benzodiazepines, Ashton taper & BIND', 'Benzodiazepinas, desescalada Ashton y BIND')),
      h('a', {
        class: 'btn btn-secondary btn-small',
        href: '#/adhd-care',
      }, icon('activity'), tr('ADHD, neurodiversity & fake pill safety', 'TDAH, neurodiversidad y pastillas falsas')),
    ),
  );
}

export function harmReductionView() {
  const isEs = getLang() === 'es';
  const plainSummarySlot = h('div', { id: 'harm-plain-summary-slot' });
  const naloxoneCardSlot = h('div', { id: 'harm-naloxone-card-slot' });
  const xylazineCardSlot = h('div', { id: 'harm-xylazine-card-slot' });
  const pathwaysListSlot = h('div', { id: 'harm-pathways-list-slot', class: 'pathway-cards-grid' });

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

  const pathwayFilterButtons = [
    { id: 'all', label: tr('All supply access pathways', 'Todas las vías de acceso') },
    { id: 'ssp', label: tr('Syringe Programs (SSPs)', 'Programas de jeringas (SSP)') },
    { id: 'vending', label: tr('24/7 Vending machines', 'Máquinas expendedoras 24/7') },
    { id: 'strips', label: tr('Fentanyl & xylazine test strips', 'Tiras reactivas') },
    { id: 'mail', label: tr('Mail delivery (NEXT Distro)', 'Envío por correo (NEXT Distro)') },
    { id: 'mobile', label: tr('Mobile outreach vans', 'Unidades móviles') },
  ].map((btn) => {
    const el = h('button', {
      type: 'button',
      class: 'preset pathway-filter-btn',
      id: `filter-pathway-${btn.id}`,
      'aria-pressed': String(harmReductionState.supplyFilter === btn.id),
      onclick: () => {
        harmReductionState.supplyFilter = btn.id;
        updatePathwayFilterUi();
        renderPathways();
      },
    }, btn.label);
    if (harmReductionState.supplyFilter === btn.id) el.setAttribute('aria-current', 'true');
    return el;
  });

  function updatePathwayFilterUi() {
    for (const btn of pathwayFilterButtons) {
      const btnId = btn.id.replace('filter-pathway-', '');
      const active = harmReductionState.supplyFilter === btnId;
      btn.setAttribute('aria-pressed', String(active));
      if (active) btn.setAttribute('aria-current', 'true');
      else btn.removeAttribute('aria-current');
    }
  }

  function renderPathways() {
    clear(pathwaysListSlot);
    const filter = harmReductionState.supplyFilter;
    const filtered = filter === 'all'
      ? SUPPLY_PATHWAYS
      : SUPPLY_PATHWAYS.filter((p) => p.id === filter);

    for (const item of filtered) {
      pathwaysListSlot.append(
        h('article', {
          class: 'card pathway-access-card',
          id: `pathway-${item.id}`,
          'aria-labelledby': `pathway-title-${item.id}`,
        },
          h('div', { class: 'facility-head' },
            h('h4', { id: `pathway-title-${item.id}`, class: 'facility-name' },
              icon('shield'), ' ',
              isEs ? item.titleEs : item.title),
            h('span', { class: 'chip chip-extra' }, isEs ? item.badgeEs : item.badge),
          ),
          p(isEs ? item.descEs : item.desc),
          h('div', { class: 'actions' },
            item.link && ext(item.link, isEs ? item.linkTextEs : item.linkText, { class: 'btn btn-secondary btn-small' }),
            item.internalLink && h('a', {
              class: 'btn btn-primary btn-small',
              href: item.internalLink,
            }, icon('pin'), isEs ? item.internalTextEs : item.internalText),
          ),
        ),
      );
    }
  }

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
            [strong(tr('1. Carry naloxone (Narcan): ', '1. Lleve naloxona (Narcan): ')), tr('It reverses fentanyl and opioid overdoses in 2–3 minutes and is sold at pharmacies without a prescription or free from local syringe programs, vending machines, and by mail.', 'Revierte sobredosis de opioides y fentanilo en 2–3 minutos y se obtiene gratis en programas locales, máquinas expendedoras o por correo.')],
            [strong(tr('2. Never use alone: ', '2. No consuma a solas: ')), tr('Take turns with a trusted friend or call Never Use Alone (800-484-3731) so someone can send help if you pass out.', 'Tome turnos con alguien de confianza o llame a Never Use Alone (800-484-3731).')],
            [strong(tr('3. Give rescue breaths for "tranq" (xylazine/medetomidine): ', '3. Dé respiraciones de rescate para "tranq": ')), tr('Always give 1 spray of naloxone first AND give 1 breath every 5 seconds. Once they breathe on their own, stop giving extra naloxone.', 'Siempre dé naloxona primero y 1 respiración cada 5 segundos.')],
            [strong(tr('4. Care for wounds gently: ', '4. Cuide las heridas con suavidad: ')), tr('Wash with saline or soap and water, skip peroxide/alcohol, keep covered with ointment and a non-stick bandage, and mark red edges with a pen.', 'Lave con solución salina o agua y jabón, evite alcohol o agua oxigenada y use vendaje antiadherente.')],
            [strong(tr('5. Know your rights under Good Samaritan laws: ', '5. Conozca sus derechos con las leyes del Buen Samaritano: ')), tr('In almost every state, calling 911 for an overdose protects you and the person overdosing from minor drug possession charges.', 'Llamar al 911 protege contra arresto por posesión menor en casi todos los estados.')],
          ]),
        ),
      );
    }

    clear(naloxoneCardSlot).append(
      buildNaloxoneActionCard({ plainLanguage: harmReductionState.plainLanguage }),
    );

    clear(xylazineCardSlot).append(
      buildXylazineActionCard({ plainLanguage: harmReductionState.plainLanguage }),
    );

    renderPathways();
  }

  activeHarmReset = () => {
    plainToggleBtn.setAttribute('aria-pressed', 'false');
    plainToggleBtn.removeAttribute('aria-current');
    updatePathwayFilterUi();
    renderDynamicSections();
  };

  renderDynamicSections();

  return h('div', { class: 'view view-prose' },
    pageHeader(
      tr('Harm reduction & supply access', 'Reducción de daños y acceso a suministros'),
      tr(
        'Practical ways to stay safer, whether or not you want to stop using. Barrier-free access to naloxone, test strips, syringe programs, and legal protections. No judgment and no requirement to quit.',
        'Vías prácticas para cuidarse y mantenerse a salvo, sin juzgar y sin exigencia de abstinencia. Acceso sin barreras a naloxona, tiras reactivas, programas de jeringas y protección legal.',
      ),
    ),
    emergencyCallout(),
    h('div', { class: 'actions no-print' },
      plainToggleBtn,
      h('button', {
        type: 'button',
        class: 'btn btn-secondary btn-small',
        onclick: () => window.print(),
      }, icon('printer'), tr('Print Harm Reduction Handouts', 'Imprimir folletos de reducción de daños')),
      fine(tr('Settings are kept strictly in browser memory and cleared on Quick exit.', 'La configuración se mantiene en la memoria del navegador y se borra con Salida rápida.')),
    ),
    plainSummarySlot,
    tocNav([
      ['naloxone-card', tr('Printable Naloxone action card', 'Tarjeta de acción de naloxona')],
      ['supply-pathways', tr('Syringe programs (SSPs), vending machines & mobile vans', 'Programas SSP, máquinas 24/7 y unidades móviles')],
      ['mail-distribution', tr('Free mail delivery (NEXT Distro)', 'Envío gratuito por correo (NEXT Distro)')],
      ['xylazine-tranq', tr('Xylazine & medetomidine ("tranq") action card', 'Tarjeta de acción para xilacina ("tranq")')],
      ['never-alone', tr('Don’t use alone & hotline support', 'No consuma a solas y líneas telefónicas')],
      ['checking', tr('Fentanyl & xylazine test strips', 'Tiras reactivas para fentanilo y xilacina')],
      ['safer-use', tr('Lower your risk', 'Disminuya su riesgo')],
      ['mixing', tr('Mixing substances', 'Combinación de sustancias')],
      ['wounds', tr('Supplies & wound care', 'Suministros y cuidado de heridas')],
      ['rights', tr('Good Samaritan overdose legal protections', 'Leyes de protección del Buen Samaritano')],
      ['more', tr('More harm reduction & clinical tools', 'Más herramientas clínicas y recursos')],
    ]),

    section('naloxone-card', tr('Naloxone (Narcan) Emergency Action Card', 'Tarjeta de acción de emergencia: Naloxona (Narcan)'),
      naloxoneCardSlot,
    ),

    section('supply-pathways', tr('Harm Reduction Supply Access Pathways', 'Vías de acceso a suministros de reducción de daños'),
      p(tr(
        'Sterile supplies, fentanyl and xylazine test strips, and free naloxone are available through multiple community, automated, and mobile pathways without prescriptions, fees, or insurance.',
        'Los suministros estériles, las tiras reactivas y la naloxona gratuita están disponibles a través de múltiples opciones comunitarias, automatizadas y móviles sin recetas ni costos.',
      )),
      h('nav', {
        class: 'presets pathways-nav no-print',
        'aria-label': tr('Filter supply access pathways', 'Filtrar vías de acceso a suministros'),
      }, pathwayFilterButtons),
      pathwaysListSlot,
    ),

    section('mail-distribution', tr('Mail-Based Anonymous Supply Distribution (NEXT Distro)', 'Distribución anónima por correo (NEXT Distro)'),
      p(tr(
        'If you live in a rural area, a small town, or cannot safely visit an in-person syringe exchange or pharmacy, NEXT Distro provides free, confidential harm reduction supplies delivered directly by mail in plain, unmarked packages.',
        'Si vive en un área rural o no puede acudir a un programa presencial, NEXT Distro ofrece suministros gratuitos y confidenciales enviados por correo en paquetes sin marcas.',
      )),
      h('div', { class: 'card' },
        h('h3', null, icon('shield'), ' ', tr('How NEXT Distro mail distribution works', 'Cómo funciona la distribución por correo de NEXT Distro')),
        h('ol', null,
          h('li', null,
            strong(tr('1. Check state eligibility: ', '1. Verifique la elegibilidad de su estado: ')),
            tr(
              'Visit the state portal to see available programs for naloxone, fentanyl test strips, and safer injection/smoking supplies.',
              'Consulte el portal de su estado para ver la disponibilidad de naloxona, tiras reactivas y suministros estériles.',
            ),
          ),
          h('li', null,
            strong(tr('2. Complete an anonymous request: ', '2. Complete una solicitud confidencial: ')),
            tr(
              'Enroll online with an address where you can receive mail. No government ID, insurance, or payment is required.',
              'Regístrese en línea con una dirección donde pueda recibir correspondencia. No requiere identificación gubernamental ni pago.',
            ),
          ),
          h('li', null,
            strong(tr('3. 100% Discreet shipping: ', '3. Envío totalmente discreto: ')),
            tr(
              'Packages arrive in plain brown boxes or envelopes with no references to harm reduction, drugs, or naloxone on the outside. You can ship to a home, P.O. Box, or local post office General Delivery.',
              'Los paquetes llegan en cajas o sobres comunes sin logotipos ni mención alguna de reducción de daños. Puede enviar a su domicilio, casilla postal o entrega general.',
            ),
          ),
        ),
        h('div', { class: 'actions' },
          ext('https://nextdistro.org/naloxone', tr('Order free naloxone by mail (NEXT Distro)', 'Pedir naloxona gratis por correo (NEXT Distro)'), { class: 'btn btn-primary' }),
          ext('https://nextdistro.org/', tr('Explore all NEXT Distro supply resources', 'Explorar todos los recursos de NEXT Distro'), { class: 'btn btn-secondary' }),
        ),
      ),
    ),

    section('xylazine-tranq', tr('Xylazine & medetomidine (“tranq”) overdose, withdrawal & wound care', 'Xilacina y medetomidina (“tranq”): sobredosis, abstinencia y cuidado de heridas'),
      xylazineCardSlot,
    ),

    section('never-alone', tr('Don’t use alone & hotline support', 'No consuma a solas y líneas telefónicas'),
      p(tr(
        'Most fatal overdose deaths happen when someone uses alone and no one is there to administer naloxone or call 911. If you are using alone, an operator can stay on the line with you and send emergency help only if you stop responding.',
        'La gran mayoría de muertes por sobredosis ocurren cuando no hay nadie para aplicar naloxona o llamar al 911. Si va a consumir solo, un operador puede acompañarle por teléfono y enviar ayuda de emergencia si no responde.',
      )),
      hotlineGrid(HOTLINES.substanceUse.filter((l) => l.name === 'Never Use Alone' || l.name === 'SafeSpot')),
      ul([
        tr('Use with a trusted friend, and take turns so one person is always alert.', 'Consuma acompañado y tome turnos para que una persona permanezca alerta.'),
        tr('Leave your door unlocked, or inform a neighbor or friend to check in after 10 minutes.', 'Deje la puerta sin cerrojo o pida a alguien de confianza que le llame después de 10 minutos.'),
        tr('Keep naloxone in plain sight and tell people where it is stored.', 'Guarde la naloxona en un lugar visible y avise dónde se encuentra.'),
      ]),
      p(tr('Want to map out where your naloxone is kept and who to call in a hard moment? ', '¿Desea planificar dónde guarda su naloxona y a quién contactar? '),
        h('a', { href: '#/plan' }, tr('Build a Personal Safety Plan that stays in this browser', 'Cree un Plan de Seguridad Personal en este navegador')), '.'),
    ),

    section('checking', tr('Fentanyl & xylazine test strips (Drug checking)', 'Tiras reactivas para fentanilo y xilacina'),
      testStripCalculator(),
      p(tr(
        'Fentanyl, xylazine, and medetomidine turn up frequently in counterfeit pressed pills, street powders, and stimulants. Test strips are inexpensive, fast, and available from syringe programs and vending machines.',
        'El fentanilo y la xilacina aparecen frecuentemente en pastillas prensadas falsificadas, polvos y estimulantes. Las tiras reactivas son rápidas y están disponibles en programas de jeringas y máquinas expendedoras.',
      )),
      h('div', { class: 'card how-to' },
        h('h3', null, tr('Step-by-step drug testing protocol', 'Protocolo paso a paso para análisis de sustancias')),
        h('ol', null,
          h('li', null, tr(
            'Place a small amount of the drug (at least 10 mg) or residue from a baggie in a clean, dry cup or cooker.',
            'Coloque una pequeña muestra (al menos 10 mg) o residuo en un recipiente limpio y seco.',
          )),
          h('li', null, tr(
            'Add clean water and dissolve: use about 1/2 teaspoon of water for opioids or powders, or 1 full teaspoon of water for methamphetamine or MDMA (stimulants require higher dilution to prevent false positive results).',
            'Añada agua limpia y disuelva: use ½ cucharadita para opioides/polvos, o 1 cucharadita completa para metanfetamina o MDMA (los estimulantes requieren más agua para evitar falsos positivos).',
          )),
          h('li', null, tr(
            'Dip the wavy absorption end of the strip into the liquid for 15 seconds.',
            'Sumerja la punta de absorción de la tira en el líquido durante 15 segundos.',
          )),
          h('li', null, tr(
            'Lay the strip flat on a dry surface and wait 2 to 5 minutes to read the result.',
            'Coloque la tira sobre una superficie seca y espere entre 2 y 5 minutos para leer el resultado.',
          )),
        ),
        h('ul', { class: 'result-key' },
          h('li', { class: 'result-pos' }, strong(tr('One line: Fentanyl or xylazine detected.', 'Una línea: Fentanilo o xilacina detectado.'))),
          h('li', { class: 'result-neg' }, strong(tr('Two lines: Negative (not detected).', 'Dos líneas: Negativo (no detectado).')), tr(' Even a faint second line counts as negative.', ' Incluso una segunda línea tenue cuenta como resultado negativo.')),
          h('li', null, strong(tr('No line or only a right-side line: ', 'Sin líneas o solo una línea a la derecha: ')), tr('The test strip was invalid. Retest with a fresh strip.', 'La prueba no fue válida. Repita con una tira nueva.')),
        ),
        fine(tr('Instructions may vary by manufacturer. Always review packaging guidelines.', 'Las instrucciones pueden variar según el fabricante. Revise el empaque.')),
      ),
      ul([
        [strong(tr('A negative test does not guarantee 100% safety. ', 'Un resultado negativo no garantiza seguridad total. ')), tr('Fentanyl can be unevenly distributed throughout a pill or batch ("chocolate chip cookie effect"), and strips do not detect newly emerging synthetic compounds. Always carry naloxone.', 'El fentanilo puede distribuirse de manera desigual en una pastilla o lote. Lleve siempre naloxona.')],
        [strong(tr('Xylazine test strips (XTS): ', 'Tiras para xilacina (XTS): ')), tr('Follow the exact same testing procedure and warn you if severe sedatives are present in your supply.', 'Siguen el mismo procedimiento y avisan si hay sedantes fuertes en su suministro.')],
        [strong(tr('Lab-grade confirmatory testing: ', 'Análisis de laboratorio confirmatorio: ')), tr('The ', 'El '), ext('https://www.streetsafe.supply/', 'UNC Street Drug Analysis Lab'), tr(' tests mailed samples sent through harm reduction partners and publishes anonymous results. ', ' analiza muestras anónimas. '), ext('https://dancesafe.org/', 'DanceSafe'), tr(' sells comprehensive test kits and reagent supplies.', ' ofrece kits completos de reactivos.')],
      ]),
    ),

    section('safer-use', tr('Lower your risk', 'Disminuya su riesgo'),
      ul([
        [strong(tr('Start low and go slow: ', 'Empiece con poco y vaya despacio: ')), tr('Especially with a new batch or new supplier. Try a tiny test bump or puff first.', 'Especialmente con un nuevo lote o proveedor. Pruebe una cantidad mínima primero.')],
        [strong(tr('Tolerance drops fast after any break: ', 'La tolerancia disminuye rápido tras una pausa: ')), tr('Even a few days in detox, hospital, or jail lowers opioid tolerance drastically. The highest risk of fatal overdose occurs during the first 2 weeks after discharge.', 'Incluso unos pocos días sin consumir bajan drásticamente la tolerancia. El mayor riesgo de muerte ocurre en las primeras dos semanas tras el alta.')],
        [strong(tr('Avoid mixing depressants: ', 'Evite mezclar depresores: ')), tr('Combining opioids, benzodiazepines, alcohol, or sleep aids severely impairs respiratory drive. See the combination table below.', 'Combinar opioides con benzodiacepinas o alcohol frena la respiración.')],
        [strong(tr('Alternative routes lower some risks: ', 'Cambiar la vía de administración reduce riesgos: ')), tr('Injecting carries the highest risk of overdose, abscesses, and blood-borne infections. Snorting or smoking can reduce certain infection risks.', 'Inyectar conlleva mayor riesgo de sobredosis e infecciones.')],
        [strong(tr('Stay hydrated and rest: ', 'Manténgase hidratado y descanse: ')), tr('Overheating, dehydration, and prolonged sleep deprivation from stimulants create cardiovascular emergencies.', 'La deshidratación y la falta de sueño con estimulantes generan emergencias cardíacas.')],
      ]),
    ),

    section('mixing', tr('Mixing substances', 'Combinación de sustancias'),
      p(tr(
        'Some substance combinations are exceptionally risky and sharply increase overdose hazards. This table highlights key interactions:',
        'Ciertas combinaciones de sustancias son especialmente peligrosas y multiplican el riesgo de sobredosis:',
      )),
      h('div', { class: 'table-wrap', tabindex: '0', role: 'region', 'aria-label': tr('High-risk drug combinations and why', 'Combinaciones de sustancias de alto riesgo y motivos') },
        h('table', { class: 'combo-table' },
          h('caption', { class: 'visually-hidden' }, tr('High-risk drug combinations and why', 'Combinaciones de sustancias de alto riesgo')),
          h('thead', null, h('tr', null,
            h('th', { scope: 'col' }, tr('Combination', 'Combinación')),
            h('th', { scope: 'col' }, tr('Why it is risky', 'Por qué es peligroso')),
            h('th', { scope: 'col' }, tr('Source', 'Fuente')),
          )),
          h('tbody', null, COMBOS.map((c) => h('tr', null,
            h('th', { scope: 'row' }, c.combo),
            h('td', null, c.why),
            h('td', null, ext(c.src[1], c.src[0])),
          ))),
        ),
      ),
      p(tr('For clinician and pharmacist-reviewed interactions with buprenorphine, methadone, and naltrexone, explore the ', 'Para interacciones revisadas por farmacéuticos con buprenorfina y metadona, consulte el '),
        h('a', { href: '#/medications' }, tr('Pharmacist Medication & Interaction Hub', 'Centro de Medicamentos e Interacciones')), '.'),
      fine(tr('For broader combinations, consult the community-maintained ', 'Para otras combinaciones, consulte '), ext('https://combo.tripsit.me/', 'TripSit combination chart'),
        tr('. If you are uncertain or worried, call Poison Help at ', '. Ante cualquier duda, llame a Poison Help al '), tel('18002221222', '1-800-222-1222'), tr(', free and 24/7.', ', gratuito las 24 horas.')),
    ),

    section('wounds', tr('Supplies, infections, and wound care', 'Suministros, infecciones y cuidado de heridas'),
      ul([
        [strong(tr('Use sterile supplies every single time: ', 'Use material estéril cada vez: ')), tr('Never reuse or share needles, cookers, cottons, water, pipes, or straws. This prevents HIV, hepatitis C, endocarditis, and abscesses.', 'No reutilice ni comparta jeringas, filtros, agua o pipas para prevenir VIH, hepatitis C y abscesos.')],
        [strong(tr('Syringe Services Programs (SSPs): ', 'Programas de Servicios de Jeringas (SSP): ')), tr('Provide free supplies, safe disposal boxes, naloxone, wound care kits, and confidential infectious disease testing. Find an exchange through ', 'Ofrecen suministros gratuitos, eliminación segura y pruebas de salud a través del '),
          ext('https://nasen.org/directory/', tr('NASEN directory', 'directorio de NASEN')), tr(' or your local county health department.', ' o el departamento de salud local.')],
        [strong(tr('Basic wound care protocol: ', 'Protocolo básico de curación: ')), tr('Wash gently with sterile normal saline or mild soap and clean water. Avoid hydrogen peroxide and rubbing alcohol—they damage healing tissue. Apply a thin layer of plain petroleum ointment, cover with a clean non-stick dressing, and change regularly.', 'Lave con solución salina estéril o agua y jabón suave. Evite agua oxigenada y alcohol. Aplique ungüento de vaselina y cubra con apósito antiadherente.')],
        [strong(tr('Xylazine skin ulcers: ', 'Úlceras cutáneas por xilacina: ')), tr('Can develop anywhere on the body, even away from injection sites. Trace the outer red margin with a pen and write the time to monitor spread.', 'Pueden aparecer en cualquier parte del cuerpo. Marque el borde rojo con bolígrafo para vigilar si crece.')],
      ]),
      h('div', { class: 'callout callout-warn' },
        p(strong(tr('Seek immediate medical attention for infection red flags: ', 'Busque atención médica inmediata ante señales de alarma: ')),
          tr(
            'High fever or chills, rapidly spreading redness or red streaks moving toward the chest, foul-smelling drainage, black or leathery necrotic tissue, severe throbbing pain, confusion, or exposed tendon or bone. ',
            'Fiebre alta, escalofríos, líneas rojas que avanzan hacia el pecho, mal olor, tejido negro necrosado, dolor intenso o hueso/tendón expuesto. ',
          ),
          h('a', { href: '#/health?tab=clinics' }, tr('Find a low-cost community health center', 'Buscar un centro de salud comunitario')), '.'),
      ),
      fine(tr('Clinical wound care guidance adapted from CDC and harm reduction public health recommendations.', 'Guía clínica de curación adaptada de recomendaciones del CDC y de salud pública.')),
    ),

    section('rights', tr('Good Samaritan overdose legal protections & your rights', 'Leyes de protección del Buen Samaritano y sus derechos'),
      p(tr(
        'Fear of arrest should never prevent anyone from calling 911 during an overdose. Over 48 states, Washington D.C., and federal guidelines provide statutory Good Samaritan protections for people seeking emergency assistance.',
        'El temor a la policía nunca debe impedir llamar al 911 ante una sobredosis. Más de 48 estados, Washington D.C. y guías federales otorgan protección del Buen Samaritano al pedir auxilio.',
      )),
      h('div', { class: 'card good-samaritan-summary-card', id: 'good-samaritan-guide' },
        h('h3', null, icon('shield'), ' ', tr('Step-by-step Good Samaritan protections overview', 'Resumen paso a paso de las protecciones del Buen Samaritano')),
        h('ol', { class: 'steps' },
          GOOD_SAMARITAN_STEPS.map((stepItem) => h('li', { class: 'step', id: `samaritan-step-${stepItem.id}` },
            h('span', { class: 'step-num', 'aria-hidden': 'true' }, String(stepItem.step)),
            h('div', { class: 'step-body' },
              h('h4', null, isEs ? stepItem.titleEs : stepItem.title),
              p(isEs ? stepItem.detailEs : stepItem.detail),
            ),
          )),
        ),
        h('div', { class: 'actions' },
          ext('https://lawatlas.org/datasets/good-samaritan-overdose-prevention-laws', tr('LawAtlas 50-State Good Samaritan Law Tracker', 'Rastreador de leyes de Buen Samaritano en LawAtlas'), { class: 'btn btn-secondary btn-small' }),
          ext('https://endoverdose.net/toolkit/', tr('End Overdose State Legal Toolkit', 'Guía legal por estado de End Overdose'), { class: 'btn btn-secondary btn-small' }),
          h('a', { class: 'btn btn-primary btn-small', href: '#/states' }, icon('pin'), tr('Explore resources in your state or territory', 'Ver recursos de su estado o territorio')),
        ),
      ),
      ul([
        [strong(tr('Naloxone possession and distribution: ', 'Posesión y distribución de naloxona: ')), tr('Every state permits carrying and administering naloxone without a personal prescription under statewide standing orders.', 'Todos los estados permiten portar y administrar naloxona sin receta individual.')],
        [strong(tr('Drug paraphernalia and test strips: ', 'Tiras reactivas y parafernalia: ')), tr('Most states have updated laws to officially decriminalize fentanyl and xylazine test strips.', 'La gran mayoría de los estados ha despenalizado las tiras reactivas.')],
        [strong(tr('Federal treatment confidentiality (42 CFR Part 2): ', 'Privacidad federal de tratamiento (42 CFR Parte 2): ')), tr('Records from federally assisted substance use treatment programs are protected by strict privacy laws and cannot be shared without your written consent or used against you in court proceedings without a specialized warrant. ', 'Los registros de tratamiento están protegidos por estrictas normas de confidencialidad médica. '),
          h('a', { href: '#/plan' }, tr('Learn more about treatment privacy rights', 'Más sobre derechos de privacidad'))],
      ]),
    ),

    section('more', tr('More harm reduction & clinical tools', 'Más herramientas clínicas y recursos'),
      p(
        h('a', { class: 'btn btn-secondary btn-small', href: '#/plan' }, tr('Build a Personal Safety Plan', 'Crear Plan de Seguridad Personal')),
        ' ',
        h('a', { class: 'btn btn-secondary btn-small', href: '#/medications' }, tr('Medication & Interaction Hub', 'Centro de Medicamentos')),
        ' ',
        h('a', { class: 'btn btn-secondary btn-small', href: '#/navigator' }, tr('ASAM Care Navigator', 'Navegador de Atención ASAM')),
        ' ',
        h('a', { class: 'btn btn-secondary btn-small', href: '#/states' }, tr('State Resources Directory', 'Directorio de Recursos Estatales')),
      ),
      resourceList([
        { name: 'National Harm Reduction Coalition', href: 'https://harmreduction.org/', desc: tr('Guides, community organizing, and foundational harm reduction principles.', 'Guías y principios fundamentales de reducción de daños.') },
        { name: 'SAMHSA Overdose Prevention and Response Toolkit', href: 'https://library.samhsa.gov/product/overdose-prevention-response-toolkit/pep23-03-00-001', desc: tr('Free federal guidance for individuals, families, first responders, and prescribers.', 'Guía federal gratuita para personas, familias y socorristas.') },
        { name: 'NEXT Distro', href: 'https://nextdistro.org/', desc: tr('Mail-based harm reduction supply delivery and state-by-state resource directory.', 'Distribución de suministros por correo y directorio de recursos por estado.') },
        { name: 'North American Syringe Exchange Network (NASEN)', href: 'https://nasen.org/', desc: tr('Comprehensive national directory of syringe services programs and harm reduction buyers club.', 'Directorio nacional de programas de jeringas e insumos.') },
      ]),
    ),
  );
}

export {
  testStripCalculator,
  getTestStripState,
  resetTestStripState,
  calculateDilutionRatio,
  DILUTION_PROTOCOLS,
  TEST_STRIP_INTERPRETATIONS,
};
