// Title screen, episode cards and the generic dialogue cutscene system

function subst(s) {
  if (typeof s === 'function') s = s();
  const o = others();
  const who = { P: G.player, O1: o[0], O2: o[1], T: G.flags.target || o[0] };
  return String(s).replace(/\{(P|O1|O2|T)(?::(\w+))?\}/g, (m, k, c) => nf(who[k], c));
}

// ---------- title ----------
function TitleScene() {
  let t = 0;
  return {
    music: 'title', hud: false, noSwitch: true,
    enter() { t = 0; },
    update(dt) {
      t += dt;
      const i = NAMES.indexOf(G.player);
      if (Input.pressed.left) { G.player = NAMES[(i + 2) % 3]; Snd.sfx('select'); }
      if (Input.pressed.right) { G.player = NAMES[(i + 1) % 3]; Snd.sfx('select'); }
      if (Input.pressed.a && t > 0.4) {
        Snd.sfx('confirm');
        newGame(G.player);
        Scenes.go(episodeCard(1));
      }
    },
    draw() {
      BG.lot(t, 'eve');
      ctx.fillStyle = 'rgba(20,10,40,0.35)'; ctx.fillRect(0, 0, W, H);
      const xs = [150, 240, 330];
      const order = ['tuomas', 'antti', 'rauno'];
      order.forEach((c, i) => {
        const sel = c === G.player;
        const bob = sel ? Math.round(Math.sin(t * 8)) * 2 : 0;
        Sprites.draw(ctx, c, 'out', xs[i], 232 - (sel ? 4 : 0) + bob, { pose: Math.floor(t * 4) % 2 && sel ? 'walk0' : 'idle', scale: 1 });
        if (sel) { T('▼', xs[i], 232 - 90, { align: 'center', c: CH[c].color, size: 12 }); }
        T(CH[c].name, xs[i], 238, { align: 'center', c: sel ? CH[c].color : '#b8b0a0', size: 10 });
      });
      const wob = Math.sin(t * 3) * 3;
      T('MIESTEN', W / 2, 24 + wob, { align: 'center', size: 30, c: '#ffd166' });
      T('ILLANVIETTO', W / 2, 58 + wob, { align: 'center', size: 30, c: '#ff7aa8' });
      T('Lauantain eepos pikseleinä', W / 2, 98, { align: 'center', size: 10, c: '#f2e6c9' });
      panel(60, 114, 360, 34, 'rgba(10,10,30,0.8)');
      T('Valitse jätkäsi:  ◄ ►   ja paina A', W / 2, 155, { align: 'center', size: 10 });
      T('Voit vaihtaa hahmoa milloin vain (C / VAIHDA)', W / 2, 133, { align: 'center', size: 8, c: '#b8b0a0' });
      if (Math.floor(t * 2) % 2 === 0) T('ALOITA PAINAMALLA A', W / 2, 160, { align: 'center', size: 12, c: '#fff' });
      T('v1.0  |  8-bittinen ääni alkaa napin painalluksesta', W / 2, 258, { align: 'center', size: 8, c: '#8c88a0' });
      drawToast();
    },
  };
}

// ---------- episode card ----------
function Card(o) {
  let t = 0, typed = 0, choice = 0, done = false;
  const body = o.text || '';
  return {
    music: o.music, hud: false,
    dpad() { return !!(o.suggest && G.player !== o.suggest); },
    enter() { t = 0; typed = 0; choice = 0; done = false; (window.__trace = window.__trace || []).push('card:' + o.ep); },
    update(dt) {
      t += dt; typed += dt * 38;
      const hasChoice = o.suggest && G.player !== o.suggest;
      if (hasChoice) {
        if (Input.pressed.left || Input.pressed.right || Input.pressed.up || Input.pressed.down) { choice = 1 - choice; Snd.sfx('select'); }
      }
      if (Input.pressed.a && t > 0.3 && !done) {
        if (typed < body.length) { typed = body.length; return; }
        if (hasChoice && choice === 0) G.player = o.suggest;
        done = true; Snd.sfx('confirm');
        Scenes.go(o.next());
      }
    },
    draw() {
      rect(0, 0, W, H, '#07060d');
      for (let i = 0; i < 70; i++) rect((i * 131 + Math.floor(t * 10) * 17) % W, (i * 71 + Math.floor(t * 10) * 7) % H, 1, 1, 'rgba(255,255,255,0.12)');
      rect(0, 0, W, 26, '#000'); rect(0, H - 26, W, 26, '#000');
      T('JAKSO ' + o.ep, W / 2, 40, { align: 'center', size: 11, c: '#c9a24a' });
      rect(W / 2 - 80, 56, 160, 1, '#c9a24a');
      T(o.title.toUpperCase(), W / 2, 66, { align: 'center', size: 26, c: '#f6efd8' });
      rect(W / 2 - 80, 102, 160, 1, '#c9a24a');
      T(o.time, W - 20, 36, { align: 'right', size: 12, c: '#7cf04a' });
      const lines = wrap(body.slice(0, Math.floor(typed)), 380, 10);
      lines.forEach((l, i) => T(l, W / 2, 118 + i * 13, { align: 'center', size: 10, c: '#cfc6b0' }));
      const hasChoice = o.suggest && G.player !== o.suggest;
      if (hasChoice && typed >= body.length) {
        T('Jakson ehdotettu sankari:', W / 2, 188, { align: 'center', size: 9, c: '#b8b0a0' });
        const a = (choice === 0 ? '► ' : '  ') + 'Pelaa: ' + nm(o.suggest).toUpperCase();
        const b = (choice === 1 ? '► ' : '  ') + 'Jatka: ' + nm(G.player).toUpperCase();
        T(a, W / 2 - 70, 202, { align: 'left', size: 11, c: choice === 0 ? CH[o.suggest].color : '#8c88a0' });
        T(b, W / 2 - 70, 218, { align: 'left', size: 11, c: choice === 1 ? CH[G.player].color : '#8c88a0' });
      } else if (typed >= body.length && Math.floor(t * 2) % 2 === 0) {
        T('A: jatka', W / 2, 210, { align: 'center', size: 10, c: '#f2e6c9' });
      }
      if (o.note) T(o.note, W / 2, 244, { align: 'center', size: 8, c: '#7a7690' });
      drawToast();
    },
  };
}

// ---------- cutscene ----------
// o: { bg:(t)=>void, fg?:(t)=>void, floor, cast:[{c,x,v,flip,expr,y}], steps:[], music, bust, onEnd:(scene)=>void }
// step kinds: {who,text} {narr:true,text} {choice:[...],text,on:(i,scene)=>steps?} {fn:(scene)=>steps?} {wait:sec}
function Cutscene(o) {
  const S = {
    music: o.music, t: 0, cast: (o.cast || []).map(c => Object.assign({}, c)),
    steps: o.steps.slice(), i: -1, cur: null, typed: 0, sel: 0, waitT: 0, lastBlip: 0, finished: false,
  };
  S.enter = function () { this.advance(); };
  S.dpad = function () { return !!(this.cur && this.cur.choice); };
  S.char = function (c) { return this.cast.find(x => x.c === c); };
  S.advance = function () {
    this.i++;
    for (;;) {
      const st = this.steps[this.i];
      if (!st) { this.cur = { end: true }; if (!this.finished) { this.finished = true; if (o.onEnd) o.onEnd(this); } return; }
      if (st.fn) {
        const r = st.fn(this);
        if (Array.isArray(r)) this.steps.splice(this.i + 1, 0, ...r);
        this.i++; continue;
      }
      if (st.wait !== undefined) { this.waitT = st.wait; this.cur = st; return; }
      this.cur = st; this.typed = 0; this.sel = 0; this.lastBlip = 0;
      this.text = subst(st.text || '');
      if (st.choice) this.opts = (typeof st.choice === 'function' ? st.choice() : st.choice).map(subst);
      return;
    }
  };
  S.update = function (dt) {
    this.t += dt;
    const st = this.cur;
    if (!st || st.end) return;
    if (st.wait !== undefined) { this.waitT -= dt; if (this.waitT <= 0) this.advance(); return; }
    if (st.choice) {
      if (Input.pressed.up) { this.sel = (this.sel + this.opts.length - 1) % this.opts.length; Snd.sfx('select'); }
      if (Input.pressed.down) { this.sel = (this.sel + 1) % this.opts.length; Snd.sfx('select'); }
      if (Input.pressed.a) {
        Snd.sfx('confirm');
        const r = st.on ? st.on(this.sel, this) : null;
        if (Array.isArray(r)) this.steps.splice(this.i + 1, 0, ...r);
        this.advance();
      }
      return;
    }
    const before = Math.floor(this.typed);
    this.typed += dt * 55;
    const now = Math.floor(this.typed);
    if (now > before && now % 2 === 0 && st.who && now <= this.text.length) Snd.blip(this.text[Math.min(now, this.text.length - 1)] || 'a');
    if (Input.pressed.a) {
      if (this.typed < this.text.length) this.typed = this.text.length;
      else this.advance();
    }
  };
  S.draw = function (g) {
    o.bg(this.t);
    const floor = o.floor || 240;
    const st = this.cur || {};
    this.cast.forEach(c => {
      const speaking = st.who === c.c && this.typed < (this.text || '').length;
      const bob = speaking ? Math.round(Math.sin(this.t * 16) * 1.5) : 0;
      const fy = (c.y !== undefined ? c.y : floor) + bob;
      const drunk = G.bac[c.c] > 0.35 ? 'drunk' : undefined;
      Sprites.draw(ctx, c.c, c.v || 'in', c.x, fy, { flip: c.flip, expr: c.expr || drunk, pose: c.walk ? (Math.floor(this.t * 5) % 2 ? 'walk0' : 'walk1') : c.pose, bust: o.bust });
      if (c.c === G.player && !o.noMarker) T('▼', c.x, fy - (o.bust ? 56 : 74) + Math.round(Math.sin(this.t * 6) * 2), { align: 'center', c: '#ffd166', size: 10 });
    });
    if (o.fg) o.fg(this.t);
    applyWobble(G.bac[G.player] * 1.2, this.t);
    drawHUD();
    // dialog box
    if (st.end || st.wait !== undefined) { drawToast(); return; }
    const choice = !!st.choice;
    const by = choice ? 130 : 196, bh = choice ? 132 : 66;
    panel(8, by, W - 16, bh, '#10162e');
    let tx = 18;
    if (st.who) {
      Sprites.head(ctx, st.who, 'in', 16, by + 6, 2);
      tx = 78;
      const label = nm(st.who).toUpperCase();
      rect(14, by - 12, tw(label, 10) + 14, 12, CH[st.who].color);
      T(label, 21, by - 11, { size: 10, c: '#101010', shadow: false });
    }
    const shown = this.text.slice(0, Math.floor(this.typed));
    const lines = wrap(shown, W - 16 - tx - 12, 10);
    lines.forEach((l, i) => T(l, tx, by + 8 + i * 13, { size: 10, c: st.who ? '#f2e6c9' : '#cdd8ff' }));
    if (choice) {
      const oy = by + 10 + Math.max(1, wrap(this.text, W - 40, 10).length) * 13 + 6;
      this.opts.forEach((opt, i) => {
        const ws = wrap(opt, W - 60, 10);
        T((i === this.sel ? '► ' : '  ') + ws[0], 22, oy + i * 15, { size: 10, c: i === this.sel ? '#ffd166' : '#a8a3b8' });
      });
    } else if (this.typed >= this.text.length && Math.floor(this.t * 2.5) % 2 === 0) {
      T('▼', W - 28, by + bh - 16, { size: 10 });
    }
    drawToast();
  };
  return S;
}
