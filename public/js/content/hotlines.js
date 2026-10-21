import { t } from '../i18n.js';

// Verified October 2026 against each service's own site. Keep this list short
// and national; local lines belong in a facility listing.
//
// Text is read through getters so it follows the active language. Pick lines by
// `id`, never by name. `spanish: true` marks lines whose own site confirms
// service in Spanish (shown as a badge in Spanish):
//   988: dial 988 and press 2, or text AYUDA to 988 (988lifeline.org/es)
//   Crisis Text Line: text AYUDA to 741741 (crisistextline.org/es)
//   SAMHSA: English and Spanish (samhsa.gov .../linea-nacional-ayuda)
//   Partnership: Spanish helpline, text CONECTAR to 55753 (drugfree.org/recursos-en-espanol)
//   Trans Lifeline: press 2 for Spanish (translifeline.org/es/linea-de-ayuda)
//   Domestic Violence Hotline: Spanish site and service (espanol.thehotline.org)
//   Maternal Mental Health Hotline: English and Spanish (mchb.hrsa.gov/es/...)
export const HOTLINES = {
  crisis: [
    {
      id: '988',
      spanish: true,
      get name() { return t('hotline.988.name', '988 Suicide & Crisis Lifeline'); },
      get desc() { return t('hotline.988.desc', 'Call, text, or chat 24/7 for any mental health, emotional, or substance use crisis.'); },
      get call() { return { number: '988', label: t('hotline.988.call', 'Call 988') }; },
      get text() { return { number: '988', body: t('hotline.988.textBody', '') || undefined, label: t('hotline.988.text', 'Text 988') }; },
      get web() { return t('url.hotline.988', 'https://chat.988lifeline.org/'); },
      get webLabel() { return t('hotline.988.web', 'Chat online'); },
    },
    {
      id: 'crisis-text-line',
      spanish: true,
      name: 'Crisis Text Line',
      get desc() { return t('hotline.ctl.desc', 'Text with a trained crisis counselor, 24/7.'); },
      get text() { return { number: '741741', body: t('hotline.ctl.textBody', 'HOME'), label: t('hotline.ctl.text', 'Text HOME to 741741') }; },
      get web() { return t('url.hotline.ctl', 'https://www.crisistextline.org/'); },
    },
    {
      id: 'veterans',
      get name() { return t('hotline.vcl.name', 'Veterans Crisis Line'); },
      get desc() { return t('hotline.vcl.desc', 'For veterans, service members, and their families.'); },
      get call() { return { number: '988', label: t('hotline.vcl.call', 'Dial 988, then press 1') }; },
      get text() { return { number: '838255', label: t('hotline.vcl.text', 'Text 838255') }; },
      get web() { return t('url.hotline.vcl', 'https://www.veteranscrisisline.net/'); },
    },
  ],
  substanceUse: [
    {
      id: 'samhsa',
      spanish: true,
      get name() { return t('hotline.samhsa.name', 'SAMHSA National Helpline'); },
      get desc() { return t('hotline.samhsa.desc', 'Free, confidential treatment referrals and information, 24/7, in English and Spanish.'); },
      call: { number: '18006624357', label: '1-800-662-4357' },
      get web() { return t('url.hotline.samhsa', 'https://www.samhsa.gov/find-help/helplines/national-helpline'); },
    },
    {
      id: 'never-use-alone',
      name: 'Never Use Alone',
      get desc() { return t('hotline.nua.desc', 'Using alone? Call first. An operator stays on the line and sends emergency help to the address you give if you stop responding.'); },
      call: { number: '18004843731', label: '1-800-484-3731' },
      web: 'https://neverusealone.com/',
    },
    {
      id: 'safespot',
      name: 'SafeSpot',
      get desc() { return t('hotline.safespot.desc', 'Free, confidential 24/7 overdose prevention line staffed by people with lived experience. If you stop responding, they contact someone you choose or EMS.'); },
      call: { number: '18009720590', label: '1-800-972-0590' },
      web: 'https://safe-spot.me/',
    },
    {
      id: 'poison',
      get name() { return t('hotline.poison.name', 'Poison Help'); },
      get desc() { return t('hotline.poison.desc', 'Free expert advice 24/7 about a medication, drug, or chemical exposure.'); },
      call: { number: '18002221222', label: '1-800-222-1222' },
      web: 'https://www.poison.org/',
    },
    {
      id: 'partnership',
      spanish: true,
      get name() { return t('hotline.partnership.name', 'Partnership to End Addiction Helpline'); },
      get desc() { return t('hotline.partnership.desc', 'One-on-one support for parents and caregivers worried about a loved one’s substance use.'); },
      call: { number: '18553784373', label: '1-855-378-4373' },
      get text() { return { number: '55753', body: t('hotline.partnership.textBody', 'CONNECT'), label: t('hotline.partnership.text', 'Text CONNECT to 55753') }; },
      get web() { return t('url.hotline.partnership', 'https://drugfree.org/article/helpline-get-one-on-one-help/'); },
    },
  ],
  communities: [
    {
      id: 'trevor',
      name: 'The Trevor Project',
      get desc() { return t('hotline.trevor.desc', '24/7 crisis support for LGBTQ+ young people.'); },
      call: { number: '18664887386', label: '1-866-488-7386' },
      get text() { return { number: '678678', body: 'START', label: t('hotline.trevor.text', 'Text START to 678-678') }; },
      web: 'https://www.thetrevorproject.org/get-help/',
    },
    {
      id: 'trans-lifeline',
      spanish: true,
      name: 'Trans Lifeline',
      get desc() { return t('hotline.translifeline.desc', 'Peer support run by and for trans people. Check the website for current hours.'); },
      call: { number: '18775658860', label: '1-877-565-8860' },
      get web() { return t('url.hotline.translifeline', 'https://translifeline.org/'); },
    },
    {
      id: 'domestic-violence',
      spanish: true,
      get name() { return t('hotline.dv.name', 'National Domestic Violence Hotline'); },
      get desc() { return t('hotline.dv.desc', 'Confidential support 24/7 for anyone experiencing abuse.'); },
      call: { number: '18007997233', label: '1-800-799-7233' },
      get text() { return { number: '88788', body: 'START', label: t('hotline.dv.text', 'Text START to 88788') }; },
      get web() { return t('url.hotline.dv', 'https://www.thehotline.org/'); },
    },
    {
      id: 'maternal',
      spanish: true,
      get name() { return t('hotline.maternal.name', 'National Maternal Mental Health Hotline'); },
      get desc() { return t('hotline.maternal.desc', 'Call or text 24/7. For pregnant and postpartum people and their families, in English and Spanish.'); },
      call: { number: '18338526262', label: '1-833-852-6262' },
      get text() { return { number: '18338526262', label: t('hotline.maternal.text', 'Text 1-833-852-6262') }; },
      get web() { return t('url.hotline.maternal', 'https://mchb.hrsa.gov/national-maternal-mental-health-hotline'); },
    },
  ],
};

/** Lines from any group, by id, in the order given. */
export function hotlinesById(...ids) {
  const all = Object.values(HOTLINES).flat();
  return ids.map((id) => all.find((l) => l.id === id)).filter(Boolean);
}
