// Minigames B: timing bar (steam / cheers), sauna endurance, group hug, cooking

// ---------- generic timing-bar minigame ----------
// cfg: { bg:(t)=>void, floor, bust, cast:[{c,x,v,y}], rounds, title, hint, zoneW, speed, texts:{hit,low,high},
//        expr:(c, state)=>expression, extra:(t,state)=>void, fg:(t)=>void, onGrade:(grade,round,state)=>void, done:(grades)=>void, music }
function TimingScene(cfg) {
  const S = { music: cfg.music };
  let m, dir, zone, round, state, grades, t, resTxt, resT, grade, sparkles;
  S.enter = function () {
    m = 0; dir = 1; round = 0; state = 'play'; grades = []; t = 0; resTxt = ''; resT = 0; sparkles = [];
    zone = rnd(0.28, 0.72); this.state = { round: 0, grades, hits: 0 };
  };
  S.bot = function () {
    if (state === 'play' && Math.abs(m - zone) < 0.025) Input.pressed.a = true;
  };
  S.update = function (dt) {
    t += dt;
    const sp = (cfg.speed || 1.25) * (1 + round * 0.12);
    if (state === 'play') {
      m += dir * sp * dt;
      if (m > 1) { m = 1; dir = -1; } else if (m < 0) { m = 0; dir = 1; }
      if (Input.pressed.a) {
        const hw = (cfg.zoneW || 0.18) / 2;
        grade = Math.abs(m - zone) <= hw ? 'hit' : (m < zone ? 'low' : 'high');
        grades.push(grade); resTxt = cfg.texts[grade]; resT = 0; state = 'result';
        this.state.hits = grades.filter(g => g === 'hit').length;
        if (cfg.onGrade) cfg.onGrade(grade, round, this.state);
      }
    } else if (state === 'result') {
      resT += dt;
      if (resT > 1.1 || (resT > 0.5 && Input.pressed.a)) {
        round++;
        if (round >= cfg.rounds) { state = 'end'; cfg.done(grades); return; }
        zone = rnd(0.25, 0.75); m = rnd(0, 1); state = 'play'; this.state.round = round;
      }
    }
  };
  S.draw = function () {
    cfg.bg(t);
    const floor = cfg.floor || 240;
    (cfg.cast || []).forEach(c => {
      const ex = cfg.expr ? cfg.expr(c.c, this.state) : undefined;
      Sprites.draw(ctx, c.c, c.v || 'in', c.x, c.y !== undefined ? c.y : floor, { bust: cfg.bust, expr: ex || (G.bac[c.c] > 0.35 ? 'drunk' : undefined) });
      if (c.c === G.player) T('▼', c.x, (c.y !== undefined ? c.y : floor) - (cfg.bust ? 58 : 76), { align: 'center', c: '#ffd166', size: 10 });
    });
    if (cfg.fg) cfg.fg(t);
    if (cfg.extra) cfg.extra(t, this.state);
    applyWobble(G.bac[G.player] * 1.0, t);
    drawHUD();
    T(cfg.title, W / 2, 30, { size: 16, align: 'center', c: '#ffd166' });
    T('Round ' + Math.min(round + 1, cfg.rounds) + ' / ' + cfg.rounds, W / 2, 50, { size: 9, align: 'center', c: '#fff' });
    // bar
    const bx = 90, bw = 300, by = 226;
    panel(bx - 8, by - 20, bw + 16, 44, '#10162e');
    rect(bx, by, bw, 14, '#2a2f45');
    rect(bx + (zone - (cfg.zoneW || 0.18) / 2) * bw, by, (cfg.zoneW || 0.18) * bw, 14, '#4fd36a');
    rect(bx + m * bw - 2, by - 5, 5, 24, '#fff');
    T(state === 'result' ? resTxt : cfg.hint, W / 2, by - 16, { size: 9, align: 'center', c: state === 'result' ? (grade === 'hit' ? '#8fe36a' : '#ff9a7a') : '#cdd8ff' });
    drawToast();
  };
  return S;
}

// ---------- sauna endurance contest ----------
function EnduranceScene(o) {
  let comp, out, base, t, winner, state, ended, quip, quipT, resultT;
  return {
    music: 'sauna',
    enter() {
      comp = { rauno: 100, tuomas: 100, antti: 100 }; out = {};
      base = {}; NAMES.forEach(c => { base[c] = c === G.player ? 9 : rnd(1.6, 2.9); });
      t = 0; winner = null; state = 'play'; quip = ''; quipT = 0; resultT = 0;
    },
    bot() { if (Math.random() < 0.25 || state === 'result') Input.pressed.a = true; },
    update(dt) {
      if (state === 'result') { resultT += dt; if (Input.pressed.a && resultT > 0.8) o.done({ winner }); return; }
      let k = 1;
      if (out[G.player]) k = 3;
      const d = dt * k;
      t += d; quipT -= dt;
      if (Input.pressed.a && !out[G.player]) { comp[G.player] = Math.min(100, comp[G.player] + 7); Snd.sfx('tick'); }
      NAMES.forEach(c => {
        if (out[c]) return;
        comp[c] -= base[c] * (1 + t / 18) * d * (1 + 0.15 * Math.sin(t * 3 + c.length));
        if (comp[c] <= 0) {
          out[c] = true; Snd.sfx(c === G.player ? 'bad' : 'hot');
          quip = c === 'rauno' ? 'Rauno: "My thermal tolerance has been exceeded."' : c === 'antti' ? 'Antti: "The sausages need me."' : 'Tuomas: "I am going to check on the drone."';
          quipT = 2.2;
        }
      });
      const left = NAMES.filter(c => !out[c]);
      if (left.length <= 1) {
        winner = left[0] || NAMES[0]; state = 'result'; resultT = 0;
        Snd.sfx(winner === G.player ? 'win' : 'lose');
        addMood(winner === G.player ? 6 : 3);
        G.flags.saunaWinner = winner;
        logEvent('endurance', nm(winner) + ' won the sauna endurance contest and refused to talk about it humbly.', true);
      }
    },
    draw() {
      BG.sauna(t);
      NAMES.forEach((c, i) => {
        const x = 110 + i * 80;
        const dead = out[c];
        const heat = clamp(1 - comp[c] / 100, 0, 1);
        Sprites.draw(ctx, c, 'sauna', x, dead ? 196 : 214, { bust: true, expr: heat > 0.35 ? 'hot' : undefined });
        if (dead) T('x_x', x, 160, { align: 'center', size: 10, c: '#ff7a7a' });
        bar(x - 22, 226 - 0, 44, 6, comp[c] / 100, comp[c] > 30 ? '#7cf04a' : '#ff4a4a');
        T(nm(c), x, 236, { align: 'center', size: 9, c: c === G.player ? '#ffd166' : '#fff' });
      });
      rect(40, 214, 280, 10, '#8a5a30'); rect(40, 214, 280, 2, '#a8723d');
      // sweat steam
      for (let i = 0; i < 10; i++) {
        const sx = 60 + ((i * 53 + t * 20) % 260), sy = 120 - ((t * 25 + i * 17) % 70);
        rect(sx, sy, 3, 3, 'rgba(255,255,255,0.25)');
      }
      drawHUD();
      T('SAUNA ENDURANCE', W / 2, 30, { size: 16, align: 'center', c: '#ffd166' });
      T(out[G.player] ? 'You are out! Watching the rest...' : 'MASH A to stay in the heat! Last man standing wins.', W / 2, 52, { size: 9, align: 'center', c: '#fff' });
      T('Heat: ' + Math.round(40 + t * 1.2) + ' C', W / 2, 66, { size: 9, align: 'center', c: '#ff9a4a' });
      if (quipT > 0) { panel(100, 100, 280, 22, '#10162e'); T(quip, W / 2, 106, { size: 9, align: 'center' }); }
      if (state === 'result') {
        panel(120, 128, 240, 56, '#10162e');
        T(nm(winner).toUpperCase() + ' WINS!', W / 2, 136, { size: 16, align: 'center', c: CH[winner].color });
        T('A: continue', W / 2, 164, { size: 8, align: 'center', c: '#b8b0a0' });
      }
      drawToast();
    },
  };
}

// ---------- group hug ----------
function HugScene(o) {
  let meter, t, state, tl, hearts, resultT, ok;
  return {
    music: 'sauna',
    bot() { if (Math.random() < 0.3 || state === 'result') Input.pressed.a = true; },
    enter() { meter = 0; t = 0; tl = 9; state = 'play'; hearts = []; resultT = 0; ok = false; },
    update(dt) {
      t += dt;
      hearts.forEach(h => { h.y -= 20 * dt; h.life -= dt; });
      hearts = hearts.filter(h => h.life > 0);
      if (state === 'play') {
        tl -= dt;
        meter = Math.max(0, meter - 10 * dt);
        if (Input.pressed.a) { meter += 8; Snd.sfx('tick'); if (Math.random() < 0.5) hearts.push({ x: 240 + rnd(-40, 40), y: 190, life: 1.5 }); }
        if (meter >= 100) { state = 'result'; ok = true; resultT = 0; Snd.sfx('love'); addMood(9); G.flags.hug = true; logEvent('hug', 'Three grown men hugged in towels. Nobody mentioned it again. Everybody remembered it.', true); }
        else if (tl <= 0) { state = 'result'; ok = false; resultT = 0; Snd.sfx('bad'); addMood(2); logEvent('hug_fail', 'An awkward pat on the back was exchanged. Respect was mutual.', true); }
      } else { resultT += dt; if (Input.pressed.a && resultT > 0.8) o.done({ ok }); if (Math.random() < 0.3) hearts.push({ x: 240 + rnd(-60, 60), y: 200, life: 1.5 }); }
    },
    draw() {
      BG.porch(t, 'eve');
      const p = clamp(meter / 100, 0, 1);
      const xs0 = [120, 240, 360];
      NAMES.forEach((c, i) => {
        const x = lerp(xs0[i], 240 + (i - 1) * 22, p);
        Sprites.draw(ctx, c, 'sauna', x, 246, { pose: 'idle', flip: i === 2 });
        if (c === G.player) T('▼', x, 170, { align: 'center', c: '#ffd166', size: 10 });
      });
      hearts.forEach(h => T('♥', h.x, h.y, { size: 14, c: '#ff5a8a', align: 'center' }));
      drawHUD();
      T('THE HUG', W / 2, 30, { size: 16, align: 'center', c: '#ffd166' });
      T('MASH A to close the distance (it is awkward)', W / 2, 50, { size: 9, align: 'center', c: '#fff' });
      bar(140, 66, 200, 10, p, '#ff5a8a');
      if (state === 'play') T('Time: ' + Math.ceil(tl), W / 2, 82, { size: 9, align: 'center' });
      if (state === 'result') {
        panel(110, 96, 260, 50, '#10162e');
        T(ok ? 'GROUP HUG! (mood up)' : 'A manly pat on the back.', W / 2, 106, { size: 12, align: 'center', c: ok ? '#ff7aa8' : '#cdd8ff' });
        T('A: continue', W / 2, 128, { size: 8, align: 'center', c: '#b8b0a0' });
      }
      drawToast();
    },
  };
}

// ---------- cooking ----------
function CookScene(o) {
  const hasSausage = !G.flags.noSausage;
  const n = hasSausage ? 5 : 3;
  const label = hasSausage ? 'sausage' : 'noodle block';
  let phase, chop, chopT, chopNeed, items, cursor, t, done, shown, resultT, burnt, score, sizT;
  const antti = () => G.player === 'antti';
  return {
    music: 'kitchen',
    enter() {
      t = 0; sizT = 0; burnt = 0; score = 0; resultT = 0; cursor = 0; shown = null;
      chop = 0; chopT = 8; chopNeed = antti() ? 14 : 20;
      phase = G.shop.onion ? 'chop' : 'fry';
      items = [];
      for (let i = 0; i < n; i++) items.push({ c: rnd(0, 0.15), rate: rnd(0.10, 0.16), state: 'pan', q: 0 });
      this.lo = antti() ? 0.55 : 0.62; this.hi = antti() ? 1.02 : 0.95; this.burn = antti() ? 1.2 : 1.12;
    },
    bot() {
      if (phase === 'chop') { if (Math.random() < 0.3) Input.pressed.a = true; return; }
      if (phase === 'result') { Input.pressed.a = true; return; }
      const k = items.findIndex(it => it.state === 'pan' && it.c >= this.lo + 0.03 && it.c <= this.hi - 0.05);
      if (k >= 0) { cursor = k; Input.pressed.a = true; }
    },
    update(dt) {
      t += dt;
      if (phase === 'chop') {
        chopT -= dt;
        if (Input.pressed.a) { chop++; Snd.sfx('tick'); }
        if (chop >= chopNeed) { phase = 'fry'; addMood(2); Snd.sfx('good'); G.flags.onionsChopped = true; }
        else if (chopT <= 0) { phase = 'fry'; G.flags.onionsChopped = false; Snd.sfx('bad'); }
        return;
      }
      if (phase === 'fry') {
        sizT -= dt; if (sizT <= 0) { Snd.sfx('sizzle'); sizT = 1.2; }
        if (Input.pressed.left) { cursor = (cursor + n - 1) % n; Snd.sfx('select'); }
        if (Input.pressed.right) { cursor = (cursor + 1) % n; Snd.sfx('select'); }
        items.forEach(it => {
          if (it.state !== 'pan') return;
          it.c += it.rate * dt;
          if (it.c > this.burn) { it.state = 'burnt'; it.q = 0; burnt++; Snd.sfx('burn'); }
        });
        if (Input.pressed.a) {
          const it = items[cursor];
          if (it.state === 'pan') {
            it.state = 'out';
            it.q = it.c >= this.lo && it.c <= this.hi ? 2 : (it.c > 0.45 ? 1 : 0);
            Snd.sfx(it.q === 2 ? 'coin' : it.q === 1 ? 'select' : 'bad');
            if (it.q === 2 && !G.flags.goldenSnap) { G.flags.goldenSnap = true; Snap.take('golden', 'golden'); }
          }
        }
        if (items.every(it => it.state !== 'pan')) {
          phase = 'result'; resultT = 0;
          score = items.reduce((a, it) => a + it.q, 0);
          const pct = score / (2 * n);
          this.pct = pct;
          addHunger(-(25 + 45 * pct)); addMood(Math.round(9 * pct) - burnt * 2);
          G.flags.burnt = burnt; G.flags.cookPct = pct;
          const who = nm(G.player);
          logEvent('cook', pct > 0.8 ? who + ' cooked the ' + label + 's to golden perfection. A moment of silence was observed.'
            : burnt >= 2 ? who + ' cooked ' + burnt + ' ' + label + 's into charcoal. The fire alarm was not consulted.'
            : who + ' cooked an honest dinner. Everyone ate it.', true);
          Snd.sfx(pct > 0.6 ? 'win' : 'lose');
        }
        return;
      }
      resultT += dt;
      if (Input.pressed.a && resultT > 0.8) o.done({ pct: this.pct, burnt });
    },
    draw() {
      BG.kitchen(t);
      // counter + pan
      rect(0, 186, W, 84, '#7a5a3a'); rect(0, 186, W, 4, '#9a7650');
      if (phase === 'chop') {
        rect(160, 150, 160, 70, '#c9a06a'); rect(160, 150, 160, 4, '#e0b98a');
        const sq = chop / chopNeed;
        circle(240, 186, 22 - sq * 16, '#d9c07a'); circle(240, 186, 14 - sq * 10, '#efe0a0');
        for (let i = 0; i < chop; i++) rect(180 + (i * 17) % 120, 196 + (i * 7) % 14, 5, 3, '#efe0a0');
        const kx = 240 + Math.sin(t * 40) * 20 * (Input.down.a ? 1 : 0.2);
        rect(kx - 2, 130, 4, 40, '#cfd3da'); rect(kx - 3, 130, 6, 10, '#333');
        T('CHOP THE ONIONS', W / 2, 30, { size: 16, align: 'center', c: '#ffd166' });
        T('MASH A! ' + chop + ' / ' + chopNeed, W / 2, 52, { size: 10, align: 'center', c: '#fff' });
        bar(150, 68, 180, 8, chop / chopNeed, '#efe0a0');
        T('Time: ' + Math.ceil(chopT), W / 2, 84, { size: 9, align: 'center' });
      } else {
        ctx.fillStyle = '#2b2b30'; ctx.beginPath(); ctx.ellipse(240, 188, 205, 52, 0, 0, 7); ctx.fill();
        ctx.fillStyle = '#3a3a42'; ctx.beginPath(); ctx.ellipse(240, 184, 190, 44, 0, 0, 7); ctx.fill();
        rect(430, 180, 40, 8, '#3a3a42');
        items.forEach((it, i) => {
          const x = 80 + i * ((340) / (n - 1)) - (n === 3 ? -50 : 0) * (n === 3 ? 1 : 0);
          const xx = n === 3 ? 140 + i * 100 : x;
          let col = it.state === 'burnt' ? '#111' : it.state === 'out' ? '#6a6a6a' : mix(mix('#f0a090', '#d9902f', clamp(it.c / 0.65, 0, 1)), '#3a2410', clamp((it.c - 0.65) / 0.45, 0, 1));
          const y = it.state === 'out' ? 130 : 176;
          rect(xx - 22, y, 44, 14, col); rect(xx - 24, y + 2, 48, 10, col); rect(xx - 22, y + 2, 44, 3, 'rgba(255,255,255,0.18)');
          if (it.state === 'pan' && i === cursor) T('▼', xx, y - 16, { align: 'center', c: '#ffd166', size: 12 });
          if (it.state === 'out') T(['x', '★', '★★'][it.q], xx, y - 14, { align: 'center', size: 10, c: ['#ff7a7a', '#ffd166', '#8fe36a'][it.q] });
          if (it.state === 'burnt') for (let s = 0; s < 3; s++) rect(xx - 6 + s * 6, y - 8 - ((t * 20 + s * 9) % 24), 3, 4, 'rgba(180,180,180,0.5)');
          if (it.state === 'pan') { const g = clamp(it.c, 0, 1.2); bar(xx - 20, y + 20, 40, 4, g / 1.2, g > this.hi ? '#ff4a4a' : g >= this.lo ? '#7cf04a' : '#f0a090'); }
        });
        T('FRY THE ' + label.toUpperCase() + 'S', W / 2, 30, { size: 16, align: 'center', c: '#ffd166' });
        T('Left/Right pick, A takes it off. Golden zone = green bar!', W / 2, 52, { size: 9, align: 'center', c: '#fff' });
        if (!hasSausage) T('No sausages bought... emergency noodles.', W / 2, 66, { size: 8, align: 'center', c: '#ff9a7a' });
      }
      Sprites.draw(ctx, G.player, 'in', 56, 262, { flip: false });
      drawHUD();
      if (G.player !== 'antti') T('Antti is the kitchen master (C to switch)', W / 2, H - 12, { size: 8, align: 'center', c: '#b8b0a0' });
      if (phase === 'result') {
        panel(110, 90, 260, 70, '#10162e');
        T(this.pct > 0.8 ? 'MASTERCHEF!' : this.pct > 0.45 ? 'Edible!' : 'Questionable...', W / 2, 98, { size: 15, align: 'center', c: this.pct > 0.45 ? '#8fe36a' : '#ff9a7a' });
        T('Burnt: ' + burnt + '   Score: ' + score + '/' + (2 * n), W / 2, 122, { size: 10, align: 'center' });
        T('A: continue', W / 2, 142, { size: 8, align: 'center', c: '#b8b0a0' });
      }
      drawToast();
    },
  };
}
