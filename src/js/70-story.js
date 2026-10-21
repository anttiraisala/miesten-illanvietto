// Story: episodes 1-8 wiring (cards, cutscenes, minigames, outcomes)

const say = (who, text) => ({ who, text });
const nar = (text) => ({ narr: true, text });
const cast3 = (v, xs, flipLast) => ['tuomas', 'antti', 'rauno'].map((c, i) => ({ c, x: xs[i], v, flip: flipLast && i === 2 }));
const go = (scene) => Scenes.go(scene);

const EP = {
  1: { title: 'Meeting Up', time: '14:00', music: 'day', suggest: 'antti',
    text: 'A parking lot. A sunny Saturday. Three men with a plan: they do not have a plan.' },
  2: { title: 'Toys for Grown-ups', time: '15:30', music: 'day', suggest: 'tuomas',
    text: 'Tuomas unpacks the RC car and the drone. Rauno prepares to explain the physics. Antti prepares to be unimpressed.' },
  3: { title: 'Löyly', time: '17:30', music: 'sauna', suggest: 'rauno',
    text: 'The great equalizer. Three men, one stove, and a towel policy of limited ambition.' },
  4: { title: 'The Kitchen', time: '19:30', music: 'kitchen', suggest: 'antti',
    text: 'Antti steps up to the stove. Fire, steel and sausage. Everyone else steps back.' },
  5: { title: 'Poker Night', time: '21:30', music: 'poker', suggest: 'tuomas',
    text: 'Chips, cards and psychological warfare. No money is lost, only pride.' },
  6: { title: 'To the Restaurant', time: '23:30', music: 'restaurant', suggest: 'rauno',
    text: 'The evening moves to the pub. The beer flows. Standards drop. Stories grow.' },
  7: { title: 'The Way Home', time: '02:00', music: 'night', suggest: 'antti',
    text: 'The streets are quiet. The friends are not.' },
};
const EP_START = {};
function episodeCard(n) {
  const e = EP[n];
  return Card({ ep: n, title: e.title, time: e.time, text: e.text, suggest: e.suggest, music: e.music, next: () => EP_START[n]() });
}

// ---------- episode 1 ----------
EP_START[1] = () => Cutscene({
  bg: t => BG.lot(t, 'day'), floor: BG.FLOOR.lot, music: 'day',
  cast: cast3('out', [130, 240, 350], true),
  steps: [
    nar('A parking lot somewhere in Finland. Saturday, 14:00. Three men, three hats, zero plans.'),
    say('tuomas', 'Gentlemen. I have brought the RC car, the drone, and an unreasonable number of batteries.'),
    say('rauno', 'I have brought my intellect, and a charger for those batteries, which you forgot. You are welcome.'),
    say('antti', 'I have brought my good frying pan. Please nobody ask why.'),
    say('tuomas', 'Why?'),
    say('antti', 'It has been waiting for this evening.'),
    {
      choice: ["Let's get beer first.", "Let's drive the RC car first!", 'I love you guys. (A bit early.)'], text: 'The evening begins. What does {P} say?',
      on: (i) => {
        if (i === 0) { addMood(3); return [say('antti', 'A wise man. Beer first, always.')]; }
        if (i === 1) { addMood(2); return [say('tuomas', 'FINALLY someone with taste!')]; }
        addMood(2); return [say('rauno', 'That sentiment is statistically premature, but noted with warmth.'), say('antti', '...I love you too. Now, beer.')];
      },
    },
    nar('First stop: the shop. The evening needs supplies.'),
  ],
  onEnd: () => go(ShopScene({ done: () => go(episodeCard(2)) })),
});

// ---------- episode 2 ----------
EP_START[2] = () => Cutscene({
  bg: t => BG.yard(t, 'day'), floor: BG.FLOOR.yard, music: 'day',
  cast: cast3('out', [110, 230, 350], true),
  steps: [
    say('tuomas', 'Behold. A 1:10 scale monster of speed. It has a name. The name is Kevin.'),
    say('rauno', 'Kevin possesses an admirable power-to-weight ratio. The steering geometry, however, is aspirational.'),
    say('antti', 'Can it carry a sausage?'),
    say('tuomas', 'Do NOT put a sausage on Kevin.'),
    nar('Obstacle course time. Drive through the checkpoints in order. Cones are not your friends. Tuomas drives best, but you can switch any time (C).'),
  ],
  onEnd: () => go(RCScene({
    done: (r) => go(Cutscene({
      bg: t => BG.yard(t, 'day'), floor: BG.FLOOR.yard, music: 'day', cast: cast3('out', [110, 230, 350], true),
      steps: [
        say('rauno', 'Elapsed time: ' + r.time.toFixed(1) + ' seconds. I award a rating of ' + r.rating + '. ' + (r.hits > 3 ? 'The cones have filed a complaint.' : 'The cones are cautiously optimistic.')),
        say('tuomas', r.rating === 'S' || r.rating === 'A' ? 'Kevin is proud. I am proud. Everyone is proud.' : 'Kevin was not at fault. The course was.'),
        say('antti', 'Fine. But can we eat soon?'),
        say('tuomas', 'Not before the drone. The drone is non-negotiable.'),
        nar('The drone comes out of its case. Fly through all five rings and land on the pad. Trees are... present.'),
      ],
      onEnd: () => go(DroneScene({
        done: (d) => go(Cutscene({
          bg: t => BG.yard(t, 'day'), floor: BG.FLOOR.yard, music: 'day', cast: cast3('out', [110, 230, 350], true),
          steps: d.landed ? [
            say('rauno', 'A perfect landing. I want it on record that this was not luck. It was a little bit of luck.'),
            say('tuomas', 'I told you. Precision.'),
            say('antti', 'Suspicious.'),
          ] : d.tree ? [
            say('rauno', 'We have just witnessed a classic case in which angular velocity exceeded the pilot\'s reaction time.'),
            say('tuomas', 'The tree jumped out at me.'),
            say('antti', 'Trees do not jump.'),
            say('tuomas', 'This one did.'),
            nar('The drone remains in the tree. It will be retrieved at a later date. Possibly with a ladder. Possibly with prayer.'),
          ] : [
            say('rauno', 'The drone has returned to the ground by means other than landing. This is called a crash.'),
            say('tuomas', 'It was a very dramatic landing.'),
            say('antti', 'Sauna?'),
            say('tuomas', 'Sauna.'),
          ],
          onEnd: () => go(episodeCard(3)),
        })),
      })),
    })),
  })),
});

// ---------- episode 3: sauna ----------
function saunaCast(v) { return [{ c: 'tuomas', x: 110, v: v || 'sauna', y: 190 }, { c: 'antti', x: 190, v: v || 'sauna', y: 190 }, { c: 'rauno', x: 270, v: v || 'sauna', y: 190 }]; }
function saunaBg(t) { BG.sauna(t); }
function saunaFg() { rect(40, 188, 280, 10, '#8a5a30'); rect(40, 188, 280, 2, '#a8723d'); rect(40, 198, 280, 24, '#63401f'); }
let compIdx = 0;
function complimentRound() {
  const traits = { tuomas: 'Your toys make grown men weep with joy.', antti: 'You can make a sausage taste like a love letter.', rauno: 'You speak like a Nobel laureate who also fixes my Wi-Fi.' };
  return [
    { fn: () => { const o = others(); G.flags.target = o[compIdx++ % 2]; } },
    nar('{P}, tell {T} something nice. Sauna rules: total honesty, mild exaggeration.'),
    {
      choice: () => NAMES.map(c => traits[c]), text: 'What does {P} say to {T}?',
      on: (i) => {
        const trait = NAMES[i], target = G.flags.target;
        if (trait === target) {
          addMood(6); Snd.sfx('love'); G.flags.complimentsOK = (G.flags.complimentsOK || 0) + 1;
          if (!G.flags.complimentLogged) { G.flags.complimentLogged = true; logEvent('compliment', nm(G.player) + ' told ' + nm(target) + ' exactly the right nice thing. Manly tears were blamed on the steam.', true); }
          return [say(target, target === 'tuomas' ? '...I might cry. It is the steam.' : target === 'antti' ? 'Brother.' : 'That is objectively the nicest thing anyone has said to me. Please repeat it for the record.')];
        }
        addMood(1);
        if (trait === G.player) return [say(trait === 'rauno' ? 'tuomas' : 'rauno', nm(G.player) + ' just complimented ' + nm(G.player) + '. Bold. Confidence noted.')];
        return [say(target, '...That was about ' + nm(trait) + '. But thanks?')];
      },
    },
  ];
}
EP_START[3] = () => Cutscene({
  bg: saunaBg, fg: saunaFg, floor: 190, bust: true, music: 'sauna', cast: saunaCast(),
  steps: [
    nar('The sauna: 80 degrees. The mood: 100 percent. Towels: present, arguably.'),
    say('antti', '{P}, you throw the löyly. It is a sacred responsibility.'),
    say('rauno', 'Physics dictates that water on hot stones becomes steam rapidly. I shall not elaborate. I shall elaborate.'),
    say('tuomas', 'Please do not elaborate.'),
  ],
  onEnd: () => go(steamGame()),
});
function steamGame() {
  const puffs = [];
  return TimingScene({
    title: 'THROW THE LÖYLY', hint: 'Press A when the marker is in the green zone', rounds: 5, zoneW: 0.2, speed: 1.2, music: 'sauna',
    bg: saunaBg, floor: 190, bust: true, cast: saunaCast(),
    texts: { hit: 'Perfect löyly! Aaah...', low: 'Weak splash. The stones are unimpressed.', high: 'TOO MUCH! A wall of steam. Everyone wheezes.' },
    expr: (c, st) => (st.hits >= 2 ? 'hot' : undefined),
    fg: saunaFg,
    onGrade: (g, i, st) => {
      if (g === 'hit') { Snd.sfx('steam'); addMood(3); for (let k = 0; k < 14; k++) puffs.push({ x: rnd(340, 440), y: 130, vy: rnd(15, 40), vx: rnd(-30, -5), life: rnd(1.2, 2.2) }); }
      else if (g === 'high') { Snd.sfx('hot'); addMood(-2); for (let k = 0; k < 24; k++) puffs.push({ x: rnd(330, 450), y: 130, vy: rnd(30, 60), vx: rnd(-80, -10), life: rnd(1.5, 2.5) }); }
      else Snd.sfx('bad');
    },
    extra: (t) => {
      puffs.forEach(p => { p.x += p.vx * 0.016; p.y -= p.vy * 0.016; p.life -= 0.016; circle(p.x, p.y, 4 + (2 - p.life) * 2, 'rgba(255,255,255,' + clamp(p.life / 3, 0, 0.5) + ')'); });
      for (let i = puffs.length - 1; i >= 0; i--) if (puffs[i].life <= 0) puffs.splice(i, 1);
    },
    done: (grades) => {
      const hits = grades.filter(g => g === 'hit').length;
      logEvent('steam', 'The löyly was thrown ' + grades.length + ' times. ' + hits + ' of them were perfect. The rest were interpreted as character.', hits >= 3);
      go(Cutscene({
        bg: saunaBg, fg: saunaFg, floor: 190, bust: true, music: 'sauna', cast: saunaCast(),
        steps: [
          say('rauno', hits >= 4 ? 'A flawless thermal performance.' : hits >= 2 ? 'Acceptable. The stones have no complaints.' : 'I have seen better steam in a kettle.'),
          nar('Now: the ancient sauna ritual. Who can endure the heat the longest? Mash A to stay on the bench!'),
        ],
        onEnd: () => go(EnduranceScene({
          done: () => go(Cutscene({
            bg: saunaBg, fg: saunaFg, floor: 190, bust: true, music: 'sauna', cast: saunaCast(),
            steps: [
              say(G.flags.saunaWinner || 'antti', 'I won. I will not be humble about it.'),
              nar('In the sauna, honesty comes easy. And so do compliments.'),
              { fn: () => complimentRound() },
              { fn: () => complimentRound() },
              nar('Out of the sauna. The evening air. Three men in towels, suddenly emotional.'),
            ],
            onEnd: () => go(HugScene({ done: () => go(porchScene()) })),
          })),
        })),
      }));
    },
  });
}
function porchScene() {
  return Cutscene({
    bg: t => BG.porch(t, 'eve'), floor: BG.FLOOR.porch, music: 'sauna',
    cast: [{ c: 'tuomas', x: 130, v: 'sauna' }, { c: 'antti', x: 240, v: 'sauna' }, { c: 'rauno', x: 350, v: 'sauna', flip: true }],
    steps: [
      { fn: () => { drinkAll(1); Snd.sfx('clink'); logEvent('porch', 'Three men, three beers, one lake. Nobody spoke. Everything was said.', true); } },
      nar('Cold beer on the porch. The lake is calm. Time stands still for eleven seconds.'),
      say('antti', 'Best sauna ever.'),
      say('rauno', 'Subjective, but I concur.'),
      say('tuomas', 'Cheers, boys.'),
    ],
    onEnd: () => go(episodeCard(4)),
  });
}

// ---------- episode 4: kitchen ----------
function kitchenCast() { return [{ c: 'tuomas', x: 150, v: 'in' }, { c: 'antti', x: 240, v: 'in' }, { c: 'rauno', x: 330, v: 'in', flip: true }]; }
EP_START[4] = () => Cutscene({
  bg: t => BG.kitchen(t), floor: BG.FLOOR.kitchen, music: 'kitchen', cast: kitchenCast(),
  steps: [
    say('antti', 'Stand back. I am cooking.'),
    say('rauno', 'I have set a timer. It will not help, but it is there for moral support.'),
    say('tuomas', 'Can I help?'),
    say('antti', 'You can hold the beer.'),
    ...(G.flags.noSausage ? [say('rauno', 'We did not buy sausages.'), say('antti', '...Emergency noodles it is.')] : []),
    nar(G.shop.onion ? 'First the onions: mash A to chop. Then fry: take each piece off when the bar is green. Antti cooks best.' : 'Fry: take each piece off when the bar is in the green zone. Antti cooks best.'),
  ],
  onEnd: () => go(CookScene({
    done: (r) => go(Cutscene({
      bg: t => BG.kitchen(t), floor: BG.FLOOR.kitchen, music: 'kitchen', cast: kitchenCast(),
      steps: [
        ...(r.pct > 0.8 ? [say('rauno', 'I have rarely seen a sausage this golden. This is, scientifically, art.'), say('tuomas', 'I would like to marry this dinner.')]
          : r.burnt >= 2 ? [say('tuomas', 'This is... crunchy.'), say('rauno', 'The carbon content is impressive.'), say('antti', 'It is rustic.')]
          : [say('antti', 'Edible. Possibly good. Eat.'), say('rauno', 'Acceptable nutrition.')]),
        { fn: () => {
          if (!G.flags.herring) return [];
          const good = Math.random() < 0.5;
          addMood(good ? 4 : -4);
          return [say('antti', 'I also added the herring.'), say('rauno', good ? '...It works. I do not understand why, but it works.' : 'I have questions. They will remain unanswered.')];
        } },
        { fn: () => { drinkAll(1); Snd.sfx('clink'); } },
        nar('Dinner is eaten in near silence, the highest compliment. Another beer is opened.'),
      ],
      onEnd: () => go(episodeCard(5)),
    })),
  })),
});

// ---------- episode 5: poker at home ----------
function livingCast() { return [{ c: 'tuomas', x: 140, v: 'in' }, { c: 'antti', x: 240, v: 'in' }, { c: 'rauno', x: 340, v: 'in', flip: true }]; }
EP_START[5] = () => Cutscene({
  bg: t => BG.living(t), floor: BG.FLOOR.living, music: 'poker', cast: livingCast(),
  steps: [
    say('tuomas', 'Texas hold\'em, light edition. The winner gets eternal bragging rights.'),
    say('antti', 'I am going to take all of your chips.'),
    say('rauno', 'I shall call everything. This is my strategy.'),
    nar('Read your friends: Tuomas bluffs a lot. Antti only bets with strong hands. Rauno calls everything and rarely raises. Six hands. Switch character between hands with C.'),
  ],
  onEnd: () => go(PokerScene({ hands: 6, venue: 'home', music: 'poker', done: (w) => go(Cutscene({
    bg: t => BG.living(t), floor: BG.FLOOR.living, music: 'poker', cast: livingCast(),
    steps: [
      say(w, w === 'antti' ? 'I told you. All your chips are mine.' : w === 'tuomas' ? 'Skill. Pure skill. Also a little bluffing.' : 'I... won? By calling everything? Unbelievable.'),
      say(others(w)[0], 'This game is rigged.'),
      say(others(w)[1], 'It is cards. It is always rigged.'),
      nar('Time to leave the house. The restaurant is calling.'),
    ],
    onEnd: () => go(episodeCard(6)),
  })) })),
});

// ---------- episode 6: restaurant ----------
EP_START[6] = () => {
  const events = [
    () => [
      nar('A seagull swoops down and steals the last sausage from Antti\'s hand!'),
      say('antti', 'NOT THE SAUSAGE!'),
      { choice: ['Chase the seagull!', 'Let it go.', 'Calculate the trajectory (Rauno style).'], text: 'What does {P} do?',
        on: (i) => {
          if (i === 0) { addMood(3); logEvent('seagull', 'A seagull stole a sausage. A grown man ran after it in the dark. The seagull won.', true); return [nar('{P} sprints after the seagull. The seagull is faster. The seagull is always faster. The effort is appreciated.')]; }
          if (i === 1) { addMood(1); return [say('antti', '...It was a good sausage.')]; }
          addMood(2); return [say('rauno', 'Trajectory suggests it landed on that roof. Probability of recovery: zero.'), say('tuomas', 'Thank you, Professor.')];
        } },
    ],
    () => [
      nar('A stray cat blocks the sidewalk and silently judges everyone.'),
      { choice: ['Pet the cat.', 'Bow respectfully.', 'Ignore the cat. Walk past with dignity.'], text: 'What does {P} do?',
        on: (i) => {
          if (i === 0) { addMood(4); logEvent('cat', 'A stray cat was petted on the way to the pub. It accepted the tribute.', true); return [nar('The cat purrs. Three grown men melt.')]; }
          if (i === 1) { addMood(3); return [say('rauno', 'One should always respect an apex predator.')]; }
          addMood(0); return [nar('The cat watches. The cat remembers.')];
        } },
    ],
    () => [
      nar('A kebab stand glows like an oasis in the night.'),
      { choice: ['Buy kebab for everybody.', 'Resist. We have a pub to reach.', 'Tuomas orders for everybody (he always does).'], text: 'What does {P} do?',
        on: (i) => {
          if (i === 0) { addMood(4); addHunger(-12); logEvent('kebab', 'Kebab was acquired on the way to the pub. It was not the last kebab.', true); return [say('antti', 'Brother. You complete me.')]; }
          if (i === 1) { addMood(1); return [say('rauno', 'A disciplined choice. I admire it and resent it.')]; }
          addMood(3); addHunger(-8); return [say('tuomas', 'Three kebabs. Extra sauce. Do not argue.')];
        } },
    ],
  ];
  const ev = pick(events)();
  return Cutscene({
    bg: t => BG.street(t, 'night'), floor: BG.FLOOR.street, music: 'restaurant',
    cast: [{ c: 'tuomas', x: 150, v: 'out', walk: true }, { c: 'antti', x: 240, v: 'out', walk: true }, { c: 'rauno', x: 330, v: 'out', walk: true, flip: false }],
    steps: [
      nar('Midnight approaches. The pub glows in the distance like a greasy lighthouse.'),
      say('rauno', 'According to my calculations, we arrive in four minutes, assuming no incidents.'),
      ...ev,
      nar('The pub. The neon sign flickers. A waitress nods at them like old friends.'),
    ],
    onEnd: () => go(Cutscene({
      bg: t => BG.restaurant(t), floor: BG.FLOOR.restaurant, music: 'restaurant', cast: [{ c: 'tuomas', x: 150, v: 'out' }, { c: 'antti', x: 240, v: 'out' }, { c: 'rauno', x: 330, v: 'out' }],
      steps: [
        say('antti', 'Three beers, please. The big ones.'),
        say('tuomas', 'To the best day of the year!'),
        nar('Time to clink glasses. Press A when the marker is in the green zone. Three rounds.'),
      ],
      onEnd: () => go(cheersGame()),
    })),
  });
};
function cheersGame() {
  const sparks = [];
  return TimingScene({
    title: 'CHEERS!', hint: 'Press A when the glasses meet in the green zone', rounds: 3, zoneW: 0.22, speed: 1.35, music: 'restaurant',
    bg: t => BG.restaurant(t), floor: 196,
    cast: [{ c: 'tuomas', x: 120, v: 'out' }, { c: 'antti', x: 240, v: 'out' }, { c: 'rauno', x: 360, v: 'out' }],
    texts: { hit: 'CLINK! Perfect cheers.', low: 'Too early. Beer on the table.', high: 'Too late. Glass meets elbow.' },
    onGrade: (g) => {
      drinkAll(1);
      if (g === 'hit') { Snd.sfx('clink'); addMood(3); for (let i = 0; i < 12; i++) sparks.push({ x: 240 + rnd(-10, 10), y: 100, vx: rnd(-60, 60), vy: rnd(-70, -10), life: 0.8 }); }
      else { Snd.sfx('bad'); addMood(-1); }
    },
    extra: (t, st) => {
      [[170, 110], [240, 100], [310, 110]].forEach((p, i) => {
        rect(p[0] - 9, p[1] - 4 + Math.sin(t * 3 + i) * 2, 18, 24, '#f0b030'); rect(p[0] - 9, p[1] - 8 + Math.sin(t * 3 + i) * 2, 18, 6, '#fff');
      });
      sparks.forEach(s => { s.x += s.vx * 0.016; s.y += s.vy * 0.016; s.vy += 3; s.life -= 0.016; rect(s.x, s.y, 2, 2, '#fff7a8'); });
      for (let i = sparks.length - 1; i >= 0; i--) if (sparks[i].life <= 0) sparks.splice(i, 1);
    },
    done: (grades) => {
      const hits = grades.filter(g => g === 'hit').length;
      logEvent('cheers', 'Three rounds of cheers were attempted. ' + hits + ' of them resulted in clinking. The rest resulted in napkins.', hits >= 2);
      go(Cutscene({
        bg: t => BG.restaurant(t), floor: BG.FLOOR.restaurant, music: 'restaurant', cast: [{ c: 'tuomas', x: 150, v: 'out' }, { c: 'antti', x: 240, v: 'out' }, { c: 'rauno', x: 330, v: 'out' }],
        steps: [
          say('tuomas', 'Cards?'),
          say('antti', 'Cards.'),
          say('rauno', 'I shall call anything.'),
          nar('A second poker round at the pub. Four hands. The beer is starting to show.'),
        ],
        onEnd: () => go(PokerScene({ hands: 4, venue: 'restaurant', music: 'restaurant', done: (w) => go(Cutscene({
          bg: t => BG.restaurant(t), floor: BG.FLOOR.restaurant, music: 'restaurant', cast: [{ c: 'tuomas', x: 150, v: 'out' }, { c: 'antti', x: 240, v: 'out' }, { c: 'rauno', x: 330, v: 'out' }],
          steps: [
            say(w, 'The pub champion has spoken. Another round on the loser.'),
            say(others(w)[0], 'I demand a rematch. At some point.'),
            nar('Last orders. The night is long, the walk home longer.'),
          ],
          onEnd: () => go(episodeCard(7)),
        })) })),
      }));
    },
  });
}

// ---------- episode 7: the way home ----------
EP_START[7] = () => Cutscene({
  bg: t => BG.street(t, 'night'), floor: BG.FLOOR.street, music: 'night',
  cast: [{ c: 'tuomas', x: 150, v: 'out', walk: true }, { c: 'antti', x: 240, v: 'out', walk: true }, { c: 'rauno', x: 330, v: 'out', walk: true }],
  steps: [
    nar('Two in the morning. The streets are empty. The friends are not.'),
    say('antti', 'I love this city.'),
    say('rauno', 'You are standing in a puddle.'),
    say('antti', 'I love this puddle.'),
    { fn: () => {
      const wob = NAMES.some(c => G.bac[c] > 0.55);
      if (wob) { logEvent('lamp', 'Tuomas attempted to hug a lamp post. The lamp post was a good listener.', true); return [say('tuomas', 'This lamp post understands me.'), say('rauno', 'Tuomas. That is a lamp post.'), say('tuomas', 'Yes. A great one.')]; }
      return [say('tuomas', 'Best day. No notes.')];
    } },
    say('rauno', 'I have ordered a taxi. It will arrive in five minutes, which in Finnish means twenty.'),
  ],
  onEnd: () => go(Cutscene({
    bg: t => BG.car(t), floor: 196, music: 'night', bust: true, noMarker: true,
    cast: [{ c: 'antti', x: 240, v: 'out', y: 150 }, { c: 'rauno', x: 140, v: 'out', y: 196 }, { c: 'tuomas', x: 340, v: 'out', y: 196 }],
    steps: [
      nar('The taxi arrives. Antti takes the back seat, as nature intended.'),
      say('tuomas', 'That was the best day ever.'),
      say('rauno', 'A sentiment I can support empirically.'),
      say('antti', 'Same time next month?'),
      say('tuomas', 'Obviously.'),
      { fn: () => { logEvent('ride', 'Three friends in a taxi at 3 a.m., already planning the next one.', true); } },
      nar('Three friends. One evening. Zero regrets (ask again tomorrow).'),
    ],
    onEnd: () => go(morningCard()),
  })),
});

function morningCard() {
  const avg = NAMES.reduce((a, c) => a + G.bac[c], 0) / 3;
  const txt = avg < 0.3 ? 'Surprisingly fresh. Someone forgot to drink. (Or drank wisely.)' : avg < 0.6 ? 'A mild headache and a very clear sense of satisfaction.' : 'A legendary hangover. Worth every minute.';
  return Card({ ep: 8, title: 'Next Morning', time: '10:30', text: txt, music: 'night', next: () => CreditsScene(), note: 'Roll credits...' });
}

window.__scenes = { title: TitleScene, card: episodeCard, ep: n => EP_START[n](), shop: () => ShopScene({ done: () => go(episodeCard(2)) }), credits: () => CreditsScene(), morning: morningCard };
