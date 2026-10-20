import { h, clear, ext, tel, icon } from '../dom.js';

// Steps follow SAMHSA's Overdose Prevention and Response Toolkit (2023) and CDC
// guidance: call 911, give naloxone, support breathing, recovery position,
// stay, and re-dose if there is no response after 2–3 minutes.
const OPIOID_STEPS = [
  {
    title: 'Check for overdose signs',
    body: [
      'Shout their name and rub hard on the middle of their chest with your knuckles.',
      'Look for: no response, slow or stopped breathing, gurgling or snoring sounds, pinpoint pupils, limp body, cold or clammy skin.',
      'Lips and fingertips may turn blue or gray. On darker skin, check the lips, gums, and nail beds for a gray or ashen color.',
    ],
    note: 'If you are not sure, treat it as an overdose. Naloxone will not harm someone who has not taken opioids.',
  },
  {
    title: 'Call 911',
    body: [
      'Say: "Someone is unresponsive and not breathing." Give the exact address.',
      'You can put the phone on speaker and keep helping.',
    ],
    call: true,
    note: 'Every state and DC has some form of Good Samaritan law that offers legal protection to people who call for help during an overdose. Protections vary by state.',
  },
  {
    title: 'Give naloxone',
    body: [
      'Nasal spray: lay them on their back, tilt the head back, put the nozzle fully into one nostril, and press the plunger.',
      'Injectable: inject into the outer thigh or upper arm muscle. It can go through clothing.',
      'Start the timer below as soon as you give the first dose.',
    ],
    timer: true,
  },
  {
    title: 'Support their breathing',
    body: [
      'If you are trained: tilt the head back, lift the chin, pinch the nose, and give 1 breath every 5 seconds.',
      'If there is no breathing and no pulse, start CPR. The 911 dispatcher can coach you.',
    ],
  },
  {
    title: 'No response after 2–3 minutes? Give another dose',
    body: [
      'Use a new device in the other nostril. Keep going with breaths between doses.',
      'Strong opioids like fentanyl sometimes need more than one dose.',
    ],
  },
  {
    title: 'Put them in the recovery position and stay',
    body: [
      'Once they are breathing, roll them onto their side with the top knee bent and the head tilted back slightly so they won’t choke.',
      'Stay until help arrives. Naloxone wears off in 30–90 minutes, and the overdose can come back.',
      'When they wake up they may be in withdrawal, confused, or upset. Stay calm, explain what happened, and discourage them from using again right away.',
    ],
  },
];

const SEDATIVE_NOTE = [
  'Xylazine (“tranq”) and medetomidine are animal sedatives now found in much of the fentanyl supply. Naloxone does not reverse them, ',
  'but you should still give it, because fentanyl is almost always present. The goal is breathing, not waking up: someone can breathe ',
  'on their own and still be very sedated. Call 911, keep supporting breathing, and use the recovery position.',
].join('');

const STIMULANT_STEPS = [
  {
    title: 'Know the signs of a stimulant overdose (“overamping”)',
    body: [
      'Overheating or a very high temperature, chest pain, racing or irregular heartbeat, trouble breathing.',
      'Seizures, severe headache, extreme agitation, paranoia, or hallucinations.',
    ],
  },
  {
    title: 'Call 911',
    body: ['Chest pain, seizures, a very high temperature, or fainting are emergencies.'],
    call: true,
  },
  {
    title: 'Cool them down and keep things calm',
    body: [
      'Move them somewhere cool and quiet. Use cool, wet cloths on the neck, armpits, and groin. Offer sips of water if they are awake.',
      'Speak calmly, reduce noise and people around them, and avoid restraining them.',
    ],
  },
  {
    title: 'If they have a seizure',
    body: [
      'Clear the space around them and put something soft under their head. Do not hold them down or put anything in their mouth.',
      'Once it stops, roll them onto their side.',
    ],
  },
  {
    title: 'Give naloxone if they are hard to wake or breathing slowly',
    body: [
      'Fentanyl is often mixed into cocaine, methamphetamine, and pressed pills. If breathing slows or they won’t respond, follow the opioid steps.',
    ],
  },
];

function redoseTimer() {
  const SECONDS = 120;
  let remaining = SECONDS;
  let interval = null;

  const display = h('p', { class: 'timer-display', 'aria-hidden': 'true' }, '2:00');
  const live = h('p', { class: 'timer-live', role: 'status', 'aria-live': 'assertive' });
  const startBtn = h('button', { type: 'button', class: 'btn btn-primary' }, icon('clock'), 'Start 2-minute timer');

  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  function stop() {
    clearInterval(interval);
    interval = null;
  }

  function tick() {
    remaining -= 1;
    display.textContent = fmt(Math.max(remaining, 0));
    if (remaining === 60) live.textContent = 'One minute left. Keep supporting their breathing.';
    if (remaining <= 0) {
      stop();
      root.classList.add('timer-done');
      live.textContent = 'Two minutes are up. If they are not breathing normally, give another dose of naloxone in the other nostril, then restart the timer.';
      try { navigator.vibrate?.([300, 150, 300]); } catch { /* not supported */ }
      startBtn.replaceChildren(icon('clock'), 'Restart timer');
    }
  }

  startBtn.addEventListener('click', () => {
    stop();
    remaining = SECONDS;
    root.classList.remove('timer-done');
    display.textContent = fmt(remaining);
    live.textContent = 'Timer started. Keep supporting their breathing.';
    startBtn.replaceChildren(icon('clock'), 'Restart timer');
    interval = setInterval(() => {
      if (!root.isConnected) return stop();
      tick();
    }, 1000);
  });

  const root = h('div', { class: 'timer' }, display, startBtn, live);
  return root;
}

function stepList(steps) {
  return h('ol', { class: 'steps' }, steps.map((s, i) => h('li', { class: 'step' },
    h('div', { class: 'step-num', 'aria-hidden': 'true' }, String(i + 1)),
    h('div', { class: 'step-body' },
      h('h3', null, s.title),
      h('ul', null, s.body.map((b) => h('li', null, b))),
      s.call && h('p', null, tel('911', [icon('phone'), 'Call 911'], { class: 'btn btn-emergency' })),
      s.timer && redoseTimer(),
      s.note && h('p', { class: 'step-note' }, icon('info'), s.note),
    ),
  )));
}

export function overdoseGuide() {
  const panel = h('div', { class: 'od-panel' });
  const tabs = [
    { id: 'opioid', label: 'Opioids (fentanyl, heroin, pills)' },
    { id: 'stimulant', label: 'Stimulants (meth, cocaine)' },
  ];
  const buttons = [];

  function show(id) {
    for (const b of buttons) {
      const on = b.dataset.id === id;
      b.setAttribute('aria-selected', String(on));
      b.tabIndex = on ? 0 : -1;
    }
    clear(panel);
    panel.setAttribute('aria-labelledby', `od-tab-${id}`);
    if (id === 'opioid') {
      panel.append(stepList(OPIOID_STEPS),
        h('div', { class: 'callout callout-info' }, h('p', null, h('strong', null, 'If xylazine or medetomidine may be involved: '), SEDATIVE_NOTE)));
    } else {
      panel.append(stepList(STIMULANT_STEPS),
        h('div', { class: 'callout callout-info' }, h('p', null, 'Naloxone does not reverse stimulants, but it is safe to give and will help if opioids are also involved.')));
    }
  }

  const tablist = h('div', { class: 'tabs', role: 'tablist', 'aria-label': 'Type of overdose' },
    tabs.map((t) => {
      const b = h('button', {
        type: 'button', role: 'tab', id: `od-tab-${t.id}`, class: 'tab',
        'aria-controls': 'od-panel', dataset: { id: t.id },
        onclick: () => show(t.id),
        onkeydown: (e) => {
          if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
          const i = tabs.findIndex((x) => x.id === t.id);
          const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
          show(next.id);
          buttons.find((x) => x.dataset.id === next.id).focus();
        },
      }, t.label);
      buttons.push(b);
      return b;
    }));
  panel.id = 'od-panel';
  panel.setAttribute('role', 'tabpanel');
  show('opioid');

  return h('div', { class: 'overdose' },
    tablist,
    panel,
    h('p', { class: 'source-note' }, 'Based on the ',
      ext('https://library.samhsa.gov/product/overdose-prevention-response-toolkit/pep23-03-00-001', 'SAMHSA Overdose Prevention and Response Toolkit'), ', CDC guidance on ',
      ext('https://www.cdc.gov/overdose-prevention/about/what-you-should-know-about-xylazine.html', 'xylazine'), ' and ',
      ext('https://www.cdc.gov/han/php/notices/han00527.html', 'medetomidine'), '. This is not a substitute for training: ',
      'many health departments and harm reduction programs offer free naloxone training.'),
  );
}

