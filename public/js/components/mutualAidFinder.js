// Interactive Mutual Aid & Peer Support Directory component
// 4-Philosophy Taxonomy: Secular/CBT, Mindfulness/Buddhist, Harm Reduction/MOUD-Affirming, 12-Step Fellowships, Family Allies.
// 100% ephemeral in-RAM state, WCAG 2.2 AA compliant, print-ready, bilingual en/es.
// Zero npm dependencies.

import { h, ext, icon, announce, clear } from '../dom.js';
import { getLang } from '../i18n.js';

/**
 * 4-Philosophy Recovery Taxonomy + Family Allies
 */
export const MUTUAL_AID_PHILOSOPHIES = [
  {
    id: 'secular',
    name: {
      en: 'Secular / Cognitive-Behavioral',
      es: 'Secular / Cognitivo-Conductual',
    },
    tagLine: {
      en: 'Science-based, self-empowering, cognitive tools (CBT / REBT)',
      es: 'Basado en la ciencia, auto-capacitación, herramientas cognitivas (TCC / TREC)',
    },
    description: {
      en: 'Evidence-based peer support utilizing cognitive-behavioral therapy (CBT) and rational emotive behavior therapy (REBT). Focuses on internal locus of control and self-empowerment without requiring spiritual surrender.',
      es: 'Apoyo mutuo basado en evidencia que utiliza terapia cognitivo-conductual (TCC) y terapia racional emotiva conductual (TREC). Se enfoca en el locus de control interno y la auto-capacitación sin requerir entrega espiritual.',
    },
    keyPrinciples: {
      en: '4-Point Program (SMART), 3-S Philosophy: Sobriety, Secularity, Self-Help (LifeRing)',
      es: 'Programa de 4 Puntos (SMART), Filosofía 3-S: Sobriedad, Secularidad, Autoayuda (LifeRing)',
    },
  },
  {
    id: 'mindfulness',
    name: {
      en: 'Mindfulness & Buddhist-Based',
      es: 'Atención Plena y Basado en el Budismo',
    },
    tagLine: {
      en: 'Meditation, Eightfold Path, trauma-informed sangha community',
      es: 'Meditación, Óctuple Sendero, comunidad sangha informada en trauma',
    },
    description: {
      en: 'Non-theistic recovery grounded in Buddhist psychology, meditation practices, the Four Noble Truths, and the Eightfold Path. Cultivates mindful awareness of cravings and a supportive sangha community.',
      es: 'Recuperación no teísta basada en la psicología budista, prácticas de meditación, las Cuatro Nobles Verdades y el Óctuple Sendero. Cultiva la conciencia plena de los deseos y una sangha (comunidad) de apoyo.',
    },
    keyPrinciples: {
      en: 'Guided meditation, investigation of craving without judgment, sangha peer community, ethical precepts',
      es: 'Meditación guiada, indagación del deseo sin juzgar, comunidad de pares sangha, preceptos éticos',
    },
  },
  {
    id: 'moud_affirming',
    name: {
      en: 'Harm Reduction & MOUD-Affirming',
      es: 'Reducción de Daños y Afirmativo de MOUD',
    },
    tagLine: {
      en: 'Zero medication stigma, any positive change, dual recovery support',
      es: 'Cero estigma hacia los medicamentos, cualquier cambio positivo, apoyo en recuperación dual',
    },
    description: {
      en: 'Peer recovery communities that explicitly affirm and celebrate members utilizing Medications for Opioid Use Disorder (MOUD like methadone, buprenorphine, naltrexone) and psychiatric medications without gatekeeping or stigma.',
      es: 'Comunidades de recuperación entre pares que afirman y celebran explícitamente a miembros que utilizan Medicamentos para el Trastorno por Consumo de Opioides (MOUD como metadona, buprenorfina, naltrexona) y psiquiátricos sin barreras ni estigma.',
    },
    keyPrinciples: {
      en: 'Zero medication stigma, any positive step in harm reduction, concurrent dual recovery support',
      es: 'Cero estigma hacia los medicamentos, cualquier paso positivo en reducción de daños, apoyo en recuperación dual concurrente',
    },
  },
  {
    id: 'twelve_step',
    name: {
      en: '12-Step Fellowships',
      es: 'Comunidades de 12 Pasos',
    },
    tagLine: {
      en: '12 Steps & Traditions, spiritual surrender, peer sponsorship',
      es: '12 Pasos y Tradiciones, entrega espiritual, padrinazgo de pares',
    },
    description: {
      en: 'Spiritual fellowships built around the historic 12 Steps and Traditions, peer sponsorship, shared vulnerability, and surrender to a Higher Power as personally understood.',
      es: 'Comunidades espirituales estructuradas sobre los 12 Pasos y Tradiciones históricos, padrinazgo de pares, vulnerabilidad compartida y entrega a un Poder Superior según el entendimiento propio.',
    },
    keyPrinciples: {
      en: '12 Steps & Traditions, personal Higher Power, peer sponsorship, total abstinence model, meeting autonomy',
      es: '12 Pasos y Tradiciones, Poder Superior personal, padrinazgo de pares, modelo de abstinencia total, autonomía del grupo',
    },
  },
  {
    id: 'family_allies',
    name: {
      en: 'Family, Loved Ones & Allies',
      es: 'Familiares, Seres Queridos y Aliados',
    },
    tagLine: {
      en: 'CRAFT behavioral skills, self-care, detachment with love',
      es: 'Habilidades conductuales CRAFT, autocuidado, desapego con amor',
    },
    description: {
      en: 'Support communities specifically designed for family members, partners, and friends navigating a loved one’s substance use disorder. Focuses on personal emotional health, safety, communication, and boundary-setting.',
      es: 'Comunidades de apoyo diseñadas específicamente para familiares, parejas y amigos de personas con trastorno por consumo de sustancias. Se enfoca en la salud emocional personal, seguridad, comunicación y límites saludables.',
    },
    keyPrinciples: {
      en: 'CRAFT behavioral positive reinforcement, detachment with love, boundary setting, self-compassion',
      es: 'Refuerzo conductual positivo CRAFT, desapego con amor, establecimiento de límites, autocompasión',
    },
  },
];

// Attach dictionary properties for direct key access
for (const phil of MUTUAL_AID_PHILOSOPHIES) {
  MUTUAL_AID_PHILOSOPHIES[phil.id] = phil;
}

/**
 * Comprehensive Mutual Aid Programs Directory
 */
export const MUTUAL_AID_PROGRAMS = [
  {
    id: 'smart-recovery',
    name: 'SMART Recovery',
    acronym: 'SMART',
    philosophies: ['secular'],
    philosophy: 'secular',
    isMoudAffirming: true,
    moudStatus: 'explicitly_affirming',
    hasOnline247: false,
    hasLocalFinder: true,
    hasScheduledOnline: true,
    websiteUrl: 'https://meetings.smartrecovery.org/',
    description: {
      en: 'Self-Management and Recovery Training. A science-based, self-empowering mutual help group using cognitive-behavioral therapy (CBT) and rational emotive behavior therapy (REBT) principles.',
      es: 'Entrenamiento en Auto-Manejo y Recuperación. Un grupo de ayuda mutua basado en la ciencia y la auto-capacitación que utiliza principios de TCC y TREC.',
    },
    keyTools: {
      en: '4-Point Program (Building Motivation, Coping with Urges, Managing Thoughts & Feelings, Balanced Living), ABC Model, Cost-Benefit Analysis (CBA), Urge Log, Role-playing',
      es: 'Programa de 4 Puntos (Desarrollo de Motivación, Manejo de Impulsos, Gestión de Pensamientos/Emociones, Vida Equilibrada), Modelo ABC, Análisis Costo-Beneficio',
    },
    spiritualityApproach: {
      en: 'Secular & Scientific: No spiritual component required. Emphasizes self-reliance, human agency, and personal scientific tools.',
      es: 'Secular y Científico: No requiere componente espiritual. Enfatiza la autosuficiencia, la capacidad humana y herramientas científicas.',
    },
    recoveryApproach: {
      en: 'Abstinence-oriented goal with pragmatic harm reduction support and recognition of progressive change.',
      es: 'Meta orientada a la abstinencia con apoyo pragmático de reducción de daños y reconocimiento del cambio progresivo.',
    },
    moudAcceptance: {
      en: '100% Affirming: Prescribed MOUD (methadone, buprenorphine, naltrexone) and psychiatric medications are fully recognized as valid medical treatments.',
      es: '100% Afirmativo: MOUD recetados (metadona, buprenorfina, naltrexona) y fármacos psiquiátricos son plenamente reconocidos como tratamientos válidos.',
    },
    meetingStructure: {
      en: 'Facilitator-led discussions (60–90 min) where open discussion and constructive cross-talk are actively encouraged to solve problems collaboratively.',
      es: 'Reuniones guiadas por facilitador (60–90 min) con diálogo constructivo cruzado permitido y fomentado para resolver problemas juntos.',
    },
  },
  {
    id: 'lifering',
    name: 'LifeRing Secular Recovery',
    acronym: 'LifeRing',
    philosophies: ['secular'],
    philosophy: 'secular',
    isMoudAffirming: true,
    moudStatus: 'affirming',
    hasOnline247: false,
    hasLocalFinder: true,
    hasScheduledOnline: true,
    websiteUrl: 'https://lifering.org/',
    description: {
      en: 'An autonomous secular network of peer support based on the "3-S" philosophy: Sobriety, Secularity, and Self-Help. Participants build their own personal recovery plans.',
      es: 'Una red secular autónoma de apoyo mutuo basada en la filosofía "3-S": Sobriedad, Secularidad y Autoayuda. Cada participante diseña su propio plan de recuperación.',
    },
    keyTools: {
      en: '"3-S" Framework (Sobriety, Secularity, Self-Help), Personal Recovery Plan ("Recovery by Choice"), "How Was Your Week?" round-robin structure',
      es: 'Marco "3-S" (Sobriedad, Secularidad, Autoayuda), Plan Personal de Recuperación ("Recuperación por Elección"), ronda "¿Cómo estuvo tu semana?"',
    },
    spiritualityApproach: {
      en: 'Strictly Secular: Keeps religion, prayer, and higher powers out of meetings. Welcomes members of any belief but recovery tools remain non-religious.',
      es: 'Estrictamente Secular: Mantiene la religión, oraciones y poderes superiores fuera de las reuniones.',
    },
    recoveryApproach: {
      en: 'Abstinence-based ("Sobriety" pillar) from unprescribed drugs and alcohol, supported by peer empowerment and mutual respect.',
      es: 'Basado en abstinencia (pilar de Sobriedad) de sustancias no recetadas y alcohol, respaldado por empoderamiento entre pares.',
    },
    moudAcceptance: {
      en: 'Affirming: Medications taken as prescribed by licensed physicians (including MOUD and psychiatric meds) do not compromise sobriety status.',
      es: 'Afirmativo: Los medicamentos tomados según indicación médica (incluyendo MOUD y psicofármacos) no comprometen la sobriedad.',
    },
    meetingStructure: {
      en: 'Informal round-robin check-in ("How Was Your Week?"), focusing on positive coping strategies for current challenges with interactive cross-talk.',
      es: 'Ronda de diálogo informal ("¿Cómo estuvo tu semana?"), enfocada en estrategias positivas para desafíos actuales con diálogo cruzado.',
    },
  },
  {
    id: 'recovery-dharma',
    name: 'Recovery Dharma',
    acronym: 'RD',
    philosophies: ['mindfulness'],
    philosophy: 'mindfulness',
    isMoudAffirming: true,
    moudStatus: 'explicitly_affirming',
    hasOnline247: true,
    hasLocalFinder: true,
    hasScheduledOnline: true,
    websiteUrl: 'https://recoverydharma.org/',
    description: {
      en: 'A peer-led movement using Buddhist-inspired practices, mindfulness, the Four Noble Truths, and the Eightfold Path to heal from addiction and suffering in a trauma-informed sangha.',
      es: 'Un movimiento liderado por pares que utiliza prácticas budistas, atención plena, las Cuatro Nobles Verdades y el Óctuple Sendero para sanar de la adicción en una sangha informada en trauma.',
    },
    keyTools: {
      en: 'Mindfulness meditation, Four Noble Truths, Eightfold Path, Sangha (community fellowship), Inquiry practices, Compassion and Forgiveness meditations',
      es: 'Meditación mindfulness, Cuatro Nobles Verdades, Óctuple Sendero, Sangha (comunidad), indagación interior, meditaciones de compasión y perdón',
    },
    spiritualityApproach: {
      en: 'Non-theistic / Buddhist Psychology: No deity, dogma, or religious conversion. Recovery is viewed through meditation, ethical living, and self-inquiry.',
      es: 'No teísta / Psicología Budista: Sin deidades ni dogmas. La recuperación se fundamenta en la meditación, la vida ética y la autoindagación.',
    },
    recoveryApproach: {
      en: 'Abstinence encouraged through mindfulness, with profound compassion for harm reduction, slips, and individualized journeys.',
      es: 'Abstinencia fomentada mediante atención plena, con compasión profunda hacia la reducción de daños y procesos individuales.',
    },
    moudAcceptance: {
      en: '100% Affirming: Welcomes all individuals utilizing prescribed medications for opioid use disorder and mental health without reservation.',
      es: '100% Afirmativo: Da la bienvenida a personas que utilizan medicamentos recetados para opioides y salud mental sin reservas.',
    },
    meetingStructure: {
      en: 'Opening intention, 15–20 minute guided meditation sit, reading from the Recovery Dharma text, followed by open mindful sharing with no cross-talk or advice.',
      es: 'Intención inicial, 15–20 min de meditación guiada, lectura del libro de Recovery Dharma y espacio para compartir sin diálogo cruzado ni consejos.',
    },
  },
  {
    id: 'refuge-recovery',
    name: 'Refuge Recovery',
    acronym: 'Refuge',
    philosophies: ['mindfulness'],
    philosophy: 'mindfulness',
    isMoudAffirming: true,
    moudStatus: 'affirming',
    hasOnline247: false,
    hasLocalFinder: true,
    hasScheduledOnline: true,
    websiteUrl: 'https://refugerecovery.org/',
    description: {
      en: 'A mindfulness-based recovery community grounded in the belief that Buddhist practices and the Eightfold Path offer a complete approach to treating addiction.',
      es: 'Una comunidad de recuperación basada en la atención plena fundamentada en que las prácticas budistas y el Óctuple Sendero ofrecen un camino integral para la adicción.',
    },
    keyTools: {
      en: 'Meditation sits (Breath, Loving-kindness, Body scan), Eightfold Path inventory, Process group mentorship, Ethical precepts',
      es: 'Meditaciones (Respiración, Bondad amorosa, Escaneo corporal), Inventario del Óctuple Sendero, mentoría de grupo, preceptos éticos',
    },
    spiritualityApproach: {
      en: 'Non-theistic: Grounded in Buddhist wisdom and mindfulness psychology rather than prayer or belief in God.',
      es: 'No teísta: Fundamentado en la sabiduría budista y la psicología de la atención plena en lugar de oraciones o dogmas.',
    },
    recoveryApproach: {
      en: 'Abstinence from process and chemical addictions, guided by ethical precepts and compassionate exploration of craving.',
      es: 'Abstinencia de adicciones químicas y de conducta, guiada por preceptos éticos y exploración compasiva del deseo.',
    },
    moudAcceptance: {
      en: 'Affirming: Legitimate physician-prescribed medications (including buprenorphine, methadone, psychiatric care) are respected.',
      es: 'Afirmativo: Se respetan los medicamentos prescritos legítimamente por médicos (incluidos buprenorfina, metadona y psiquiátricos).',
    },
    meetingStructure: {
      en: 'Opening readings, 20-minute meditation sit, literature study, and individual shares focused on mindful insight without cross-talk.',
      es: 'Lecturas de apertura, meditación guiada de 20 min, estudio de literatura y reflexiones individuales centradas en la introspección sin interrupciones.',
    },
  },
  {
    id: 'mara',
    name: 'Medication-Assisted Recovery Anonymous',
    acronym: 'MARA',
    philosophies: ['moud_affirming'],
    philosophy: 'moud_affirming',
    isMoudAffirming: true,
    moudStatus: 'explicitly_affirming',
    hasOnline247: false,
    hasLocalFinder: true,
    hasScheduledOnline: true,
    websiteUrl: 'https://www.mara-international.org/',
    description: {
      en: 'A 12-Step and harm-reduction-friendly fellowship founded specifically for individuals who use evidence-based medications (methadone, buprenorphine, naltrexone, psychiatric meds, medical cannabis) in recovery.',
      es: 'Una comunidad afín a los 12 Pasos y a la reducción de daños fundada específicamente para personas que utilizan medicamentos basados en evidencia (metadona, buprenorfina, naltrexona, psicofármacos, cannabis medicinal) en recuperación.',
    },
    keyTools: {
      en: '12 MARA Traditions & Steps adapted for medical recovery, Stigma-free safe space, Dual support for medication adherence and holistic wellness',
      es: '12 Tradiciones y Pasos de MARA adaptados a la recuperación médica, espacio seguro sin estigma, apoyo dual para adherencia al tratamiento',
    },
    spiritualityApproach: {
      en: 'Inclusive & Non-dogmatic: Open to spiritual, religious, agnostic, and atheist members. Spiritual beliefs are personal and never required.',
      es: 'Inclusivo y No dogmático: Abierto a personas espirituales, religiosas, agnósticas y ateas. Las creencias son personales y nunca obligatorias.',
    },
    recoveryApproach: {
      en: 'Harm Reduction & Medication-Affirming: Recovery is defined as any positive step toward health and wellbeing. Focuses on quality of life rather than rigid abstinence purity.',
      es: 'Reducción de Daños y Afirmativo de Medicación: La recuperación se define como cualquier paso positivo hacia la salud y el bienestar.',
    },
    moudAcceptance: {
      en: '100% Explicitly MOUD-Centric: Purpose-built to eliminate medication stigma. Members can speak freely about dosages, clinic experiences, and physician care.',
      es: '100% Explícitamente Centrado en MOUD: Creado para eliminar el estigma de la medicación. Los miembros pueden hablar libremente sobre dosis y experiencias clínicas.',
    },
    meetingStructure: {
      en: 'Preamble, safe space agreement affirming all medications, speaker or topic discussion, and supportive sharing where medications are never hidden.',
      es: 'Preámbulo, acuerdo de espacio seguro que afirma todos los medicamentos, orador o tema, y reflexiones de apoyo donde la medicación nunca se oculta.',
    },
  },
  {
    id: 'dra',
    name: 'Dual Recovery Anonymous',
    acronym: 'DRA',
    philosophies: ['moud_affirming', 'twelve_step'],
    philosophy: 'moud_affirming',
    isMoudAffirming: true,
    moudStatus: 'explicitly_affirming',
    hasOnline247: false,
    hasLocalFinder: true,
    hasScheduledOnline: true,
    websiteUrl: 'https://draonline.org/',
    description: {
      en: 'A 12-Step fellowship for individuals experiencing concurrent chemical dependency and emotional or psychiatric illness. Explicitly protects medication adherence.',
      es: 'Una comunidad de 12 Pasos para personas que experimentan dependencia química concurrente y trastornos emocionales o psiquiátricos. Protege explícitamente la adherencia a la medicación.',
    },
    keyTools: {
      en: '12 Steps of DRA adapted for dual diagnosis, Dual Recovery Blueprint, Mental Health & Substance Integrated Planning',
      es: '12 Pasos de DRA adaptados para diagnóstico dual, Esquema de Recuperación Dual, Planificación integrada de salud mental y sustancias',
    },
    spiritualityApproach: {
      en: 'Adapted Spiritual 12-Step: Encourages a personal concept of a Higher Power or inner strength, while maintaining strict clinical reality for mental health.',
      es: '12 Pasos Espirituales Adaptados: Fomenta un concepto personal de Poder Superior o fuerza interna, manteniendo la realidad médica para la salud mental.',
    },
    recoveryApproach: {
      en: 'Dual Recovery: Abstinence from unprescribed drugs and alcohol, paired with active management and stabilization of psychiatric conditions.',
      es: 'Recuperación Dual: Abstinencia de alcohol y drogas no recetadas, junto con el manejo activo y estabilización de afecciones psiquiátricas.',
    },
    moudAcceptance: {
      en: '100% Affirming: Explicitly affirms taking prescribed psychiatric medicines and addiction pharmacotherapies (MOUD) without fear of being labeled "not sober".',
      es: '100% Afirmativo: Afirma explícitamente la toma de psicofármacos y medicamentos de adicción recetados sin temor a ser calificado de "no sobrio".',
    },
    meetingStructure: {
      en: 'Structured 12-Step format addressing both illnesses simultaneously; cross-talk is avoided to provide safety and non-judgmental validation.',
      es: 'Formato estructurado de 12 Pasos que aborda ambas afecciones simultáneamente; se evita el diálogo cruzado para brindar seguridad y validación.',
    },
  },
  {
    id: 'alcoholics-anonymous',
    name: 'Alcoholics Anonymous',
    acronym: 'AA',
    philosophies: ['twelve_step'],
    philosophy: 'twelve_step',
    isMoudAffirming: false,
    moudStatus: 'group_dependent',
    hasOnline247: true,
    hasLocalFinder: true,
    hasScheduledOnline: true,
    websiteUrl: 'https://www.aa.org/find-aa',
    description: {
      en: 'The original 12-Step mutual aid fellowship founded in 1935, focused on recovery from alcohol use disorder through peer sponsorship and spiritual principles.',
      es: 'La comunidad original de ayuda mutua de 12 Pasos fundada en 1935, enfocada en la recuperación del alcohol mediante padrinazgo y principios espirituales.',
    },
    keyTools: {
      en: '12 Steps & 12 Traditions, Big Book literature, Peer Sponsorship, Service commitments, Anonymity',
      es: '12 Pasos y 12 Tradiciones, Libro Grande, Padrinazgo entre pares, Compromisos de servicio, Anonimato',
    },
    spiritualityApproach: {
      en: 'Spiritual: Reliance on a "Higher Power as we understood Him/Her/It". Prayer and spiritual surrender are central to the 12-Step progression.',
      es: 'Espiritual: Confianza en un "Poder Superior según nuestro propio entendimiento". La oración y la entrega son pilares de los 12 Pasos.',
    },
    recoveryApproach: {
      en: 'Total Abstinence: Complete abstinence from alcohol is the primary objective and requirement for membership.',
      es: 'Abstinencia Total: La abstinencia completa de alcohol es el objetivo primordial y único requisito para ser miembro.',
    },
    moudAcceptance: {
      en: 'Group-Dependent / Stigma Caution: General Service Conference literature ("The A.A. Member—Medications and Other Drugs") affirms doctors\' prescriptions, but autonomous local groups and sponsors vary widely and some stigmatize MOUD.',
      es: 'Dependiente del Grupo / Precaución de Estigma: La literatura oficial reconoce las recetas médicas, pero grupos locales autónomos pueden estigmatizar MOUD.',
    },
    meetingStructure: {
      en: 'Chairperson readings, speaker or topic discussion, individual member shares with strict etiquette prohibiting cross-talk or unsolicited advice.',
      es: 'Lecturas por coordinador, orador o tema, reflexiones individuales de miembros con regla estricta de no interrupciones ni consejos no solicitados.',
    },
  },
  {
    id: 'narcotics-anonymous',
    name: 'Narcotics Anonymous',
    acronym: 'NA',
    philosophies: ['twelve_step'],
    philosophy: 'twelve_step',
    isMoudAffirming: false,
    moudStatus: 'group_dependent',
    hasOnline247: true,
    hasLocalFinder: true,
    hasScheduledOnline: true,
    websiteUrl: 'https://na.org/meetingsearch/',
    description: {
      en: 'Global community-based 12-Step fellowship for people recovering from drug dependence of any kind, based on complete abstinence from all mood-altering substances.',
      es: 'Comunidad global de 12 Pasos para personas en recuperación de dependencia a drogas de cualquier tipo, basada en abstinencia de sustancias que alteran la mente.',
    },
    keyTools: {
      en: '12 Steps & Traditions, Basic Text, Sponsorship, Living Clean literature, Home group meetings',
      es: '12 Pasos y Tradiciones, Texto Básico, Padrinazgo, literatura Vivir Limpios, Grupos base',
    },
    spiritualityApproach: {
      en: 'Spiritual: Spiritual awakenings through the 12 steps, surrender of personal will to a loving Higher Power.',
      es: 'Espiritual: Despertar espiritual mediante los 12 pasos y entrega de la voluntad a un Poder Superior amoroso.',
    },
    recoveryApproach: {
      en: 'Total Abstinence: Clean time is defined as complete abstinence from all drugs and alcohol.',
      es: 'Abstinencia Total: El tiempo limpio se define como la abstinencia completa de todas las drogas y alcohol.',
    },
    moudAcceptance: {
      en: 'Group-Dependent / Stigma Caution: World Board Bulletin #29 addresses medication-assisted treatment; while attendance is welcomed, local groups often restrict speaking or holding service positions for members on MOUD.',
      es: 'Dependiente del Grupo / Precaución de Estigma: El boletín #29 aborda MOUD; aunque se acoge la asistencia, grupos locales a menudo restringen hablar o tomar servicio.',
    },
    meetingStructure: {
      en: 'Preamble, readings, topic/speaker, round-robin personal shares without cross-talk, concluding with group circle and prayer.',
      es: 'Preámbulo, lecturas, tema u orador, reflexiones personales sin diálogo cruzado y cierre en círculo con oración.',
    },
  },
  {
    id: 'cocaine-anonymous',
    name: 'Cocaine Anonymous',
    acronym: 'CA',
    philosophies: ['twelve_step'],
    philosophy: 'twelve_step',
    isMoudAffirming: false,
    moudStatus: 'group_dependent',
    hasOnline247: false,
    hasLocalFinder: true,
    hasScheduledOnline: true,
    websiteUrl: 'https://ca.org/',
    description: {
      en: 'A 12-Step fellowship for individuals seeking recovery from cocaine and all other mind-altering substances, utilizing the Big Book of Alcoholics Anonymous.',
      es: 'Una comunidad de 12 Pasos para personas que buscan recuperarse de la cocaína y otras sustancias psicoactivas, utilizando el Libro Grande de Alcohólicos Anónimos.',
    },
    keyTools: {
      en: '12 Steps, Big Book studies, Peer sponsorship, Fellowship events',
      es: '12 Pasos, estudio del Libro Grande, padrinazgo de pares, eventos comunitarios',
    },
    spiritualityApproach: {
      en: 'Spiritual: 12 Steps centered on spiritual surrender and personal inventory work.',
      es: 'Espiritual: 12 Pasos enfocados en la entrega espiritual y el inventario moral.',
    },
    recoveryApproach: {
      en: 'Total Abstinence: Complete abstinence from all mind-altering substances.',
      es: 'Abstinencia Total: Abstinencia completa de todas las sustancias que alteran la mente.',
    },
    moudAcceptance: {
      en: 'Group-Dependent: Follows 12-step traditions with group autonomy; medication acceptance varies by local meeting.',
      es: 'Dependiente del Grupo: Sigue las tradiciones de 12 pasos; la aceptación de medicación varía según el grupo local.',
    },
    meetingStructure: {
      en: 'Readings, topic/speaker, individual sharing with no cross-talk.',
      es: 'Lecturas, tema u orador, intervenciones individuales sin diálogo cruzado.',
    },
  },
  {
    id: 'al-anon',
    name: 'Al-Anon Family Groups',
    acronym: 'Al-Anon',
    philosophies: ['twelve_step', 'family_allies'],
    philosophy: 'family_allies',
    isMoudAffirming: true,
    moudStatus: 'affirming',
    hasOnline247: false,
    hasLocalFinder: true,
    hasScheduledOnline: true,
    websiteUrl: 'https://al-anon.org/',
    description: {
      en: 'A worldwide 12-Step mutual support program for relatives and friends of alcoholics, whether the person who drinks is still drinking or not.',
      es: 'Un programa mundial de apoyo mutuo de 12 Pasos para familiares y amigos de personas con problemas de alcohol, independientemente de si continúan bebiendo o no.',
    },
    keyTools: {
      en: '12 Steps of Al-Anon, 12 Traditions, Detachment with Love, One Day at a Time, Sponsorship, Slogans',
      es: '12 Pasos de Al-Anon, 12 Tradiciones, Desapego con Amor, Un Día a la Vez, Padrinazgo, Lemas',
    },
    spiritualityApproach: {
      en: 'Spiritual: 12-Step spiritual principles focusing on letting go of attempting to control another person’s behavior.',
      es: 'Espiritual: Principios espirituales de 12 Pasos enfocados en soltar el control sobre la conducta de otra persona.',
    },
    recoveryApproach: {
      en: 'Family Emotional Recovery: Focuses on the loved one’s own mental wellbeing and boundaries, not changing the person with substance use.',
      es: 'Recuperación Emocional Familiar: Se enfoca en el bienestar mental y los límites propios del familiar, no en cambiar a la persona que consume.',
    },
    moudAcceptance: {
      en: 'Supportive / Neutral: Does not interfere with medical treatments; increasingly supportive of evidence-based medical care.',
      es: 'De apoyo / Neutral: No interfiere en tratamientos médicos; apoya la atención médica basada en evidencia.',
    },
    meetingStructure: {
      en: 'Readings, topic or step study, sharing of personal feelings and growth without giving advice or cross-talk.',
      es: 'Lecturas, estudio de paso o tema, expresión de emociones personales sin consejos ni interrupciones.',
    },
  },
  {
    id: 'nar-anon',
    name: 'Nar-Anon Family Groups',
    acronym: 'Nar-Anon',
    philosophies: ['twelve_step', 'family_allies'],
    philosophy: 'family_allies',
    isMoudAffirming: true,
    moudStatus: 'affirming',
    hasOnline247: false,
    hasLocalFinder: true,
    hasScheduledOnline: true,
    websiteUrl: 'https://nar-anon.org/',
    description: {
      en: 'A 12-Step program for family members and friends of people who use drugs or struggle with addiction, offering comfort, hope, and boundaries.',
      es: 'Un programa de 12 Pasos para familiares y amigos de personas que consumen drogas, ofreciendo consuelo, esperanza y límites saludables.',
    },
    keyTools: {
      en: '12 Steps of Nar-Anon, Detachment with Love, Boundary Setting, Slogans, Daily Readers',
      es: '12 Pasos de Nar-Anon, Desapego con Amor, Establecimiento de Límites, Lemas, Lecturas diarias',
    },
    spiritualityApproach: {
      en: 'Spiritual: 12-Step foundation emphasizing personal spiritual growth and releasing enablement.',
      es: 'Espiritual: Fundamento de 12 Pasos que enfatiza el crecimiento espiritual propio y superar la codependencia.',
    },
    recoveryApproach: {
      en: 'Family Wellness: Coping with the effects of another’s addiction, learning healthy detachment, and practicing self-care.',
      es: 'Bienestar Familiar: Afrontar el impacto de la adicción de otro, aprender desapego saludable y practicar autocuidado.',
    },
    moudAcceptance: {
      en: 'Supportive: Non-interference in medical issues; emphasizes compassionate understanding and life-saving measures.',
      es: 'De apoyo: Sin interferencia en temas médicos; fomenta comprensión compasiva y medidas preventivas.',
    },
    meetingStructure: {
      en: 'Structured readings, topic sharing focused on self-experience rather than discussing the addicted individual, zero cross-talk.',
      es: 'Lecturas estructuradas, reflexiones personales sobre vivencias propias sin centrarse en la persona con adicción, sin interrupciones.',
    },
  },
  {
    id: 'smart-family',
    name: 'SMART Recovery Family & Friends',
    acronym: 'SMART F&F',
    philosophies: ['secular', 'family_allies'],
    philosophy: 'family_allies',
    isMoudAffirming: true,
    moudStatus: 'explicitly_affirming',
    hasOnline247: false,
    hasLocalFinder: true,
    hasScheduledOnline: true,
    websiteUrl: 'https://smartrecovery.org/family',
    description: {
      en: 'Science-based support for loved ones based on CRAFT (Community Reinforcement and Family Training) and CBT principles to build positive communication and self-care.',
      es: 'Apoyo basado en la ciencia para familiares basado en CRAFT (Entrenamiento de Refuerzo Comunitario y Familiar) y TCC para comunicación positiva y autocuidado.',
    },
    keyTools: {
      en: 'CRAFT communication techniques, Positive Reinforcement, PIUS communication rule, Disabling the Enabling, Self-Care ABCs, Safety Planning',
      es: 'Técnicas de comunicación CRAFT, Refuerzo positivo, Regla de comunicación PIUS, Desactivar la facilitación, Autocuidado ABC',
    },
    spiritualityApproach: {
      en: 'Secular & Scientific: Behavioral psychology and motivational strategies with zero spiritual requirements.',
      es: 'Secular y Científico: Psicología conductual y estrategias motivacionales sin requisitos espirituales.',
    },
    recoveryApproach: {
      en: 'Behavioral Reinforcement: Uses CRAFT to reinforce sober/positive behaviors while stepping back from negative behaviors without confrontation.',
      es: 'Refuerzo Conductual: Utiliza CRAFT para reforzar conductas positivas y abstinentes sin confrontaciones ni ultimátums.',
    },
    moudAcceptance: {
      en: '100% Affirming: Strongly endorses evidence-based medical treatment, MOUD, naloxone carrying, and harm reduction practices.',
      es: '100% Afirmativo: Respalda fuertemente el tratamiento médico basado en evidencia, MOUD, porte de naloxona y reducción de daños.',
    },
    meetingStructure: {
      en: 'Trained volunteer facilitator, CRAFT topic presentation, tool application, and interactive discussion with helpful cross-talk.',
      es: 'Facilitador capacitado, presentación de temas CRAFT, aplicación de herramientas y diálogo constructivo interactivo.',
    },
  },
];

// Ephemeral in-RAM state
let currentState = {
  philosophy: 'all',
  format: 'all',
  moudAffirmingOnly: false,
  viewMode: 'directory', // 'directory' or 'matrix'
};

const activeFinders = new Set();

/**
 * Filter Mutual Aid Programs based on criteria
 */
export function filterMutualAidPrograms(options) {
  const { philosophy = 'all', format = 'all', moudAffirmingOnly = false } = options || {};
  return MUTUAL_AID_PROGRAMS.filter((prog) => {
    if (philosophy && philosophy !== 'all') {
      const phils = Array.isArray(prog.philosophies) ? prog.philosophies : [prog.philosophy];
      if (!phils.includes(philosophy)) {
        return false;
      }
    }
    if (format && format !== 'all') {
      if (format === 'online_247' && !prog.hasOnline247) {
        return false;
      }
      if (format === 'local_finder' && !prog.hasLocalFinder) {
        return false;
      }
    }
    if (moudAffirmingOnly && !prog.isMoudAffirming) {
      return false;
    }
    return true;
  });
}

/**
 * Get ephemeral in-RAM state
 */
export function getMutualAidState() {
  return { ...currentState };
}

/**
 * Reset ephemeral in-RAM state
 */
export function resetMutualAidState() {
  currentState = {
    philosophy: 'all',
    format: 'all',
    moudAffirmingOnly: false,
    viewMode: 'directory',
  };
  for (const finder of activeFinders) {
    if (typeof finder.reset === 'function') {
      try {
        finder.reset();
      } catch {
        /* safety */
      }
    }
  }
}

/**
 * Bilingual resolver helper
 */
function tr(en, es) {
  return getLang() === 'es' ? es : en;
}

function resolveText(val) {
  if (!val) return '';
  if (typeof val === 'string') return val;
  return getLang() === 'es' ? (val.es || val.en || '') : (val.en || val.es || '');
}

/**
 * Interactive Mutual Aid & Peer Support Directory Component
 */
export function mutualAidFinder(options = {}) {
  const containerId = options.id || 'mutual-aid-finder';
  const headingId = `${containerId}-title`;

  // Main container
  const container = h(
    'section',
    {
      class: 'card mutual-aid-finder print-handout',
      id: containerId,
      role: 'region',
      'aria-labelledby': headingId,
    }
  );

  // Header
  const headerEl = h(
    'div',
    { class: 'facility-head' },
    h('h3', { id: headingId, class: 'facility-name' }, icon('check'), ' ', tr('Mutual Aid & Peer Support Directory', 'Directorio de Grupos de Apoyo Mutuo y Pares')),
    h('p', { class: 'mutual-aid-intro help' }, tr(
      'Recovery looks different for everyone. Compare evidence-based secular, mindfulness, harm reduction, and 12-step communities to find the peer support that fits your pathway.',
      'La recuperación es única para cada persona. Compare comunidades seculares basadas en evidencia, de atención plena, de reducción de daños y de 12 pasos para encontrar el apoyo que mejor se adapte a usted.'
    ))
  );

  // Form controls container
  const filtersForm = h('form', {
    class: 'filters filters-mutual-aid no-print',
    onsubmit: (e) => e.preventDefault(),
  });

  const filtersInner = h('div', { class: 'filters-inner' });

  // 1. Philosophy Filter
  const philSelectId = `${containerId}-filter-phil`;
  const philSelect = h(
    'select',
    {
      id: philSelectId,
      class: 'input',
      'aria-label': tr('Filter by recovery philosophy', 'Filtrar por filosofía de recuperación'),
      onchange: (e) => {
        currentState.philosophy = e.target.value;
        updateResults();
      },
    },
    h('option', { value: 'all' }, tr('All Philosophies (Overview)', 'Todas las filosofías (Vista general)')),
    h('option', { value: 'secular' }, tr('Secular / CBT & REBT (SMART, LifeRing)', 'Secular / TCC y TREC (SMART, LifeRing)')),
    h('option', { value: 'mindfulness' }, tr('Mindfulness & Buddhist-Based (Recovery Dharma, Refuge)', 'Atención Plena y Budismo (Recovery Dharma, Refuge)')),
    h('option', { value: 'moud_affirming' }, tr('Harm Reduction & MOUD-Affirming (MARA, DRA)', 'Reducción de Daños y MOUD (MARA, DRA)')),
    h('option', { value: 'twelve_step' }, tr('12-Step Fellowships (AA, NA, CA, Al-Anon)', 'Comunidades de 12 Pasos (AA, NA, CA, Al-Anon)')),
    h('option', { value: 'family_allies' }, tr('Family, Loved Ones & Allies (Al-Anon, Nar-Anon, SMART F&F)', 'Familiares y Aliados (Al-Anon, Nar-Anon, SMART F&F)'))
  );
  philSelect.value = currentState.philosophy;

  const philGroup = h(
    'div',
    { class: 'filter-group' },
    h('label', { for: philSelectId }, tr('Recovery Philosophy', 'Filosofía de recuperación')),
    philSelect
  );

  // 2. Format Filter
  const formatSelectId = `${containerId}-filter-fmt`;
  const formatSelect = h(
    'select',
    {
      id: formatSelectId,
      class: 'input',
      'aria-label': tr('Filter by meeting format', 'Filtrar por formato de reunión'),
      onchange: (e) => {
        currentState.format = e.target.value;
        updateResults();
      },
    },
    h('option', { value: 'all' }, tr('All Meeting Formats', 'Todos los formatos')),
    h('option', { value: 'online_247' }, tr('24/7 Online / Zoom Drop-in Meetings', 'Reuniones en línea / Zoom 24/7')),
    h('option', { value: 'local_finder' }, tr('Local In-Person Meeting Finder', 'Directorio de reuniones presenciales locales'))
  );
  formatSelect.value = currentState.format;

  const formatGroup = h(
    'div',
    { class: 'filter-group' },
    h('label', { for: formatSelectId }, tr('Meeting Format', 'Formato de reunión')),
    formatSelect
  );

  // 3. MOUD Affirming Checkbox
  const moudCheckId = `${containerId}-filter-moud`;
  const moudCheckbox = h('input', {
    type: 'checkbox',
    id: moudCheckId,
    onchange: (e) => {
      currentState.moudAffirmingOnly = e.target.checked;
      updateResults();
    },
  });
  moudCheckbox.checked = currentState.moudAffirmingOnly;

  const moudLabel = h(
    'label',
    { class: 'checkbox-label', for: moudCheckId },
    moudCheckbox,
    ' ',
    h('strong', null, tr('MOUD-Affirming Only', 'Solo afirmativo de MOUD')),
    h('span', { class: 'help-inline' }, tr(
      ' (Welcomes buprenorphine, methadone, and prescribed medications without stigma)',
      ' (Acepta buprenorfina, metadona y medicamentos recetados sin estigma)'
    ))
  );

  const moudGroup = h('div', { class: 'filter-group' }, moudLabel);

  // 4. Reset Button & View Mode Tab Controls
  const resetButton = h(
    'button',
    {
      type: 'button',
      class: 'btn btn-ghost btn-small',
      id: `${containerId}-reset-btn`,
      onclick: () => {
        resetMutualAidState();
        if (typeof options.onReset === 'function') {
          options.onReset();
        }
      },
    },
    icon('x'),
    ' ',
    tr('Reset Filters', 'Restablecer filtros')
  );

  // View switch tabs
  const tabDirBtn = h(
    'button',
    {
      type: 'button',
      role: 'tab',
      id: `${containerId}-tab-dir`,
      class: currentState.viewMode === 'directory' ? 'btn btn-primary btn-small' : 'btn btn-ghost btn-small',
      'aria-selected': currentState.viewMode === 'directory',
      onclick: () => {
        currentState.viewMode = 'directory';
        tabDirBtn.className = 'btn btn-primary btn-small';
        tabDirBtn.setAttribute('aria-selected', 'true');
        tabMatrixBtn.className = 'btn btn-ghost btn-small';
        tabMatrixBtn.setAttribute('aria-selected', 'false');
        updateResults();
      },
    },
    tr('Program Directory Cards', 'Tarjetas del directorio')
  );

  const tabMatrixBtn = h(
    'button',
    {
      type: 'button',
      role: 'tab',
      id: `${containerId}-tab-matrix`,
      class: currentState.viewMode === 'matrix' ? 'btn btn-primary btn-small' : 'btn btn-ghost btn-small',
      'aria-selected': currentState.viewMode === 'matrix',
      onclick: () => {
        currentState.viewMode = 'matrix';
        tabMatrixBtn.className = 'btn btn-primary btn-small';
        tabMatrixBtn.setAttribute('aria-selected', 'true');
        tabDirBtn.className = 'btn btn-ghost btn-small';
        tabDirBtn.setAttribute('aria-selected', 'false');
        updateResults();
      },
    },
    tr('Evidence-Based Comparison Matrix', 'Matriz comparativa basada en evidencia')
  );

  const viewTabs = h(
    'div',
    { class: 'tabs mutual-aid-tabs', role: 'tablist', 'aria-label': tr('Directory View Mode', 'Modo de visualización') },
    tabDirBtn,
    tabMatrixBtn
  );

  const controlsRow = h('div', { class: 'filter-group actions' }, resetButton, viewTabs);

  filtersInner.append(philGroup, formatGroup, moudGroup, controlsRow);
  filtersForm.append(filtersInner);

  // Results status container
  const statusEl = h('div', { class: 'active-filters', role: 'status', 'aria-live': 'polite' });

  // Dynamic content container
  const contentEl = h('div', { class: 'mutual-aid-content' });

  // Update DOM function
  function updateResults() {
    clear(contentEl);
    clear(statusEl);

    // Sync form controls with state
    philSelect.value = currentState.philosophy;
    formatSelect.value = currentState.format;
    moudCheckbox.checked = currentState.moudAffirmingOnly;
    tabDirBtn.setAttribute('aria-selected', currentState.viewMode === 'directory');
    tabDirBtn.className = currentState.viewMode === 'directory' ? 'btn btn-primary btn-small' : 'btn btn-ghost btn-small';
    tabMatrixBtn.setAttribute('aria-selected', currentState.viewMode === 'matrix');
    tabMatrixBtn.className = currentState.viewMode === 'matrix' ? 'btn btn-primary btn-small' : 'btn btn-ghost btn-small';

    const matches = filterMutualAidPrograms({
      philosophy: currentState.philosophy,
      format: currentState.format,
      moudAffirmingOnly: currentState.moudAffirmingOnly,
    });

    const statusMessage = tr(
      `Showing ${matches.length} of ${MUTUAL_AID_PROGRAMS.length} peer recovery programs`,
      `Mostrando ${matches.length} de ${MUTUAL_AID_PROGRAMS.length} programas de apoyo mutuo`
    );
    statusEl.append(statusMessage);
    announce(statusMessage);

    if (matches.length === 0) {
      const emptyNotice = h(
        'div',
        { class: 'callout callout-warn' },
        h('p', { class: 'callout-title' }, icon('alert'), ' ', tr('No Programs Found', 'No se encontraron programas')),
        h('p', null, tr(
          'No mutual aid programs matched your filter criteria. Try resetting your filters to explore all pathways.',
          'Ningún programa de apoyo mutuo coincide con sus criterios de búsqueda. Intente restablecer los filtros para explorar todos los caminos.'
        )),
        h('button', {
          type: 'button',
          class: 'btn btn-secondary btn-small',
          onclick: () => {
            resetMutualAidState();
            if (typeof options.onReset === 'function') options.onReset();
          },
        }, tr('Show All Programs', 'Mostrar todos los programas'))
      );
      contentEl.append(emptyNotice);
      return;
    }

    if (currentState.viewMode === 'directory') {
      // Directory Cards View
      const grid = h('div', { class: 'mutual-aid-grid' });
      for (const prog of matches) {
        const card = buildProgramCard(prog);
        grid.append(card);
      }
      contentEl.append(grid);
    } else {
      // Comparison Matrix View
      const matrix = buildComparisonMatrix(matches);
      contentEl.append(matrix);
    }
  }

  function buildProgramCard(prog) {
    const card = h('article', {
      class: 'card facility print-handout mutual-aid-card',
      id: `prog-${prog.id}`,
    });

    // Chips
    const chips = h('ul', { class: 'chips' });

    // Philosophy chips
    for (const philId of prog.philosophies) {
      const phil = MUTUAL_AID_PHILOSOPHIES[philId];
      if (phil) {
        chips.append(h('li', { class: 'chip chip-care' }, resolveText(phil.name)));
      }
    }

    // MOUD status chip
    if (prog.isMoudAffirming) {
      chips.append(
        h(
          'li',
          { class: 'chip chip-ok', title: resolveText(prog.moudAcceptance) },
          icon('check'),
          ' ',
          tr('MOUD-Affirming', 'Afirmativo de MOUD')
        )
      );
    } else {
      chips.append(
        h(
          'li',
          { class: 'chip chip-warn', title: resolveText(prog.moudAcceptance) },
          icon('alert'),
          ' ',
          tr('Group-Dependent MOUD', 'MOUD dependiente del grupo')
        )
      );
    }

    // Format chips
    if (prog.hasOnline247) {
      chips.append(h('li', { class: 'chip chip-primary' }, tr('24/7 Online Drop-in', 'En línea 24/7')));
    }
    if (prog.hasLocalFinder) {
      chips.append(h('li', { class: 'chip chip-secondary' }, tr('In-Person Finder', 'Buscador presencial')));
    }

    const head = h(
      'div',
      { class: 'facility-head' },
      h('h4', { class: 'facility-name' }, `${prog.name} (${prog.acronym})`),
      chips
    );

    // Description & clinical details
    const desc = h('p', { class: 'facility-desc' }, resolveText(prog.description));

    const toolsBox = h(
      'div',
      { class: 'callout callout-info' },
      h('p', null,
        h('strong', null, tr('Key Tools & Framework: ', 'Herramientas y marco clave: ')),
        resolveText(prog.keyTools)
      )
    );

    const detailsList = h(
      'ul',
      { class: 'mutual-aid-details' },
      h('li', null, h('strong', null, tr('Spirituality & Beliefs: ', 'Espiritualidad y creencias: ')), resolveText(prog.spiritualityApproach)),
      h('li', null, h('strong', null, tr('Recovery Goal: ', 'Meta de recuperación: ')), resolveText(prog.recoveryApproach)),
      h('li', null, h('strong', null, tr('Medications & MOUD: ', 'Medicamentos y MOUD: ')), resolveText(prog.moudAcceptance)),
      h('li', null, h('strong', null, tr('Meeting Structure: ', 'Estructura de reunión: ')), resolveText(prog.meetingStructure))
    );

    // External action button
    const actions = h(
      'div',
      { class: 'actions' },
      ext(prog.websiteUrl, icon('pin'), ' ', tr(`Find ${prog.name} Meetings`, `Buscar reuniones de ${prog.name}`))
    );

    card.append(head, desc, toolsBox, detailsList, actions);
    return card;
  }

  function buildComparisonMatrix(programs) {
    const tableWrap = h('div', { class: 'table-wrap' });
    const table = h(
      'table',
      { class: 'words-table mutual-aid-matrix-table', role: 'table' },
      h('caption', { class: 'visually-hidden' }, tr(
        'Evidence-Based Mutual Aid Community Comparison Matrix',
        'Matriz comparativa de comunidades de ayuda mutua basada en evidencia'
      )),
      h(
        'thead',
        null,
        h(
          'tr',
          null,
          h('th', { scope: 'col' }, tr('Community', 'Comunidad')),
          h('th', { scope: 'col' }, tr('Spirituality & Higher Power', 'Espiritualidad y Poder Superior')),
          h('th', { scope: 'col' }, tr('Abstinence vs Harm Reduction', 'Abstinencia vs Reducción de Daños')),
          h('th', { scope: 'col' }, tr('Medication Acceptance (MOUD)', 'Aceptación de Medicación (MOUD)')),
          h('th', { scope: 'col' }, tr('Meeting Format & Etiquette', 'Formato y Etiqueta de Reunión'))
        )
      )
    );

    const tbody = h('tbody', null);

    for (const prog of programs) {
      const moudBadge = prog.isMoudAffirming
        ? h('span', { class: 'chip chip-ok' }, icon('check'), ' ', tr('Affirming', 'Afirmativo'))
        : h('span', { class: 'chip chip-warn' }, icon('alert'), ' ', tr('Group-Dependent', 'Variable según grupo'));

      const row = h(
        'tr',
        null,
        h(
          'th',
          { scope: 'row' },
          h('strong', null, prog.name),
          ' ',
          h('span', { class: 'badge-acronym' }, `(${prog.acronym})`),
          h('div', { class: 'actions' },
            ext(prog.websiteUrl, icon('pin'), ' ', tr('Meetings', 'Reuniones'))
          )
        ),
        h('td', null, resolveText(prog.spiritualityApproach)),
        h('td', null, resolveText(prog.recoveryApproach)),
        h('td', null, moudBadge, h('p', { class: 'help-inline' }, resolveText(prog.moudAcceptance))),
        h('td', null, resolveText(prog.meetingStructure))
      );
      tbody.append(row);
    }

    table.append(tbody);
    tableWrap.append(table);
    return tableWrap;
  }

  container.append(headerEl, filtersForm, statusEl, contentEl);

  // Initial render
  updateResults();

  // Register reset handler for instance
  const instance = {
    el: container,
    reset: () => {
      updateResults();
    },
  };
  activeFinders.add(instance);

  return container;
}
