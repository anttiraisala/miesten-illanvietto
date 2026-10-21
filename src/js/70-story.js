// Story: episodes 1-8 wiring (cards, cutscenes, minigames, outcomes)

const say = (who, text) => ({ who, text });
const nar = (text) => ({ narr: true, text });
const cast3 = (v, xs, flipLast) => ['tuomas', 'antti', 'rauno'].map((c, i) => ({ c, x: xs[i], v, flip: flipLast && i === 2 }));
const go = (scene) => Scenes.go(scene);

const EP = {
  1: { title: 'Tapaaminen', time: '14:00', music: 'day', suggest: 'antti',
    text: 'Parkkipaikka. Aurinkoinen lauantai. Kolme miestä ja suunnitelma: suunnitelmaa ei ole.' },
  2: { title: 'Aikuisten lelut', time: '15:30', music: 'day', suggest: 'tuomas',
    text: 'Tuomas purkaa radio-ohjattavan auton ja dronen. Rauno valmistautuu selittämään fysiikkaa. Antti valmistautuu olemaan ihastumatta.' },
  3: { title: 'Löyly', time: '17:30', music: 'sauna', suggest: 'rauno',
    text: 'Suuri tasoittaja. Kolme miestä, yksi kiuas ja pyyhepolitiikka vaatimattomin tavoittein.' },
  4: { title: 'Keittiö', time: '19:30', music: 'kitchen', suggest: 'antti',
    text: 'Antti astuu liedelle. Tuli, teräs ja makkara. Muut astuvat taaksepäin.' },
  5: { title: 'Pokeri-ilta', time: '21:30', music: 'poker', suggest: 'tuomas',
    text: 'Pelimerkkejä, kortteja ja psykologista sodankäyntiä. Rahaa ei menetetä, vain ylpeys.' },
  6: { title: 'Ravintolaan', time: '23:30', music: 'restaurant', suggest: 'rauno',
    text: 'Ilta siirtyy kuppilaan. Kalja virtaa. Vaatimukset laskevat. Tarinat kasvavat.' },
  7: { title: 'Kotimatka', time: '02:00', music: 'night', suggest: 'antti',
    text: 'Kadut ovat hiljaa. Kaverit eivät.' },
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
    nar('Parkkipaikka jossain Suomessa. Lauantai, kello 14. Kolme miestä, kolme hattua, nolla suunnitelmaa.'),
    say('tuomas', 'Hyvät herrat. Toin radio-ohjattavan auton, dronen ja kohtuuttoman määrän akkuja.'),
    say('rauno', 'Minä toin älyni sekä laturin noille akuille, jonka unohdit. Ole hyvä.'),
    say('antti', 'Minä toin hyvän paistinpannuni. Älköön kukaan kysykö miksi.'),
    say('tuomas', 'Miksi?'),
    say('antti', 'Se on odottanut tätä iltaa.'),
    {
      choice: ['Haetaan ensin kaljaa.', 'Ajetaan ensin radiksella!', 'Rakastan teitä, pojat. (Vähän aikaisin.)'], text: 'Ilta alkaa. Mitä {P} sanoo?',
      on: (i) => {
        if (i === 0) { addMood(3); return [say('antti', 'Viisas mies. Kalja ensin, aina.')]; }
        if (i === 1) { addMood(2); return [say('tuomas', 'VIHDOIN joku, jolla on makua!')]; }
        addMood(2); return [say('rauno', 'Tunnustus on tilastollisesti ennenaikainen, mutta se on huomioitu lämmöllä.'), say('antti', '...Minäkin rakastan sinua. Nyt kuitenkin kaljaa.')];
      },
    },
    nar('Ensimmäinen pysäkki: kauppa. Ilta tarvitsee tarvikkeita.'),
  ],
  onEnd: () => go(ShopScene({ done: () => go(episodeCard(2)) })),
});

// ---------- episode 2 ----------
EP_START[2] = () => Cutscene({
  bg: t => BG.yard(t, 'day'), floor: BG.FLOOR.yard, music: 'day',
  cast: cast3('out', [110, 230, 350], true),
  steps: [
    say('tuomas', 'Katsokaa. Mittakaavan 1:10 nopeuden hirviö. Sillä on nimi. Nimi on Kevin.'),
    say('rauno', 'Kevinin teho-painosuhde on ihailtava. Ohjausgeometria on kuitenkin lähinnä toiveikas.'),
    say('antti', 'Jaksaako se kantaa makkaraa?'),
    say('tuomas', 'Kevinin päälle EI laiteta makkaraa.'),
    nar('Esterata. Aja tarkistuspisteiden läpi järjestyksessä. Kartiot eivät ole ystäviäsi. Tuomas ajaa parhaiten, mutta voit vaihtaa hahmoa milloin vain (C).'),
  ],
  onEnd: () => go(RCScene({
    done: (r) => go(Cutscene({
      bg: t => BG.yard(t, 'day'), floor: BG.FLOOR.yard, music: 'day', cast: cast3('out', [110, 230, 350], true),
      steps: [
        say('rauno', 'Kulunut aika: ' + r.time.toFixed(1).replace('.', ',') + ' sekuntia. Arvosanaksi annan ' + r.rating + '. ' + (r.hits > 3 ? 'Kartiot ovat tehneet valituksen.' : 'Kartiot ovat varovaisen toiveikkaita.')),
        say('tuomas', r.rating === 'S' || r.rating === 'A' ? 'Kevin on ylpeä. Minä olen ylpeä. Kaikki ovat ylpeitä.' : 'Kevin ei ollut syyllinen. Rata oli.'),
        say('antti', 'Selvä. Mutta voidaanko syödä pian?'),
        say('tuomas', 'Ei ennen dronea. Drone ei ole neuvoteltavissa.'),
        nar('Drone tulee esiin kotelostaan. Lennä kaikkien viiden renkaan läpi ja laskeudu alustalle. Puita on... paikalla.'),
      ],
      onEnd: () => go(DroneScene({
        done: (d) => go(Cutscene({
          bg: t => BG.yard(t, 'day'), floor: BG.FLOOR.yard, music: 'day', cast: cast3('out', [110, 230, 350], true),
          steps: d.landed ? [
            say('rauno', 'Täydellinen laskeutuminen. Haluan pöytäkirjaan, ettei se ollut tuuria. Se oli vähän tuuria.'),
            say('tuomas', 'Sanoinhan. Tarkkuutta.'),
            say('antti', 'Epäilyttävää.'),
          ] : d.tree ? [
            say('rauno', 'Todistimme juuri klassisen tapauksen, jossa kulmanopeus ylitti lentäjän reaktioajan.'),
            say('tuomas', 'Puu hyppäsi eteeni.'),
            say('antti', 'Puut eivät hyppää.'),
            say('tuomas', 'Tämä hyppäsi.'),
            nar('Drone jää puuhun. Se haetaan pois myöhemmin. Ehkä tikkailla. Ehkä rukoilemalla.'),
          ] : [
            say('rauno', 'Drone on palannut maahan muulla kuin laskeutumisen keinoin. Tätä kutsutaan putoamiseksi.'),
            say('tuomas', 'Se oli hyvin dramaattinen laskeutuminen.'),
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
  const traits = { tuomas: 'Leluistasi aikuiset miehet itkevät ilosta.', antti: 'Sinä osaat saada makkaran maistumaan rakkauskirjeeltä.', rauno: 'Puhut kuin Nobel-voittaja, joka korjaa myös wifini.' };
  return [
    { fn: () => { const o = others(); G.flags.target = o[compIdx++ % 2]; } },
    nar('{P}, sano {T:all} jotain kivaa. Saunan säännöt: täysi rehellisyys, lievä liioittelu.'),
    {
      choice: () => NAMES.map(c => traits[c]), text: 'Mitä {P} sanoo {T:all}?',
      on: (i) => {
        const trait = NAMES[i], target = G.flags.target;
        if (trait === target) {
          addMood(6); Snd.sfx('love'); G.flags.complimentsOK = (G.flags.complimentsOK || 0) + 1;
          if (!G.flags.complimentLogged) { G.flags.complimentLogged = true; logEvent('compliment', nm(G.player) + ' sanoi ' + nf(target, 'all') + ' juuri sen oikean kauniin asian. Miehekkäät kyyneleet kaadettiin löylyn piikkiin.', true); }
          return [say(target, target === 'tuomas' ? '...Taidan itkeä. Se on se löyly.' : target === 'antti' ? 'Veli.' : 'Se on objektiivisesti kaunein asia, jonka kukaan on minulle sanonut. Toista se pöytäkirjaan.')];
        }
        addMood(1);
        if (trait === G.player) return [say(trait === 'rauno' ? 'tuomas' : 'rauno', nm(G.player) + ' kehui juuri itseään. Rohkeaa. Itseluottamus huomattu.')];
        return [say(target, '...Tuo oli ' + nf(trait, 'gen') + ' juttu. Mutta kiitos?')];
      },
    },
  ];
}
EP_START[3] = () => Cutscene({
  bg: saunaBg, fg: saunaFg, floor: 190, bust: true, music: 'sauna', cast: saunaCast(),
  steps: [
    nar('Sauna: 80 astetta. Tunnelma: 100 prosenttia. Pyyhkeet: paikalla, kai.'),
    say('antti', '{P}, sinä heität löylyt. Se on pyhä vastuu.'),
    say('rauno', 'Fysiikan mukaan vesi kuumilla kivillä muuttuu nopeasti höyryksi. En tarkenna. Tarkennan.'),
    say('tuomas', 'Älä tarkenna.'),
  ],
  onEnd: () => go(steamGame()),
});
function steamGame() {
  const puffs = [];
  return TimingScene({
    title: 'HEITÄ LÖYLYÄ', hint: 'Paina A, kun merkki on vihreällä alueella', rounds: 5, zoneW: 0.2, speed: 1.2, music: 'sauna',
    bg: saunaBg, floor: 190, bust: true, cast: saunaCast(),
    texts: { hit: 'Täydellinen löyly! Aaah...', low: 'Heikko molaus. Kivet eivät vaikutu.', high: 'LIIKAA! Höyryseinä. Kaikki hengästyvät.' },
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
      logEvent('steam', 'Löylyä heitettiin ' + grades.length + ' kertaa. ' + hits + ' niistä oli täydellistä. Loput tulkittiin luonteenpiirteiksi.', hits >= 3);
      go(Cutscene({
        bg: saunaBg, fg: saunaFg, floor: 190, bust: true, music: 'sauna', cast: saunaCast(),
        steps: [
          say('rauno', hits >= 4 ? 'Moitteeton lämpösuoritus.' : hits >= 2 ? 'Hyväksyttävä. Kivillä ei ole huomauttamista.' : 'Olen nähnyt parempaa höyryä vedenkeittimessä.'),
          nar('Nyt: muinainen saunarituaali. Kuka kestää kuumuutta pisimpään? Hakkaa A:ta pysyäksesi lauteilla!'),
        ],
        onEnd: () => go(EnduranceScene({
          done: () => go(Cutscene({
            bg: saunaBg, fg: saunaFg, floor: 190, bust: true, music: 'sauna', cast: saunaCast(),
            steps: [
              say(G.flags.saunaWinner || 'antti', 'Voitin. En aio olla nöyrä siitä.'),
              nar('Saunassa rehellisyys tulee helposti. Samoin kehut.'),
              { fn: () => complimentRound() },
              { fn: () => complimentRound() },
              nar('Ulos saunasta. Iltailma. Kolme miestä pyyhkeissä, yhtäkkiä herkistyneinä.'),
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
      { fn: () => { drinkAll(1); Snd.sfx('clink'); logEvent('porch', 'Kolme miestä, kolme kaljaa, yksi järvi. Kukaan ei puhunut. Kaikki tuli sanottua.', true); } },
      nar('Kylmä kalja kuistilla. Järvi on tyyni. Aika pysähtyy yhdentoista sekunnin ajaksi.'),
      say('antti', 'Paras sauna ikinä.'),
      say('rauno', 'Subjektiivista, mutta olen samaa mieltä.'),
      say('tuomas', 'Kippis, pojat.'),
    ],
    onEnd: () => go(episodeCard(4)),
  });
}

// ---------- episode 4: kitchen ----------
function kitchenCast() { return [{ c: 'tuomas', x: 150, v: 'in' }, { c: 'antti', x: 240, v: 'in' }, { c: 'rauno', x: 330, v: 'in', flip: true }]; }
EP_START[4] = () => Cutscene({
  bg: t => BG.kitchen(t), floor: BG.FLOOR.kitchen, music: 'kitchen', cast: kitchenCast(),
  steps: [
    say('antti', 'Takaisin. Minä keitän.'),
    say('rauno', 'Olen asettanut ajastimen. Se ei auta, mutta se on tukena moraalisesti.'),
    say('tuomas', 'Voinko auttaa?'),
    say('antti', 'Voit pitää kaljaa.'),
    ...(G.flags.noSausage ? [say('rauno', 'Emme ostaneet makkaraa.'), say('antti', '...Hätänuudelit sitten.')] : []),
    nar(G.shop.onion ? 'Ensin sipulit: hakkaa A:ta pilkkoaksesi. Sitten paisto: ota kukin pala pois, kun palkki on vihreä. Antti kokkaa parhaiten.' : 'Paisto: ota kukin pala pois, kun palkki on vihreällä alueella. Antti kokkaa parhaiten.'),
  ],
  onEnd: () => go(CookScene({
    done: (r) => go(Cutscene({
      bg: t => BG.kitchen(t), floor: BG.FLOOR.kitchen, music: 'kitchen', cast: kitchenCast(),
      steps: [
        ...(r.pct > 0.8 ? [say('rauno', 'Harvoin olen nähnyt näin kullanruskeaa makkaraa. Tämä on tieteellisesti taidetta.'), say('tuomas', 'Haluaisin naimisiin tämän illallisen kanssa.')]
          : r.burnt >= 2 ? [say('tuomas', 'Tämä on... rapeaa.'), say('rauno', 'Hiilipitoisuus on vaikuttava.'), say('antti', 'Se on rustiikkista.')]
          : [say('antti', 'Syötävää. Mahdollisesti hyvää. Syökää.'), say('rauno', 'Hyväksyttävää ravintoa.')]),
        { fn: () => {
          if (!G.flags.herring) return [];
          const good = Math.random() < 0.5;
          addMood(good ? 4 : -4);
          return [say('antti', 'Lisäsin myös silakan.'), say('rauno', good ? '...Se toimii. En ymmärrä miksi, mutta se toimii.' : 'Minulla on kysymyksiä. Ne jäävät vastaamatta.')];
        } },
        { fn: () => { drinkAll(1); Snd.sfx('clink'); } },
        nar('Illallinen syödään lähes hiljaisuudessa, mikä on korkein kehu. Avataan vielä yksi kalja.'),
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
    say('tuomas', 'Texas hold\'em, kevytversio. Voittaja saa ikuiset leuhkimisoikeudet.'),
    say('antti', 'Aion viedä kaikki teidän pelimerkkinne.'),
    say('rauno', 'Maksan kaiken. Se on strategiani.'),
    nar('Lue kavereitasi: Tuomas bluffaa paljon. Antti panostaa vain vahvoilla käsillä. Rauno maksaa kaiken ja korottaa harvoin. Kuusi kättä. Vaihda hahmoa käsien välillä C:llä.'),
  ],
  onEnd: () => go(PokerScene({ hands: 6, venue: 'home', music: 'poker', done: (w) => go(Cutscene({
    bg: t => BG.living(t), floor: BG.FLOOR.living, music: 'poker', cast: livingCast(),
    steps: [
      say(w, w === 'antti' ? 'Sanoin. Kaikki pelimerkkinne ovat minun.' : w === 'tuomas' ? 'Taitoa. Puhdasta taitoa. Ja vähän bluffausta.' : 'Minä... voitin? Maksamalla kaiken? Uskomatonta.'),
      say(others(w)[0], 'Tämä peli on viritetty.'),
      say(others(w)[1], 'Kyse on korteista. Ne ovat aina viritettyjä.'),
      nar('Aika lähteä talosta. Ravintola kutsuu.'),
    ],
    onEnd: () => go(episodeCard(6)),
  })) })),
});

// ---------- episode 6: restaurant ----------
EP_START[6] = () => {
  const events = [
    () => [
      nar('Lokki syöksyy alas ja varastaa viimeisen makkaran Antin kädestä!'),
      say('antti', 'EI MAKKARAA!'),
      { choice: ['Jahtaa lokkia!', 'Anna olla.', 'Laske lentorata (Raunon tyyliin).'], text: 'Mitä {P} tekee?',
        on: (i) => {
          if (i === 0) { addMood(3); logEvent('seagull', 'Lokki varasti makkaran. Aikuinen mies juoksi sen perässä pimeässä. Lokki voitti.', true); return [nar('{P} syöksyy lokin perään. Lokki on nopeampi. Lokki on aina nopeampi. Yritys arvostetaan.')]; }
          if (i === 1) { addMood(1); return [say('antti', '...Se oli hyvä makkara.')]; }
          addMood(2); return [say('rauno', 'Lentoradan mukaan se laskeutui tuolle katolle. Palautuksen todennäköisyys: nolla.'), say('tuomas', 'Kiitos, professori.')];
        } },
    ],
    () => [
      nar('Kulkukissa tukkii jalkakäytävän ja tuomitsee kaikki hiljaa.'),
      { choice: ['Silitä kissaa.', 'Kumarra kunnioittavasti.', 'Älä välitä kissasta. Kävele ohi arvokkaasti.'], text: 'Mitä {P} tekee?',
        on: (i) => {
          if (i === 0) { addMood(4); logEvent('cat', 'Kulkukissaa silitettiin matkalla kuppilaan. Se otti kunnianosoituksen vastaan.', true); return [nar('Kissa kehrää. Kolme aikuista miestä sulaa.')]; }
          if (i === 1) { addMood(3); return [say('rauno', 'Huippupetoa tulee aina kunnioittaa.')]; }
          addMood(0); return [nar('Kissa katsoo. Kissa muistaa.')];
        } },
    ],
    () => [
      nar('Kebabkioski hohtaa kuin keidas yössä.'),
      { choice: ['Osta kebabit kaikille.', 'Vastusta. Meillä on kuppila saavutettavana.', 'Tuomas tilaa kaikille (kuten aina).'], text: 'Mitä {P} tekee?',
        on: (i) => {
          if (i === 0) { addMood(4); addHunger(-12); logEvent('kebab', 'Kebabia hankittiin matkalla kuppilaan. Se ei ollut viimeinen kebab.', true); return [say('antti', 'Veli. Sinä täydennät minut.')]; }
          if (i === 1) { addMood(1); return [say('rauno', 'Kurinalainen valinta. Ihailen sitä ja kaunaan sitä.')]; }
          addMood(3); addHunger(-8); return [say('tuomas', 'Kolme kebabia. Extrakastiketta. Älkää väitelkö.')];
        } },
    ],
  ];
  const ev = pick(events)();
  return Cutscene({
    bg: t => BG.street(t, 'night'), floor: BG.FLOOR.street, music: 'restaurant',
    cast: [{ c: 'tuomas', x: 150, v: 'out', walk: true }, { c: 'antti', x: 240, v: 'out', walk: true }, { c: 'rauno', x: 330, v: 'out', walk: true, flip: false }],
    steps: [
      nar('Keskiyö lähestyy. Kuppila hohtaa kaukana kuin rasvainen majakka.'),
      say('rauno', 'Laskelmieni mukaan saavumme neljässä minuutissa, mikäli välikohtauksia ei ilmene.'),
      ...ev,
      nar('Kuppila. Neonkyltti vilkkuu. Tarjoilija nyökkää heille kuin vanhoille tutuille.'),
    ],
    onEnd: () => go(Cutscene({
      bg: t => BG.restaurant(t), floor: BG.FLOOR.restaurant, music: 'restaurant', cast: [{ c: 'tuomas', x: 150, v: 'out' }, { c: 'antti', x: 240, v: 'out' }, { c: 'rauno', x: 330, v: 'out' }],
      steps: [
        say('antti', 'Kolme kaljaa, kiitos. Isoja.'),
        say('tuomas', 'Vuoden parhaalle päivälle!'),
        nar('Aika kilistää. Paina A, kun merkki on vihreällä alueella. Kolme kierrosta.'),
      ],
      onEnd: () => go(cheersGame()),
    })),
  });
};
function cheersGame() {
  const sparks = [];
  return TimingScene({
    title: 'KIPPIS!', hint: 'Paina A, kun lasit kohtaavat vihreällä alueella', rounds: 3, zoneW: 0.22, speed: 1.35, music: 'restaurant',
    bg: t => BG.restaurant(t), floor: 196,
    cast: [{ c: 'tuomas', x: 120, v: 'out' }, { c: 'antti', x: 240, v: 'out' }, { c: 'rauno', x: 360, v: 'out' }],
    texts: { hit: 'KILING! Täydellinen kippis.', low: 'Liian aikaisin. Kaljaa pöydälle.', high: 'Liian myöhään. Lasi kohtaa kyynärpään.' },
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
      logEvent('cheers', 'Kippistä yritettiin kolme kertaa. ' + hits + ' niistä päättyi kilinään. Loput päättyivät lautasliinoihin.', hits >= 2);
      go(Cutscene({
        bg: t => BG.restaurant(t), floor: BG.FLOOR.restaurant, music: 'restaurant', cast: [{ c: 'tuomas', x: 150, v: 'out' }, { c: 'antti', x: 240, v: 'out' }, { c: 'rauno', x: 330, v: 'out' }],
        steps: [
          say('tuomas', 'Kortteja?'),
          say('antti', 'Kortteja.'),
          say('rauno', 'Maksan mitä tahansa.'),
          nar('Toinen pokerikierros kuppilassa. Neljä kättä. Kalja alkaa näkyä.'),
        ],
        onEnd: () => go(PokerScene({ hands: 4, venue: 'restaurant', music: 'restaurant', done: (w) => go(Cutscene({
          bg: t => BG.restaurant(t), floor: BG.FLOOR.restaurant, music: 'restaurant', cast: [{ c: 'tuomas', x: 150, v: 'out' }, { c: 'antti', x: 240, v: 'out' }, { c: 'rauno', x: 330, v: 'out' }],
          steps: [
            say(w, 'Kuppilan mestari on puhunut. Seuraava kierros häviäjän piikkiin.'),
            say(others(w)[0], 'Vaadin uusintaottelua. Joskus.'),
            nar('Viimeiset tilaukset. Yö on pitkä, kotimatka pidempi.'),
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
    nar('Yö kaksi. Kadut ovat tyhjiä. Kaverit eivät.'),
    say('antti', 'Rakastan tätä kaupunkia.'),
    say('rauno', 'Seisot lätäkössä.'),
    say('antti', 'Rakastan tätä lätäkköä.'),
    { fn: () => {
      const wob = NAMES.some(c => G.bac[c] > 0.55);
      if (wob) { logEvent('lamp', 'Tuomas yritti halata lyhtypylvästä. Lyhtypylväs oli hyvä kuuntelija.', true); return [say('tuomas', 'Tämä lyhtypylväs ymmärtää minua.'), say('rauno', 'Tuomas. Tuo on lyhtypylväs.'), say('tuomas', 'Niin on. Loistava sellainen.')]; }
      return [say('tuomas', 'Paras päivä. Ei huomautettavaa.')];
    } },
    say('rauno', 'Tilasin taksin. Se saapuu viidessä minuutissa, mikä suomeksi tarkoittaa kahtakymmentä.'),
  ],
  onEnd: () => go(Cutscene({
    bg: t => BG.car(t), floor: 196, music: 'night', bust: true, noMarker: true,
    cast: [{ c: 'antti', x: 240, v: 'out', y: 150 }, { c: 'rauno', x: 140, v: 'out', y: 196 }, { c: 'tuomas', x: 340, v: 'out', y: 196 }],
    steps: [
      nar('Taksi saapuu. Antti ottaa takapenkin, kuten luonto on tarkoittanut.'),
      say('tuomas', 'Tämä oli paras päivä ikinä.'),
      say('rauno', 'Tunnelma, jota voin tukea empiirisesti.'),
      say('antti', 'Samaan aikaan ensi kuussa?'),
      say('tuomas', 'Ilman muuta.'),
      { fn: () => { logEvent('ride', 'Kolme kaveria taksissa kolmelta yöllä, jo suunnittelemassa seuraavaa.', true); } },
      nar('Kolme kaveria. Yksi ilta. Nolla katumusta (kysy uudestaan huomenna).'),
    ],
    onEnd: () => go(morningCard()),
  })),
});

function morningCard() {
  const avg = NAMES.reduce((a, c) => a + G.bac[c], 0) / 3;
  const txt = avg < 0.3 ? 'Yllättävän virkeä olo. Joku unohti juoda. (Tai joi viisaasti.)' : avg < 0.6 ? 'Lievä päänsärky ja erittäin selkeä tyytyväisyyden tunne.' : 'Legendaarinen krapula. Jokaisen minuutin arvoinen.';
  return Card({ ep: 8, title: 'Seuraava aamu', time: '10:30', text: txt, music: 'night', next: () => CreditsScene(), note: 'Lopputekstit...' });
}

window.__scenes = { title: TitleScene, card: episodeCard, ep: n => EP_START[n](), shop: () => ShopScene({ done: () => go(episodeCard(2)) }), credits: () => CreditsScene(), morning: morningCard };
