import { h, clear, copyText } from '../dom.js';
import { t, getLang } from '../i18n.js';

function el(tag, opts = {}, ...children) {
  const { className, attrs, ...rest } = opts || {};
  const props = { ...rest };
  if (className) props.class = className;
  if (attrs) Object.assign(props, attrs);
  return h(tag, props, ...children);
}

function makeButton(label, onClick, opts = {}) {
  const { className = 'button', ariaPressed, ...rest } = opts;
  const props = { type: 'button', class: className, onclick: onClick, ...rest };
  if (ariaPressed !== undefined) props['aria-pressed'] = ariaPressed;
  return h('button', props, label);
}

function makeLinkButton(label, href, opts = {}) {
  const { className = 'button secondary', ...rest } = opts;
  return h('a', { href, class: className, ...rest }, label);
}

export const POISON_CONTROL_NUMBER = '1-800-222-1222';

export const PEDIATRIC_SYNDROME_PROFILES = Object.freeze({
  buprenorphine_methadone_ingestion: Object.freeze({
    id: 'buprenorphine_methadone_ingestion',
    urgency: 'EMERGENCY',
    badgeEn: 'ANY CHILD INGESTION = ER EVALUATION + EXTENDED OBSERVATION',
    badgeEs: 'TODA INGESTIÓN INFANTIL = URGENCIAS + OBSERVACIÓN PROLONGADA',
    titleEn: 'Toddler Ingestion of Buprenorphine Film/Tablet or Methadone',
    titleEs: 'Ingestión de Película/Tableta de Buprenorfina o Metadona por un Niño Pequeño',
    summaryEn:
      'A single buprenorphine film or a small amount of methadone can cause life-threatening breathing depression in a young child who has no opioid tolerance. Symptoms can be delayed, so every ingestion needs emergency evaluation even if the child looks fine.',
    summaryEs:
      'Una sola película de buprenorfina o una pequeña cantidad de metadona puede causar depresión respiratoria grave en un niño pequeño sin tolerancia a opioides. Los síntomas pueden tardar, por eso toda ingestión requiere evaluación de urgencia aunque el niño parezca estar bien.',
    pathophysiologyEn:
      'Children have no opioid tolerance. Buprenorphine is absorbed through the mouth lining, has a long duration of action, and its ceiling effect on breathing seen in tolerant adults does NOT reliably protect an opioid-naive toddler. Methadone has a long and variable half-life, so sedation and slowed breathing can appear or recur many hours after ingestion—well after a single naloxone dose wears off.',
    pathophysiologyEs:
      'Los niños no tienen tolerancia a opioides. La buprenorfina se absorbe por la mucosa oral y actúa por mucho tiempo; el "efecto techo" respiratorio de los adultos tolerantes NO protege de forma confiable a un niño. La metadona tiene una vida media larga y variable, por lo que la sedación y la respiración lenta pueden aparecer o reaparecer muchas horas después, cuando ya pasó el efecto de una dosis de naloxona.',
    diagnosticsEn: [
      'Look for: unusual sleepiness, difficulty waking, slow or shallow breathing, pinpoint pupils, blue or gray lips, limpness, or vomiting.',
      'Clinicians: continuous pulse oximetry and capnography where available; observation is commonly extended (often at least 24 hours for buprenorphine or methadone in young children)—follow Poison Control and local pediatric toxicology guidance.'
    ],
    diagnosticsEs: [
      'Observe: somnolencia inusual, dificultad para despertar, respiración lenta o superficial, pupilas puntiformes, labios azules o grises, flacidez o vómito.',
      'Personal clínico: oximetría de pulso continua y capnografía si está disponible; la observación suele prolongarse (a menudo al menos 24 horas para buprenorfina o metadona en niños pequeños) según Toxicología/Centro de Toxicología local.'
    ],
    managementEn: [
      'If the child is not breathing normally or will not wake: call 911, give naloxone (the same nasal spray used for adults is appropriate for children), and give rescue breaths. Naloxone may need to be repeated.',
      'If the child seems fine: call Poison Control (1-800-222-1222, free, 24/7) right away and go to the emergency department—do not wait for symptoms. Bring the medication package.',
      'Do not induce vomiting. Remove any remaining film or tablet pieces from the mouth if you can do so safely.'
    ],
    managementEs: [
      'Si el niño no respira con normalidad o no despierta: llame al 911, administre naloxona (el mismo aerosol nasal de adultos es adecuado para niños) y dé respiraciones de rescate. Puede ser necesario repetir la naloxona.',
      'Si el niño parece estar bien: llame de inmediato al Centro de Toxicología (1-800-222-1222, gratis, 24/7) y acuda a urgencias; no espere a que aparezcan síntomas. Lleve el empaque del medicamento.',
      'No provoque el vómito. Retire con cuidado los restos de película o tableta de la boca si es seguro hacerlo.'
    ],
    harmReductionEn:
      'Keep buprenorphine and methadone in a locked box, never in a purse, bag, or nightstand. Take doses out of sight of children, and never refer to medicine as candy. Families on MOUD deserve support, not shame—safe storage protects both the child and your treatment.',
    harmReductionEs:
      'Guarde la buprenorfina y la metadona en una caja con llave, nunca en el bolso, mochila o mesa de noche. Tome sus dosis lejos de la vista de los niños y nunca diga que la medicina es un dulce. Las familias en tratamiento merecen apoyo, no vergüenza: guardar con seguridad protege al niño y a su tratamiento.'
  }),

  illicit_opioid_fentanyl_exposure: Object.freeze({
    id: 'illicit_opioid_fentanyl_exposure',
    urgency: 'EMERGENCY',
    badgeEn: 'INGESTION IS THE DANGER — BRIEF SKIN CONTACT IS NOT',
    badgeEs: 'EL PELIGRO ES LA INGESTIÓN, NO EL CONTACTO BREVE CON LA PIEL',
    titleEn: 'Child Exposure to Fentanyl Powder, Counterfeit Pills, or Other Illicit Opioids',
    titleEs: 'Exposición Infantil a Fentanilo en Polvo, Pastillas Falsificadas u Otros Opioides Ilícitos',
    summaryEn:
      'Young children explore by putting things in their mouths. Counterfeit pills and powders found on floors, in pockets, or in cars are a leading cause of pediatric opioid deaths. Fast recognition and naloxone save lives.',
    summaryEs:
      'Los niños pequeños exploran llevándose objetos a la boca. Las pastillas falsificadas y los polvos encontrados en el piso, bolsillos o autos son una causa principal de muertes infantiles por opioides. Reconocerlo rápido y usar naloxona salva vidas.',
    pathophysiologyEn:
      'Swallowing or mouthing even a fraction of a counterfeit "M30" pill can contain enough fentanyl to stop a toddler’s breathing. Toxicology societies (ACMT and AACT) have stated that brief incidental skin contact with fentanyl is very unlikely to cause overdose—so fear of touching a child should never delay rescue.',
    pathophysiologyEs:
      'Tragar o chupar incluso una fracción de una pastilla falsificada "M30" puede contener suficiente fentanilo para detener la respiración de un niño. Las sociedades de toxicología (ACMT y AACT) han indicado que el contacto breve e incidental con la piel es muy poco probable que cause sobredosis, así que el miedo a tocar al niño nunca debe retrasar el rescate.',
    diagnosticsEn: [
      'Sudden sleepiness, slow breathing, snoring or gurgling sounds, pinpoint pupils, blue lips, or a limp child with no clear cause—especially if pills or powder could have been within reach.',
      'Clinicians: standard urine drug screens often do NOT detect fentanyl; request a fentanyl-specific assay. Consider evaluation for other children in the same environment.'
    ],
    diagnosticsEs: [
      'Somnolencia repentina, respiración lenta, ronquidos o gorgoteo, pupilas puntiformes, labios azules o un niño flácido sin causa clara, sobre todo si había pastillas o polvo a su alcance.',
      'Personal clínico: los análisis de orina estándar muchas veces NO detectan fentanilo; solicite una prueba específica. Considere evaluar a otros niños del mismo entorno.'
    ],
    managementEn: [
      'Call 911 immediately. Give naloxone right away—do not wait for confirmation—and repeat every 2–3 minutes if there is no response and more doses are available.',
      'Give rescue breaths if the child is not breathing (infants: cover mouth and nose; children: pinch nose). Start CPR if there is no pulse or no signs of life.',
      'Place a breathing child on their side (recovery position) and stay with them until help arrives. Children often need hospital observation because the effects can outlast naloxone.'
    ],
    managementEs: [
      'Llame de inmediato al 911. Administre naloxona sin esperar confirmación y repítala cada 2–3 minutos si no hay respuesta y tiene más dosis.',
      'Dé respiraciones de rescate si el niño no respira (bebés: cubra boca y nariz; niños: tape la nariz). Inicie RCP si no hay pulso ni signos de vida.',
      'Coloque de lado (posición de recuperación) al niño que respira y quédese con él hasta que llegue ayuda. Los niños suelen necesitar observación hospitalaria porque el efecto puede durar más que la naloxona.'
    ],
    harmReductionEn:
      'Keep naloxone in every home, car, and diaper bag where drugs or opioid medicines may be present. Good Samaritan laws in most states protect people who call 911 for an overdose—check your state’s protections.',
    harmReductionEs:
      'Tenga naloxona en cada hogar, auto y pañalera donde pueda haber drogas o medicamentos opioides. En la mayoría de los estados, las leyes del Buen Samaritano protegen a quien llama al 911 por una sobredosis; consulte las protecciones de su estado.'
  }),

  cannabis_edible_ingestion: Object.freeze({
    id: 'cannabis_edible_ingestion',
    urgency: 'URGENT',
    badgeEn: 'EDIBLES LOOK LIKE CANDY — DELAYED, PROLONGED EFFECTS IN CHILDREN',
    badgeEs: 'LOS COMESTIBLES PARECEN DULCES: EFECTOS TARDÍOS Y PROLONGADOS EN NIÑOS',
    titleEn: 'Pediatric Cannabis (THC) Edible Ingestion',
    titleEs: 'Ingestión Pediátrica de Comestibles con Cannabis (THC)',
    summaryEn:
      'Pediatric cannabis edible exposures have risen sharply. Gummies, chocolates, and cookies can contain many times a safe adult dose, and children can become very drowsy, unsteady, or—rarely—have seizures or trouble breathing.',
    summaryEs:
      'Las exposiciones infantiles a comestibles de cannabis han aumentado mucho. Gomitas, chocolates y galletas pueden contener varias veces la dosis de un adulto y los niños pueden presentar mucha somnolencia, inestabilidad o, rara vez, convulsiones o dificultad para respirar.',
    pathophysiologyEn:
      'THC from edibles is absorbed slowly through the gut and converted by the liver into an active metabolite, so symptoms may start 30 minutes to several hours after eating and can last many hours. Children are much more sensitive per kilogram of body weight than adults.',
    pathophysiologyEs:
      'El THC de los comestibles se absorbe lentamente en el intestino y el hígado lo transforma en un metabolito activo, por lo que los síntomas pueden empezar de 30 minutos a varias horas después y durar muchas horas. Los niños son mucho más sensibles por kilogramo de peso que los adultos.',
    diagnosticsEn: [
      'Sleepiness, poor balance or wobbly walking, dilated eyes, fast heart rate, unusual behavior, vomiting; in severe cases very deep sleep, slowed breathing, or seizures.',
      'Clinicians: assess airway and breathing first, check glucose, and consider co-ingestants. Naloxone does not reverse THC, but it is reasonable to give if opioid exposure cannot be excluded.'
    ],
    diagnosticsEs: [
      'Somnolencia, falta de equilibrio, pupilas dilatadas, frecuencia cardíaca rápida, conducta inusual, vómito; en casos graves, sueño muy profundo, respiración lenta o convulsiones.',
      'Personal clínico: evaluar primero vía aérea y respiración, medir glucosa y considerar otras sustancias. La naloxona no revierte el THC, pero es razonable administrarla si no se puede descartar un opioide.'
    ],
    managementEn: [
      'Call Poison Control (1-800-222-1222) right away for guidance, even if the child seems okay. Call 911 if the child is hard to wake, has trouble breathing, or has a seizure.',
      'Most children recover with supportive hospital care and observation; very young children and large ingestions are more likely to need admission.',
      'Bring the package so clinicians can estimate the THC dose (mg per piece).'
    ],
    managementEs: [
      'Llame de inmediato al Centro de Toxicología (1-800-222-1222), aunque el niño parezca estar bien. Llame al 911 si es difícil despertarlo, tiene dificultad para respirar o convulsiona.',
      'La mayoría de los niños se recupera con atención de soporte y observación en el hospital; los más pequeños y las ingestiones grandes suelen requerir hospitalización.',
      'Lleve el empaque para que el equipo médico calcule la dosis de THC (mg por pieza).'
    ],
    harmReductionEn:
      'Store edibles in their original child-resistant packaging inside a locked container, out of reach and out of sight—separate from regular snacks. Never describe edibles as candy around children.',
    harmReductionEs:
      'Guarde los comestibles en su empaque original a prueba de niños dentro de un recipiente con llave, fuera del alcance y de la vista, separados de los bocadillos comunes. Nunca los describa como dulces frente a los niños.'
  }),

  nicotine_eliquid_pouch_ingestion: Object.freeze({
    id: 'nicotine_eliquid_pouch_ingestion',
    urgency: 'URGENT',
    badgeEn: 'CONCENTRATED E-LIQUID CAN BE DANGEROUS — CALL POISON CONTROL',
    badgeEs: 'EL LÍQUIDO CONCENTRADO PUEDE SER PELIGROSO: LLAME A TOXICOLOGÍA',
    titleEn: 'Nicotine E-Liquid, Vape Pod, Pouch, Gum, or Cigarette Ingestion',
    titleEs: 'Ingestión de Líquido de Vapeo, Cápsula, Bolsita, Chicle de Nicotina o Cigarrillo',
    summaryEn:
      'Nicotine is toxic to small children. Concentrated e-liquid refills and nicotine salt pods are the most dangerous; pouches, gum, lozenges, and cigarette butts can also cause symptoms.',
    summaryEs:
      'La nicotina es tóxica para los niños pequeños. Los recambios de líquido concentrado y las cápsulas de sales de nicotina son los más peligrosos; las bolsitas, chicles, pastillas y colillas también pueden causar síntomas.',
    pathophysiologyEn:
      'Nicotine first stimulates and then can block nicotinic receptors. Early symptoms include vomiting, drooling, sweating, fast heart rate, and agitation; large exposures can progress to weakness, seizures, slowed breathing, and low blood pressure. Liquid nicotine can also be absorbed through the skin and eyes.',
    pathophysiologyEs:
      'La nicotina primero estimula y luego puede bloquear los receptores nicotínicos. Los síntomas iniciales son vómito, salivación, sudoración, taquicardia y agitación; las exposiciones grandes pueden causar debilidad, convulsiones, respiración lenta y presión baja. El líquido también se absorbe por la piel y los ojos.',
    diagnosticsEn: [
      'Vomiting soon after exposure is common and is an important warning sign. Watch for drowsiness, weakness, shaking, or seizures.',
      'Clinicians: estimate the nicotine dose from product concentration (mg/mL) and volume; symptoms usually begin within the first hour.'
    ],
    diagnosticsEs: [
      'El vómito poco después de la exposición es frecuente y es una señal de alerta importante. Vigile somnolencia, debilidad, temblores o convulsiones.',
      'Personal clínico: estimar la dosis de nicotina según la concentración (mg/mL) y el volumen; los síntomas suelen iniciar en la primera hora.'
    ],
    managementEn: [
      'Call Poison Control (1-800-222-1222) right away. Call 911 for seizures, trouble breathing, or a child who is hard to wake.',
      'For skin contact with e-liquid: remove contaminated clothing and wash the skin with soap and water. For eye exposure: rinse with lukewarm water for 15 minutes.',
      'Do not induce vomiting.'
    ],
    managementEs: [
      'Llame de inmediato al Centro de Toxicología (1-800-222-1222). Llame al 911 si hay convulsiones, dificultad para respirar o el niño no despierta con facilidad.',
      'Si el líquido tocó la piel: quite la ropa contaminada y lave con agua y jabón. Si cayó en los ojos: enjuague con agua tibia durante 15 minutos.',
      'No provoque el vómito.'
    ],
    harmReductionEn:
      'Keep refills, pods, and pouches locked up and away from children, and dispose of used pods and pouches in a closed container. If you want help quitting, see the tobacco and nicotine cessation guide.',
    harmReductionEs:
      'Guarde con llave los recambios, cápsulas y bolsitas lejos de los niños y deseche las usadas en un recipiente cerrado. Si quiere ayuda para dejar la nicotina, consulte la guía para dejar el tabaco y la nicotina.'
  }),

  clonidine_alpha2_xylazine_exposure: Object.freeze({
    id: 'clonidine_alpha2_xylazine_exposure',
    urgency: 'EMERGENCY',
    badgeEn: 'ALPHA-2 TOXICITY MIMICS OPIOID OVERDOSE — NALOXONE MAY ONLY PARTLY HELP',
    badgeEs: 'LA TOXICIDAD ALFA-2 SIMULA SOBREDOSIS DE OPIOIDES: LA NALOXONA AYUDA SOLO EN PARTE',
    titleEn: 'Clonidine, Guanfacine, Tizanidine, or Xylazine ("Tranq") Exposure in a Child',
    titleEs: 'Exposición Infantil a Clonidina, Guanfacina, Tizanidina o Xilacina ("Tranq")',
    summaryEn:
      'Clonidine and guanfacine are common in homes (ADHD, blood pressure, opioid withdrawal) and a single tablet can seriously affect a toddler. Xylazine contaminates much of the illicit fentanyl supply in some regions.',
    summaryEs:
      'La clonidina y la guanfacina son comunes en los hogares (TDAH, presión arterial, abstinencia de opioides) y una sola tableta puede afectar gravemente a un niño pequeño. La xilacina contamina gran parte del fentanilo ilícito en algunas regiones.',
    pathophysiologyEn:
      'Alpha-2 agonists reduce sympathetic outflow from the brain, causing deep sedation, pinpoint pupils, slow heart rate, low blood pressure, low body temperature, and pauses in breathing—closely resembling opioid overdose. Naloxone does not reliably reverse alpha-2 effects, though it is still given because opioids are often present too.',
    pathophysiologyEs:
      'Los agonistas alfa-2 reducen la actividad simpática del cerebro y causan sedación profunda, pupilas puntiformes, frecuencia cardíaca lenta, presión baja, hipotermia y pausas respiratorias, muy parecido a una sobredosis de opioides. La naloxona no revierte de forma confiable estos efectos, aunque se administra porque a menudo también hay opioides.',
    diagnosticsEn: [
      'Very sleepy child with small pupils, slow pulse, cool skin, or pauses in breathing—especially if clonidine, guanfacine, or tizanidine is in the home.',
      'Clinicians: cardiac monitoring for bradycardia and hypotension; observation is typically needed because effects can be prolonged with extended-release formulations.'
    ],
    diagnosticsEs: [
      'Niño muy somnoliento con pupilas pequeñas, pulso lento, piel fría o pausas al respirar, sobre todo si hay clonidina, guanfacina o tizanidina en casa.',
      'Personal clínico: monitoreo cardíaco por bradicardia e hipotensión; suele requerirse observación porque los efectos pueden prolongarse con formulaciones de liberación prolongada.'
    ],
    managementEn: [
      'Call 911 for any child who is hard to wake or breathing poorly. Give naloxone anyway—an opioid may also be involved—and provide rescue breaths.',
      'For any known or suspected ingestion in a well-appearing child, call Poison Control (1-800-222-1222) and go to the emergency department.',
      'Keep the child warm while waiting for help.'
    ],
    managementEs: [
      'Llame al 911 si el niño no despierta con facilidad o respira mal. Administre naloxona de todos modos (puede haber también un opioide) y dé respiraciones de rescate.',
      'Ante cualquier ingestión conocida o sospechada en un niño que parece bien, llame al Centro de Toxicología (1-800-222-1222) y acuda a urgencias.',
      'Mantenga al niño abrigado mientras llega la ayuda.'
    ],
    harmReductionEn:
      'Clonidine prescribed for withdrawal or ADHD needs the same locked storage as opioids. Ask your pharmacist for child-resistant packaging and dispose of leftover tablets at a pharmacy take-back kiosk.',
    harmReductionEs:
      'La clonidina recetada para abstinencia o TDAH necesita el mismo almacenamiento con llave que los opioides. Pida al farmacéutico envases a prueba de niños y deseche las tabletas sobrantes en un punto de devolución de la farmacia.'
  }),

  safe_storage_plan_of_safe_care: Object.freeze({
    id: 'safe_storage_plan_of_safe_care',
    urgency: 'ROUTINE',
    badgeEn: 'LOCK IT UP + NALOXONE ON HAND + NON-PUNITIVE FAMILY SUPPORT',
    badgeEs: 'GUARDAR CON LLAVE + NALOXONA A MANO + APOYO FAMILIAR SIN CASTIGO',
    titleEn: 'Household Safe Storage, Naloxone Readiness & Family Plan of Safe Care',
    titleEs: 'Almacenamiento Seguro en el Hogar, Naloxona Lista y Plan Familiar de Cuidado Seguro',
    summaryEn:
      'Practical, judgment-free prevention for any home with medicines, cannabis, nicotine, or drugs—including families in recovery or on MOUD.',
    summaryEs:
      'Prevención práctica y sin juicios para cualquier hogar con medicamentos, cannabis, nicotina o drogas, incluyendo familias en recuperación o en tratamiento con MOUD.',
    pathophysiologyEn:
      'Most pediatric exposures happen at home, within seconds, when a product is left within reach—often during routine changes such as visits, travel, holidays, or moves. Locked storage and a ready plan prevent most of these events.',
    pathophysiologyEs:
      'La mayoría de las exposiciones infantiles ocurren en casa, en segundos, cuando un producto queda al alcance, a menudo durante cambios de rutina como visitas, viajes, fiestas o mudanzas. Guardar con llave y tener un plan listo previene la mayoría de estos eventos.',
    diagnosticsEn: [
      'Walk-through check: purses, coat pockets, nightstands, cars, counters, and guests’ bags are the most common sources.',
      'Confirm every caregiver knows where naloxone is kept and how to use it, and has Poison Control (1-800-222-1222) saved in their phone.'
    ],
    diagnosticsEs: [
      'Revisión del hogar: bolsos, bolsillos de abrigos, mesas de noche, autos, mostradores y bolsos de visitas son las fuentes más comunes.',
      'Confirme que todos los cuidadores saben dónde está la naloxona y cómo usarla, y tienen guardado el número del Centro de Toxicología (1-800-222-1222).'
    ],
    managementEn: [
      'Use a lockbox or locking bag for MOUD, other medicines, cannabis, and nicotine products. Keep naloxone unlocked and easy to reach.',
      'Dispose of unused medicines at pharmacy take-back kiosks or with drug deactivation pouches.',
      'For newborns with prenatal substance exposure, a CAPTA Plan of Safe Care documents supports and services for the family; prescribed MOUD is medical treatment, and families can ask social workers what any report means in their state.'
    ],
    managementEs: [
      'Use una caja o bolsa con llave para el MOUD, otros medicamentos, cannabis y productos de nicotina. Mantenga la naloxona sin llave y fácil de alcanzar.',
      'Deseche los medicamentos sin usar en puntos de devolución de farmacias o con bolsas desactivadoras de fármacos.',
      'Para recién nacidos con exposición prenatal, el Plan de Cuidado Seguro (CAPTA) documenta los apoyos y servicios para la familia; el MOUD recetado es un tratamiento médico y las familias pueden preguntar al trabajador social qué implica cualquier reporte en su estado.'
    ],
    harmReductionEn:
      'Accidents happen in loving homes. Calling 911 or Poison Control quickly is always the right choice, and seeking help is a sign of good parenting—not a failure.',
    harmReductionEs:
      'Los accidentes ocurren en hogares amorosos. Llamar rápido al 911 o al Centro de Toxicología siempre es lo correcto, y pedir ayuda es señal de buena crianza, no un fracaso.'
  })
});

export const PEDIATRIC_HARM_REDUCTION_RULES = Object.freeze([
  Object.freeze({
    id: 'any_moud_ingestion_er_rule',
    titleEn: 'Any Child Ingestion of Buprenorphine or Methadone Needs the Emergency Department',
    titleEs: 'Toda Ingestión Infantil de Buprenorfina o Metadona Requiere Urgencias',
    bodyEn:
      'Even if the child looks normal, symptoms can be delayed for hours. Call Poison Control (1-800-222-1222) and go to the emergency department; call 911 for any breathing problem.',
    bodyEs:
      'Aunque el niño se vea normal, los síntomas pueden tardar horas. Llame al Centro de Toxicología (1-800-222-1222) y acuda a urgencias; llame al 911 ante cualquier problema respiratorio.'
  }),
  Object.freeze({
    id: 'naloxone_same_dose_children_rule',
    titleEn: 'Naloxone Is Safe for Children — Use the Same Nasal Spray and Repeat If Needed',
    titleEs: 'La Naloxona Es Segura para Niños: Use el Mismo Aerosol Nasal y Repita si es Necesario',
    bodyEn:
      'Standard over-the-counter naloxone nasal spray can be given to infants and children. If there is no response in 2–3 minutes, give another dose and continue rescue breaths.',
    bodyEs:
      'El aerosol nasal de naloxona de venta libre se puede administrar a bebés y niños. Si no hay respuesta en 2–3 minutos, dé otra dosis y continúe las respiraciones de rescate.'
  }),
  Object.freeze({
    id: 'skin_contact_myth_rule',
    titleEn: 'Never Delay Rescue Over Fear of Touching Fentanyl',
    titleEs: 'Nunca Retrase el Rescate por Miedo a Tocar Fentanilo',
    bodyEn:
      'Toxicology experts (ACMT/AACT) report that brief incidental skin contact is very unlikely to cause overdose. Pick up the child, give naloxone, and breathe for them; wash your hands afterward.',
    bodyEs:
      'Los expertos en toxicología (ACMT/AACT) indican que el contacto breve e incidental con la piel es muy poco probable que cause sobredosis. Cargue al niño, administre naloxona y respire por él; lávese las manos después.'
  }),
  Object.freeze({
    id: 'no_induced_vomiting_rule',
    titleEn: 'Do Not Induce Vomiting — Call Poison Control First',
    titleEs: 'No Provoque el Vómito: Llame Primero al Centro de Toxicología',
    bodyEn:
      'Inducing vomiting (including syrup of ipecac or salt water) is not recommended and can cause choking. Call 1-800-222-1222 for free, confidential expert advice 24/7.',
    bodyEs:
      'Provocar el vómito (incluido jarabe de ipecacuana o agua con sal) no se recomienda y puede causar asfixia. Llame al 1-800-222-1222 para recibir orientación experta gratuita y confidencial 24/7.'
  }),
  Object.freeze({
    id: 'lock_it_up_rule',
    titleEn: 'Lock Up MOUD, Clonidine, Edibles & Nicotine — Keep Naloxone Unlocked',
    titleEs: 'Guarde con Llave MOUD, Clonidina, Comestibles y Nicotina; Deje la Naloxona sin Llave',
    bodyEn:
      'A lockbox for medicines and cannabis, plus naloxone stored where any adult can grab it, is the simplest way to protect children while staying on treatment.',
    bodyEs:
      'Una caja con llave para medicamentos y cannabis, y la naloxona en un lugar donde cualquier adulto pueda tomarla, es la forma más sencilla de proteger a los niños sin dejar el tratamiento.'
  }),
  Object.freeze({
    id: 'plan_of_safe_care_support_rule',
    titleEn: 'Family Support & Plan of Safe Care — Harm Reduction Over Stigma',
    titleEs: 'Apoyo Familiar y Plan de Cuidado Seguro: Reducción de Daños sin Estigma',
    bodyEn:
      'Seeking medical attention for accidental exposure is an act of protective parenting. Engage multidisciplinary family support navigators, social work, and pediatric care teams non-punitively.',
    bodyEs:
      'Buscar atención médica ante una exposición accidental es un acto de protección parental. Involucre apoyo familiar multidisciplinario, trabajo social y equipos pediátricos sin fines punitivos.'
  })
]);

const DEFAULT_PEDIATRIC_STATE = Object.freeze({
  selectedSyndrome: 'buprenorphine_methadone_ingestion',
  childNotBreathingOrUnresponsive: false,
  moudOrMethadoneIngestionWellAppearing: false,
  counterfeitPillOrPowderAccess: false,
  edibleCannabisIngestion: false,
  nicotineLiquidOrPouchIngestion: false,
  clonidineGuanfacineInHome: false,
  clinicalNotes: ''
});

let pediatricState = { ...DEFAULT_PEDIATRIC_STATE };
const listeners = new Set();

export function getPediatricState() {
  return { ...pediatricState };
}

export function setPediatricState(patch = {}) {
  pediatricState = { ...pediatricState, ...patch };
  for (const fn of listeners) fn(getPediatricState());
  return getPediatricState();
}

export function resetPediatricState() {
  pediatricState = { ...DEFAULT_PEDIATRIC_STATE };
  for (const fn of listeners) fn(getPediatricState());
  return getPediatricState();
}

export function subscribePediatricState(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function evaluatePediatricRisk(state = pediatricState, langOverride = getLang()) {
  const lang = langOverride || getLang();
  const isEs = lang === 'es';
  const profile =
    PEDIATRIC_SYNDROME_PROFILES[state.selectedSyndrome] ||
    PEDIATRIC_SYNDROME_PROFILES.buprenorphine_methadone_ingestion;

  const redFlags = [];
  let urgency = profile.urgency;
  const raise = (level) => {
    if (level === 'EMERGENCY' || (level === 'URGENT' && urgency === 'ROUTINE')) urgency = level;
  };

  if (state.childNotBreathingOrUnresponsive) {
    raise('EMERGENCY');
    redFlags.push(isEs
      ? 'NIÑO QUE NO RESPIRA BIEN O NO DESPIERTA: Llame al 911 AHORA, administre naloxona (repita cada 2–3 minutos si no responde) y dé respiraciones de rescate. Inicie RCP si no hay signos de vida.'
      : 'CHILD NOT BREATHING NORMALLY OR WILL NOT WAKE: Call 911 NOW, give naloxone (repeat every 2–3 minutes if no response), and give rescue breaths. Start CPR if there are no signs of life.');
  }
  if (state.moudOrMethadoneIngestionWellAppearing) {
    raise('EMERGENCY');
    redFlags.push(isEs
      ? 'INGESTIÓN DE BUPRENORFINA O METADONA: Aunque el niño parezca bien, llame al Centro de Toxicología (1-800-222-1222) y acuda a urgencias de inmediato; los síntomas pueden tardar horas y suele requerirse observación prolongada.'
      : 'BUPRENORPHINE OR METHADONE INGESTION: Even if the child looks well, call Poison Control (1-800-222-1222) and go to the emergency department now; symptoms can be delayed for hours and extended observation is usually needed.');
  }
  if (state.counterfeitPillOrPowderAccess) {
    raise('EMERGENCY');
    redFlags.push(isEs
      ? 'POSIBLE ACCESO A PASTILLAS FALSIFICADAS O POLVO (FENTANILO): Vigile somnolencia o respiración lenta; tenga naloxona lista y llame al 911 ante cualquier síntoma. El análisis de orina estándar puede no detectar fentanilo.'
      : 'POSSIBLE ACCESS TO COUNTERFEIT PILLS OR POWDER (FENTANYL): Watch for sleepiness or slow breathing; keep naloxone ready and call 911 for any symptoms. Standard urine screens may miss fentanyl.');
  }
  if (state.clonidineGuanfacineInHome) {
    raise('URGENT');
    redFlags.push(isEs
      ? 'CLONIDINA / GUANFACINA / XILACINA: La toxicidad alfa-2 simula sobredosis de opioides (pupilas pequeñas, pulso lento, presión baja). Administre naloxona si hay depresión respiratoria y acuda a urgencias; la naloxona puede ayudar solo parcialmente.'
      : 'CLONIDINE / GUANFACINE / XYLAZINE: Alpha-2 toxicity mimics opioid overdose (small pupils, slow pulse, low blood pressure). Give naloxone for breathing problems and go to the emergency department; naloxone may only partly help.');
  }
  if (state.edibleCannabisIngestion) {
    raise('URGENT');
    redFlags.push(isEs
      ? 'INGESTIÓN DE COMESTIBLE CON THC: Llame al Centro de Toxicología (1-800-222-1222). Los efectos pueden empezar horas después y durar mucho tiempo; llame al 911 si el niño no despierta, respira mal o convulsiona.'
      : 'THC EDIBLE INGESTION: Call Poison Control (1-800-222-1222). Effects can start hours later and last a long time; call 911 if the child will not wake, breathes poorly, or has a seizure.');
  }
  if (state.nicotineLiquidOrPouchIngestion) {
    raise('URGENT');
    redFlags.push(isEs
      ? 'INGESTIÓN DE NICOTINA (LÍQUIDO / CÁPSULA / BOLSITA): Llame al Centro de Toxicología (1-800-222-1222). El vómito temprano es una señal de alerta; lave la piel con agua y jabón si hubo contacto con líquido. No provoque el vómito.'
      : 'NICOTINE INGESTION (E-LIQUID / POD / POUCH): Call Poison Control (1-800-222-1222). Early vomiting is a warning sign; wash skin with soap and water after liquid contact. Do not induce vomiting.');
  }

  return {
    syndromeId: profile.id,
    urgency,
    title: isEs ? profile.titleEs : profile.titleEn,
    badge: isEs ? profile.badgeEs : profile.badgeEn,
    summary: isEs ? profile.summaryEs : profile.summaryEn,
    pathophysiology: isEs ? profile.pathophysiologyEs : profile.pathophysiologyEn,
    diagnostics: isEs ? profile.diagnosticsEs : profile.diagnosticsEn,
    management: isEs ? profile.managementEs : profile.managementEn,
    harmReduction: isEs ? profile.harmReductionEs : profile.harmReductionEn,
    redFlags
  };
}

export function formatPediatricSbarText(state = pediatricState, langOverride = getLang()) {
  const lang = langOverride || getLang();
  const isEs = lang === 'es';
  const r = evaluatePediatricRisk(state, lang);
  const lines = [];
  lines.push(isEs
    ? '=== ENTREGA CLÍNICA SBAR: EXPOSICIÓN PEDIÁTRICA ACCIDENTAL Y TOXICOLOGÍA INFANTIL (CERO-PII) ==='
    : '=== SBAR CLINICAL HANDOFF: PEDIATRIC ACCIDENTAL EXPOSURE & CHILD TOXICOLOGY (ZERO-PII) ===');
  lines.push(`${isEs ? 'SITUACIÓN (Exposición Principal)' : 'SITUATION (Primary Exposure)'}: ${r.title} [${r.urgency}]`);
  lines.push(`${isEs ? 'Prioridad Clínica' : 'Clinical Priority'}: ${r.badge}`);
  lines.push(`${isEs ? 'Centro de Toxicología' : 'Poison Control'}: ${POISON_CONTROL_NUMBER}`);
  lines.push('');
  lines.push(isEs ? 'ANTECEDENTES Y MECANISMO:' : 'BACKGROUND & MECHANISM:');
  lines.push(`- ${r.summary}`);
  lines.push(`- ${r.pathophysiology}`);
  if (r.redFlags.length > 0) {
    lines.push('');
    lines.push(isEs ? 'ALERTAS ROJAS ACTIVAS:' : 'ACTIVE RED-FLAG ALERTS:');
    for (const rf of r.redFlags) lines.push(`  [!] ${rf}`);
  }
  lines.push('');
  lines.push(isEs ? 'EVALUACIÓN:' : 'ASSESSMENT:');
  for (const d of r.diagnostics) lines.push(`  * ${d}`);
  lines.push('');
  lines.push(isEs ? 'RECOMENDACIÓN:' : 'RECOMMENDATION:');
  for (const m of r.management) lines.push(`  * ${m}`);
  lines.push('');
  lines.push(isEs ? 'PREVENCIÓN Y APOYO FAMILIAR:' : 'PREVENTION & FAMILY SUPPORT:');
  lines.push(`  * ${r.harmReduction}`);
  if (state.clinicalNotes && state.clinicalNotes.trim()) {
    lines.push('');
    lines.push(`${isEs ? 'NOTAS CLÍNICAS EFÍMERAS (EN RAM)' : 'EPHEMERAL CLINICAL NOTES (IN-RAM)'}: ${state.clinicalNotes.trim()}`);
  }
  return lines.join('\n');
}

const PEDIATRIC_FLAG_DEFINITIONS = Object.freeze([
  { key: 'childNotBreathingOrUnresponsive', labelEn: 'Child is very sleepy, will not wake, or is breathing slowly, noisily, or not at all', labelEs: 'El niño está muy somnoliento, no despierta o respira lento, con ruido o no respira' },
  { key: 'moudOrMethadoneIngestionWellAppearing', labelEn: 'Child may have swallowed or mouthed buprenorphine (film/tablet) or methadone—even if they look fine', labelEs: 'El niño pudo tragar o chupar buprenorfina (película/tableta) o metadona, aunque se vea bien' },
  { key: 'counterfeitPillOrPowderAccess', labelEn: 'Child may have had access to counterfeit pills, powder, or other street drugs', labelEs: 'El niño pudo tener acceso a pastillas falsificadas, polvo u otras drogas de la calle' },
  { key: 'clonidineGuanfacineInHome', labelEn: 'Clonidine, guanfacine, tizanidine, or xylazine-containing drugs may have been ingested', labelEs: 'Pudo ingerir clonidina, guanfacina, tizanidina o drogas con xilacina' },
  { key: 'edibleCannabisIngestion', labelEn: 'Child ate a cannabis (THC) edible—gummy, chocolate, cookie, or drink', labelEs: 'El niño comió un comestible con cannabis (THC): gomita, chocolate, galleta o bebida' },
  { key: 'nicotineLiquidOrPouchIngestion', labelEn: 'Child swallowed or spilled nicotine e-liquid, a vape pod, pouch, gum, or cigarette', labelEs: 'El niño tragó o se derramó líquido de vapeo, una cápsula, bolsita, chicle o cigarrillo con nicotina' }
]);

export function pediatricExposuresView() {
  const isEs = getLang() === 'es';

  const root = el('section', {
    className: 'view-section pediatric-exposures-view',
    attrs: { 'aria-labelledby': 'pediatric-exposures-heading', 'data-view': 'pediatric-exposures' }
  });

  const header = el('header', { className: 'view-header pediatric-header' });
  header.append(
    el('span', { className: 'section-kicker' }, t('pediatric.kicker', isEs
      ? 'Exposiciones Infantiles Accidentales, Toxicología Pediátrica y Almacenamiento Seguro'
      : 'Pediatric Accidental Exposures, Child Toxicology & Safe Storage')),
    h('h1', { id: 'pediatric-exposures-heading', class: 'view-title' }, t('pediatric.title', isEs
      ? 'Navegador de Exposiciones Pediátricas Accidentales: Buprenorfina, Metadona, Fentanilo, Comestibles de THC, Nicotina y Clonidina'
      : 'Pediatric Accidental Exposures Navigator: Buprenorphine, Methadone, Fentanyl, THC Edibles, Nicotine & Clonidine')),
    el('p', { className: 'view-subtitle' }, t('pediatric.subtitle', isEs
      ? 'Orientación sin juicios y sin datos personales para familias, cuidadores y equipos clínicos: qué hacer en los primeros minutos, cuándo llamar al 911 o al Centro de Toxicología y cómo prevenir exposiciones en casa.'
      : 'Judgment-free, zero-PII guidance for families, caregivers, and clinical teams: what to do in the first minutes, when to call 911 or Poison Control, and how to prevent exposures at home.'))
  );
  root.appendChild(header);

  const safetyBanner = el('div', {
    className: 'clinical-alert-banner pediatric-safety-banner',
    attrs: { role: 'region', 'aria-label': isEs ? 'Pasos inmediatos' : 'Immediate steps' }
  });
  safetyBanner.append(
    el('strong', {}, isEs ? 'Si el niño no respira bien o no despierta: ' : 'If a child is not breathing well or will not wake: '),
    el('span', {}, isEs
      ? 'llame al 911, administre naloxona y dé respiraciones de rescate. Para cualquier otra posible ingestión, llame gratis al Centro de Toxicología: '
      : 'call 911, give naloxone, and give rescue breaths. For any other possible ingestion, call Poison Control free, 24/7: '),
    h('a', { href: 'tel:18002221222', class: 'pediatric-poison-link' }, POISON_CONTROL_NUMBER)
  );
  root.appendChild(safetyBanner);

  const selectorSection = el('section', { className: 'pediatric-selector-section card', attrs: { 'aria-labelledby': 'pediatric-selector-heading' } });
  selectorSection.appendChild(el('h2', { id: 'pediatric-selector-heading', className: 'card-title' },
    t('pediatric.selectorTitle', isEs ? '1. Seleccione la Sustancia o Situación' : '1. Select the Substance or Situation')));
  const syndromeGrid = el('div', { className: 'pediatric-syndrome-grid', attrs: { role: 'group', 'aria-label': isEs ? 'Selector de exposición' : 'Exposure selector' } });
  const detailContainer = el('div', { className: 'pediatric-detail-container', attrs: { 'aria-live': 'polite' } });
  const sbarPre = el('pre', { className: 'sbar-output-pre pediatric-sbar-pre', attrs: { tabindex: '0', 'aria-label': isEs ? 'Resumen SBAR' : 'SBAR summary' } });

  function renderSyndromeButtons() {
    clear(syndromeGrid);
    const current = getPediatricState();
    for (const profile of Object.values(PEDIATRIC_SYNDROME_PROFILES)) {
      const isSelected = current.selectedSyndrome === profile.id;
      const btn = makeButton(isEs ? profile.titleEs : profile.titleEn, () => {
        setPediatricState({ selectedSyndrome: profile.id });
        renderSyndromeButtons();
        renderDetailAndSbar();
      }, { className: `button syndrome-select-btn ${isSelected ? 'active primary' : 'secondary'}`, ariaPressed: isSelected ? 'true' : 'false' });
      btn.setAttribute('data-syndrome-id', profile.id);
      syndromeGrid.appendChild(btn);
    }
  }

  const flagsSection = el('section', { className: 'pediatric-flags-section card', attrs: { 'aria-labelledby': 'pediatric-flags-heading' } });
  flagsSection.appendChild(el('h2', { id: 'pediatric-flags-heading', className: 'card-title' },
    t('pediatric.flagsTitle', isEs ? '2. Verificador de Señales de Alarma' : '2. Warning-Sign Checker')));
  const flagsList = el('div', { className: 'pediatric-flags-list' });
  const checkboxRefs = new Map();
  for (const def of PEDIATRIC_FLAG_DEFINITIONS) {
    const row = el('label', { className: 'checkbox-row pediatric-flag-row' });
    const cb = el('input', { attrs: { type: 'checkbox', 'data-flag-key': def.key } });
    cb.checked = Boolean(pediatricState[def.key]);
    cb.addEventListener('change', () => {
      setPediatricState({ [def.key]: cb.checked });
      renderDetailAndSbar();
    });
    checkboxRefs.set(def.key, cb);
    row.append(cb, el('span', {}, isEs ? def.labelEs : def.labelEn));
    flagsList.appendChild(row);
  }
  flagsSection.appendChild(flagsList);

  function renderDetailAndSbar() {
    clear(detailContainer);
    const r = evaluatePediatricRisk(getPediatricState());
    const card = el('article', { className: `card pediatric-profile-card urgency-${r.urgency.toLowerCase()}` });
    const headerRow = el('div', { className: 'profile-header-row' });
    headerRow.append(
      el('span', { className: `urgency-badge urgency-${r.urgency.toLowerCase()}` }, `${r.urgency}: ${r.badge}`),
      el('h3', { className: 'profile-title' }, r.title)
    );
    card.appendChild(headerRow);
    if (r.redFlags.length > 0) {
      const alertBox = el('div', { className: 'pediatric-redflag-box', attrs: { role: 'alert' } });
      alertBox.appendChild(el('h4', {}, isEs ? 'Señales de Alarma Activadas' : 'Warning Signs Activated'));
      const ul = el('ul', {});
      for (const rf of r.redFlags) ul.appendChild(el('li', {}, rf));
      alertBox.appendChild(ul);
      card.appendChild(alertBox);
    }
    card.appendChild(el('p', { className: 'profile-summary' }, r.summary));
    const section = (title, body) => {
      const s = el('div', { className: 'profile-subsection' });
      s.appendChild(el('h4', {}, title));
      if (Array.isArray(body)) {
        const ul = el('ul', {});
        for (const item of body) ul.appendChild(el('li', {}, item));
        s.appendChild(ul);
      } else {
        s.appendChild(el('p', {}, body));
      }
      return s;
    };
    card.append(
      section(isEs ? 'Por Qué es Peligroso' : 'Why It Is Dangerous', r.pathophysiology),
      section(isEs ? 'Qué Observar' : 'What to Look For', r.diagnostics),
      section(isEs ? 'Qué Hacer' : 'What to Do', r.management)
    );
    const hr = section(isEs ? 'Prevención y Apoyo Familiar' : 'Prevention & Family Support', r.harmReduction);
    hr.classList.add('harm-reduction-highlight');
    card.appendChild(hr);
    detailContainer.appendChild(card);
    sbarPre.textContent = formatPediatricSbarText(getPediatricState());
  }

  selectorSection.appendChild(syndromeGrid);
  root.append(selectorSection, flagsSection, detailContainer);

  const rulesSection = el('section', { className: 'pediatric-rules-section card', attrs: { 'aria-labelledby': 'pediatric-rules-heading' } });
  rulesSection.appendChild(el('h2', { id: 'pediatric-rules-heading', className: 'card-title' },
    t('pediatric.rulesTitle', isEs ? '3. Reglas Clave de Seguridad Infantil' : '3. Key Child Safety Rules')));
  const rulesGrid = el('div', { className: 'pediatric-rules-grid' });
  for (const rule of PEDIATRIC_HARM_REDUCTION_RULES) {
    const rCard = el('article', { className: 'pediatric-rule-card' });
    rCard.append(
      el('h3', { className: 'rule-title' }, isEs ? rule.titleEs : rule.titleEn),
      el('p', { className: 'rule-body' }, isEs ? rule.bodyEs : rule.bodyEn)
    );
    rulesGrid.appendChild(rCard);
  }
  rulesSection.appendChild(rulesGrid);
  root.appendChild(rulesSection);

  const sbarSection = el('section', { className: 'pediatric-sbar-section card', attrs: { 'aria-labelledby': 'pediatric-sbar-heading' } });
  sbarSection.appendChild(el('h2', { id: 'pediatric-sbar-heading', className: 'card-title' },
    t('pediatric.sbarTitle', isEs ? '4. Resumen SBAR para Toxicología o Urgencias (Cero-PII en RAM)' : '4. SBAR Summary for Poison Control or the ER (Zero-PII, In-RAM)')));
  const notesLabel = el('label', { className: 'field-label', attrs: { for: 'pediatric-clinical-notes' } },
    isEs ? 'Notas (solo en RAM; no escriba nombres ni datos identificables):' : 'Notes (in-RAM only; do not enter names or identifying details):');
  const notesInput = el('textarea', {
    id: 'pediatric-clinical-notes',
    className: 'form-textarea pediatric-notes-input',
    attrs: { rows: '2', placeholder: isEs ? 'Ej. 2 años, ~12 kg, posible 1 película de 8 mg hace ~40 min...' : 'e.g., 2 yrs, ~12 kg, possible one 8 mg film ~40 min ago...' }
  });
  notesInput.value = pediatricState.clinicalNotes;
  notesInput.addEventListener('input', () => {
    setPediatricState({ clinicalNotes: notesInput.value });
    sbarPre.textContent = formatPediatricSbarText(getPediatricState());
  });
  const copyStatus = el('span', { className: 'copy-status-msg', attrs: { role: 'status', 'aria-live': 'polite' } });
  const copyBtn = makeButton(isEs ? 'Copiar SBAR al Portapapeles' : 'Copy SBAR to Clipboard', async () => {
    const txt = formatPediatricSbarText(getPediatricState());
    const ok = await copyText(txt, {
      trigger: copyBtn,
      copiedLabel: isEs ? '¡Copiado!' : 'Copied!',
      failedLabel: isEs ? 'No se pudo copiar — seleccione el texto manualmente' : 'Copy failed — select text manually',
    });
    copyStatus.textContent = ok
      ? (isEs ? '¡Copiado al portapapeles!' : 'Copied to clipboard!')
      : (isEs ? 'No se pudo acceder al portapapeles. Copie el texto manualmente.' : 'Could not access clipboard. Select the text to copy manually.');
  }, { className: 'button primary copy-sbar-btn' });
  const resetBtn = makeButton(isEs ? 'Reiniciar (RAM)' : 'Reset (RAM)', () => {
    resetPediatricState();
    notesInput.value = '';
    copyStatus.textContent = '';
    for (const [k, cb] of checkboxRefs.entries()) cb.checked = Boolean(pediatricState[k]);
    renderSyndromeButtons();
    renderDetailAndSbar();
  }, { className: 'button secondary reset-pediatric-btn' });
  const actionsRow = el('div', { className: 'sbar-actions-row' });
  actionsRow.append(copyBtn, resetBtn, copyStatus);
  sbarSection.append(notesLabel, notesInput, actionsRow, sbarPre);
  root.appendChild(sbarSection);

  const linksSection = el('nav', { className: 'pediatric-links-section card', attrs: { 'aria-label': isEs ? 'Guías relacionadas' : 'Related guides' } });
  linksSection.appendChild(el('h2', { className: 'card-title' }, isEs ? 'Guías Relacionadas' : 'Related Guides'));
  const linksRow = el('div', { className: 'related-links-row' });
  linksRow.append(
    makeLinkButton(isEs ? 'Respuesta ante Sobredosis (#/overdose)' : 'Overdose Response (#/overdose)', '#/overdose'),
    makeLinkButton(isEs ? 'Atención a Jóvenes y Familias (#/adolescent)' : 'Youth & Family Care (#/adolescent)', '#/adolescent'),
    makeLinkButton(isEs ? 'Embarazo y Posparto (#/perinatal)' : 'Pregnancy & Postpartum (#/perinatal)', '#/perinatal'),
    makeLinkButton(isEs ? 'Cannabis y CHS (#/cannabis-care)' : 'Cannabis & CHS (#/cannabis-care)', '#/cannabis-care'),
    makeLinkButton(isEs ? 'Dejar la Nicotina (#/nicotine-care)' : 'Quitting Nicotine (#/nicotine-care)', '#/nicotine-care')
  );
  linksSection.appendChild(linksRow);
  root.appendChild(linksSection);

  renderSyndromeButtons();
  renderDetailAndSbar();
  return root;
}
