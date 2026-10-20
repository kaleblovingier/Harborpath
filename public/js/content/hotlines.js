// Verified October 2026 against each service's own site. Keep this list short
// and national; local lines belong in a facility listing.
export const HOTLINES = {
  crisis: [
    {
      name: '988 Suicide & Crisis Lifeline',
      desc: 'Call, text, or chat 24/7 for any mental health, emotional, or substance use crisis.',
      call: { number: '988', label: 'Call 988' },
      text: { number: '988', label: 'Text 988' },
      web: 'https://chat.988lifeline.org/',
      webLabel: 'Chat online',
    },
    {
      name: 'Crisis Text Line',
      desc: 'Text with a trained crisis counselor, 24/7.',
      text: { number: '741741', body: 'HOME', label: 'Text HOME to 741741' },
      web: 'https://www.crisistextline.org/',
    },
    {
      name: 'Veterans Crisis Line',
      desc: 'For veterans, service members, and their families.',
      call: { number: '988', label: 'Dial 988, then press 1' },
      text: { number: '838255', label: 'Text 838255' },
      web: 'https://www.veteranscrisisline.net/',
    },
  ],
  substanceUse: [
    {
      name: 'SAMHSA National Helpline',
      desc: 'Free, confidential treatment referrals and information, 24/7, in English and Spanish.',
      call: { number: '18006624357', label: '1-800-662-4357' },
      web: 'https://www.samhsa.gov/find-help/helplines/national-helpline',
    },
    {
      name: 'Never Use Alone',
      desc: 'Using alone? Call first. An operator stays on the line and sends emergency help to the address you give if you stop responding.',
      call: { number: '18004843731', label: '1-800-484-3731' },
      web: 'https://neverusealone.com/',
    },
    {
      name: 'SafeSpot',
      desc: 'Free, confidential 24/7 overdose prevention line staffed by people with lived experience. If you stop responding, they contact someone you choose or EMS.',
      call: { number: '18009720590', label: '1-800-972-0590' },
      web: 'https://safe-spot.me/',
    },
    {
      name: 'Poison Help',
      desc: 'Free expert advice 24/7 about a medication, drug, or chemical exposure.',
      call: { number: '18002221222', label: '1-800-222-1222' },
      web: 'https://www.poison.org/',
    },
    {
      name: 'Partnership to End Addiction Helpline',
      desc: 'One-on-one support for parents and caregivers worried about a loved one’s substance use.',
      call: { number: '18553784373', label: '1-855-378-4373' },
      text: { number: '55753', body: 'CONNECT', label: 'Text CONNECT to 55753' },
      web: 'https://drugfree.org/article/helpline-get-one-on-one-help/',
    },
  ],
  communities: [
    {
      name: 'The Trevor Project',
      desc: '24/7 crisis support for LGBTQ+ young people.',
      call: { number: '18664887386', label: '1-866-488-7386' },
      text: { number: '678678', body: 'START', label: 'Text START to 678-678' },
      web: 'https://www.thetrevorproject.org/get-help/',
    },
    {
      name: 'Trans Lifeline',
      desc: 'Peer support run by and for trans people. Check the website for current hours.',
      call: { number: '18775658860', label: '1-877-565-8860' },
      web: 'https://translifeline.org/',
    },
    {
      name: 'National Domestic Violence Hotline',
      desc: 'Confidential support 24/7 for anyone experiencing abuse.',
      call: { number: '18007997233', label: '1-800-799-7233' },
      text: { number: '88788', body: 'START', label: 'Text START to 88788' },
      web: 'https://www.thehotline.org/',
    },
    {
      name: 'National Maternal Mental Health Hotline',
      desc: 'Call or text 24/7. For pregnant and postpartum people and their families, in English and Spanish.',
      call: { number: '18338526262', label: '1-833-852-6262' },
      text: { number: '18338526262', label: 'Text 1-833-852-6262' },
      web: 'https://mchb.hrsa.gov/national-maternal-mental-health-hotline',
    },
  ],
};
