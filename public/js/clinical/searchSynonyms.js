/**
 * Clinical synonym map and payment labels for the finder.
 * Pure data. Runs in the browser; typed text never leaves the page.
 * Keys are filter ids Data Providers' matching branch should use.
 * Synonyms are lowercase; matchers should normalize accents and case.
 *
 * Clinical rules:
 * - "detox" / "desintoxicación" → medically supervised withdrawal (DT), never alone for opioids in pregnancy.
 * - "suboxone" / "subutex" / "zubsolv" / "bunavail" → bup (BU). "methadone" / "dolophine" → methadone/OTP.
 * - "vivitrol" → naltrexoneXR only (not oral naltrexone).
 * - "narcan" / "Kloxxado" / "RiVive" / "Zimhi" → naloxone education filter, not a treatment program type.
 * - "tranq" / "xylazine" / "medetomidine" → do NOT invent a SAMHSA code; surface wound-care + MOUD guidance instead.
 * - Pregnancy words never become URL params; they only set an in-memory filter.
 */
export const SEARCH_SYNONYMS = {
  // English
  suboxone: 'bup',
  subutex: 'bup',
  zubsolv: 'bup',
  bunavail: 'bup',
  buprenorphine: 'bup',
  bup: 'bup',
  methadone: 'methadone',
  dolophine: 'methadone',
  otp: 'methadone',
  vivitrol: 'naltrexoneXR',
  'extended-release naltrexone': 'naltrexoneXR',
  'xr-ntx': 'naltrexoneXR',
  naltrexone: 'naltrexone',
  narcan: 'naloxone',
  naloxone: 'naloxone',
  kloxxado: 'naloxone',
  rivive: 'naloxone',
  zimhi: 'naloxone',
  detox: 'withdrawal',
  'withdrawal management': 'withdrawal',
  'medically supervised withdrawal': 'withdrawal',
  pregnant: 'pregnantPostpartum',
  pregnancy: 'pregnantPostpartum',
  postpartum: 'pregnantPostpartum',
  perinatal: 'pregnantPostpartum',
  teen: 'youth',
  teens: 'youth',
  adolescent: 'youth',
  adolescents: 'youth',
  youth: 'youth',
  telehealth: 'telehealth',
  telemedicine: 'telehealth',
  'phone visit': 'telehealth',
  'video visit': 'telehealth',
  medicaid: 'pay.medicaid',
  medicare: 'pay.medicare',
  'sliding scale': 'pay.sliding',
  'sliding-fee': 'pay.sliding',
  'free care': 'pay.free',
  'no insurance': 'pay.noInsurance',
  uninsured: 'pay.noInsurance',
  // Spanish
  metadona: 'methadone',
  buprenorfina: 'bup',
  suboxona: 'bup',
  naloxona: 'naloxone',
  desintoxicacion: 'withdrawal',
  desintoxicación: 'withdrawal',
  abstinencia: 'withdrawal',
  embarazada: 'pregnantPostpartum',
  embarazo: 'pregnantPostpartum',
  posparto: 'pregnantPostpartum',
  adolescente: 'youth',
  adolescentes: 'youth',
  jovenes: 'youth',
  jóvenes: 'youth',
  telesalud: 'telehealth',
  telemedicina: 'telehealth',
  'escala variable': 'pay.sliding',
  'pago segun ingresos': 'pay.sliding',
  'pago según ingresos': 'pay.sliding',
  'atencion gratuita': 'pay.free',
  'atención gratuita': 'pay.free',
  'sin seguro': 'pay.noInsurance',
};

/** Plain-language payment labels. English fallback; Spanish via i18n keys. */
export const PAYMENT_LABELS = {
  'pay.medicaid': {
    en: 'Accepts Medicaid',
    i18n: 'pay.medicaid',
    esDraft: 'Acepta Medicaid',
  },
  'pay.medicare': {
    en: 'Accepts Medicare',
    i18n: 'pay.medicare',
    esDraft: 'Acepta Medicare',
  },
  'pay.sliding': {
    en: 'Sliding-scale fees (cost based on income)',
    i18n: 'pay.sliding',
    esDraft: 'Tarifa según ingresos',
  },
  'pay.free': {
    en: 'Free care available',
    i18n: 'pay.free',
    esDraft: 'Atención gratuita disponible',
  },
  'pay.noInsurance': {
    en: 'Serves people with no insurance',
    i18n: 'pay.noInsurance',
    esDraft: 'Atiende a personas sin seguro',
  },
  'pay.private': {
    en: 'Private insurance',
    i18n: 'pay.private',
    esDraft: 'Seguro privado',
  },
};

/** Words that must NOT invent a SAMHSA service code. Surface clinical guidance instead. */
export const GUIDANCE_ONLY_TERMS = {
  tranq: 'xylazine',
  xylazine: 'xylazine',
  medetomidine: 'xylazine',
  'tranq dope': 'xylazine',
  fentanilo: 'opioids',
  fentanyl: 'opioids',
};
