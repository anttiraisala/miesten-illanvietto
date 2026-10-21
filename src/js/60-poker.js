// Lightweight poker: 3 players, 2 hole cards, flop + (turn,river) with two betting rounds, best-of-7 showdown.
// AI personalities: tuomas = loose aggressive, antti = tight aggressive, rauno = loose passive.

const HAND_NAMES = ['High card', 'Pair', 'Two pair', 'Three of a kind', 'Straight', 'Flush', 'Full house', 'Four of a kind', 'Straight flush'];
const RANK_TXT = { 11: 'J', 12: 'Q', 13: 'K', 14: 'A' };
const SUIT_BITS = [
  ['..X..', '.XXX.', 'XXXXX', 'XXXXX', '..X..'],   // spade
  ['.X.X.', 'XXXXX', 'XXXXX', '.XXX.', '..X..'],   // heart
  ['..X..', '.XXX.', 'XXXXX', '.XXX.', '..X..'],   // diamond
  ['..X..', '.XXX.', 'X.X.X', 'XXXXX', '..X..'],   // club
];

function newDeck() {
  const d = [];
  for (let s = 0; s < 4; s++) for (let r = 2; r <= 14; r++) d.push({ r, s });
  for (let i = d.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const x = d[i]; d[i] = d[j]; d[j] = x; }
  return d;
}
function eval5(cs) {
  const n = cs.length;
  const r = cs.map(c => c.r).sort((a, b) => b - a);
  const flush = n === 5 && cs.every(c => c.s === cs[0].s);
  let straight = false, hi = r[0];
  if (n === 5 && new Set(r).size === 5) {
    if (r[0] - r[4] === 4) straight = true;
    else if (r[0] === 14 && r[1] === 5 && r[4] === 2) { straight = true; hi = 5; }
  }
  const cnt = {};
  r.forEach(x => { cnt[x] = (cnt[x] || 0) + 1; });
  const groups = Object.keys(cnt).map(Number).sort((a, b) => cnt[b] - cnt[a] || b - a);
  const shape = groups.map(g => cnt[g]).join('');
  if (straight && flush) return [8, hi];
  if (shape[0] === '4') return [7].concat(groups);
  if (shape === '32') return [6].concat(groups);
  if (flush) return [5].concat(r);
  if (straight) return [4, hi];
  if (shape[0] === '3') return [3].concat(groups);
  if (shape.slice(0, 2) === '22') return [2].concat(groups);
  if (shape[0] === '2') return [1].concat(groups);
  return [0].concat(r);
}
function cmpHands(a, b) {
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const x = a[i] || 0, y = b[i] || 0;
    if (x !== y) return x - y;
  }
  return 0;
}
function bestOf(cs) {
  if (cs.length <= 5) return eval5(cs);
  let best = null;
  const n = cs.length;
  for (let a = 0; a < n - 4; a++) for (let b = a + 1; b < n - 3; b++) for (let c = b + 1; c < n - 2; c++) for (let d = c + 1; d < n - 1; d++) for (let e = d + 1; e < n; e++) {
    const v = eval5([cs[a], cs[b], cs[c], cs[d], cs[e]]);
    if (!best || cmpHands(v, best) > 0) best = v;
  }
  return best;
}
function handStrength(hole, board) {
  const all = hole.concat(board);
  const e = bestOf(all), cat = e[0];
  const be = board.length >= 3 ? bestOf(board) : [0];
  let s = [0.10, 0.40, 0.62, 0.76, 0.84, 0.88, 0.93, 0.98, 1][cat];
  const maxHole = Math.max(hole[0].r, hole[1].r);
  if (cat > 0 && cat <= be[0]) s = 0.10 + cat * 0.08 + (maxHole >= 12 ? 0.08 : 0);
  else if (cat === 1) s += (e[1] - 8) / 60;
  if (cat === 0) {
    s = 0.08 + (maxHole >= 13 ? 0.10 : 0);
    const sc = [0, 0, 0, 0]; all.forEach(c => sc[c.s]++);
    if (Math.max.apply(null, sc) >= 4) s += 0.15;
    const rs = Array.from(new Set(all.map(c => c.r))).sort((a, b) => a - b);
    for (let i = 0; i + 3 < rs.length; i++) if (rs[i + 3] - rs[i] === 3) s += 0.1;
  }
  return clamp(s + rnd(-0.05, 0.05), 0, 1);
}
function aiDecide(who, s, toCall, canRaise) {
  let a = 'call';
  const r = Math.random();
  if (who === 'tuomas') {                       // loose aggressive
    const bluff = r < 0.3;
    if (toCall === 0) a = (s > 0.3 || bluff) ? 'raise' : 'call';
    else if (s > 0.55 || (bluff && s > 0.05)) a = 'raise';
    else if (s > 0.18 || (toCall <= 10 && r < 0.6)) a = 'call';
    else a = 'fold';
  } else if (who === 'antti') {                 // tight aggressive
    if (toCall === 0) a = s > 0.6 ? 'raise' : 'call';
    else a = s > 0.72 ? 'raise' : s > 0.46 ? 'call' : 'fold';
  } else {                                      // loose passive
    if (toCall === 0) a = s > 0.9 ? 'raise' : 'call';
    else a = s > 0.9 ? 'raise' : (s > 0.18 || r < 0.5) ? 'call' : 'fold';
  }
  if (a === 'raise' && !canRaise) a = toCall === 0 ? 'call' : 'call';
  return a;
}
const QUIPS = {
  tuomas: { raise: ['Raise! Feel the heat.', 'Bluff? Me? Never.', 'More chips, more fun!'], call: ['Call.', 'Sure, why not.'], fold: ['Fine, fine.', 'I fold. Tactically.'] },
  antti: { raise: ['Raise. Do not doubt me.', 'I have it.', 'Raise.'], call: ['Call.', 'Hmm. Call.'], fold: ['Fold.', 'Not this time.'] },
  rauno: { raise: ['A modest raise. Statistically justified.'], call: ['Call. Out of curiosity.', 'I shall call, for science.', 'Call. It feels right.'], fold: ['I shall observe.', 'Fold. Suboptimal.'] },
};

function drawSuit(x, y, s, col, sc) {
  const bits = SUIT_BITS[s];
  ctx.fillStyle = col;
  for (let j = 0; j < 5; j++) for (let i = 0; i < 5; i++) if (bits[j][i] === 'X') ctx.fillRect(x + i * sc, y + j * sc, sc, sc);
}
function drawCard(x, y, c, up, hl) {
  const w = 26, h = 36;
  ctx.fillStyle = '#000'; ctx.fillRect(x - 1, y - 1, w + 2, h + 2);
  if (!up) {
    ctx.fillStyle = '#2b4fb8'; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#5a7ee0'; for (let j = 3; j < h - 3; j += 4) for (let i = 3; i < w - 3; i += 4) ctx.fillRect(x + i, y + j, 2, 2);
    return;
  }
  ctx.fillStyle = hl ? '#fff6c8' : '#f7f4ea'; ctx.fillRect(x, y, w, h);
  const red = c.s === 1 || c.s === 2;
  const col = red ? '#d62c3a' : '#16161c';
  T(RANK_TXT[c.r] || String(c.r), x + 3, y + 3, { size: 11, c: col, shadow: false });
  drawSuit(x + 3, y + 16, c.s, col, 2);
  drawSuit(x + 14, y + 23, c.s, col, 1);
}

function PokerScene(o) {
  const venue = o.venue || 'home';
  const bet = [0, 10, 20];
  let handNo, state, timer, t, hand, r, order, me, actor, bubbles, msg, opts, sel, stage, lastWinMsg, resultT, reveal;
  const S = { music: o.music || 'poker', noSwitch: true };
  const seatPos = {};

  function layoutSeats() {
    const oth = others(me);
    seatPos[oth[0]] = { x: 10, y: 14, side: 'L' };
    seatPos[oth[1]] = { x: 346, y: 14, side: 'R' };
    seatPos[me] = { x: 20, y: 120, side: 'M' };
  }
  function activeList() { return NAMES.filter(c => !hand.folded[c]); }
  function say(c, text) { bubbles[c] = { text, t: 2.0 }; }
  function pay(c, n) { const v = Math.min(n, G.chips[c]); G.chips[c] -= v; hand.pot += v; r.put[c] = (r.put[c] || 0) + v; hand.total[c] = (hand.total[c] || 0) + v; return v; }

  function startHand() {
    me = G.player; layoutSeats();
    NAMES.forEach(c => { if (G.chips[c] < 10) { G.chips[c] = 30; } });
    const deck = newDeck();
    hand = { deck, hole: {}, board: [], folded: {}, pot: 0, total: {} };
    NAMES.forEach(c => { hand.hole[c] = [deck.pop(), deck.pop()]; });
    r = { level: 0, put: {}, acted: {}, raises: 0, idx: 0 };
    NAMES.forEach(c => pay(c, 5));
    order = []; for (let i = 0; i < 3; i++) order.push(NAMES[(handNo + i) % 3]);
    bubbles = {}; stage = 0; S.noSwitch = true; reveal = false;
    msg = 'Hand ' + (handNo + 1) + ' of ' + o.hands + '. Ante 5 each. Dealing...';
    for (let i = 0; i < 6; i++) setTimeout(() => Snd.sfx('card'), i * 90);
    state = 'dealing'; timer = 1.2;
  }
  function dealBoard() {
    if (stage === 0) { for (let i = 0; i < 3; i++) hand.board.push(hand.deck.pop()); }
    else { hand.board.push(hand.deck.pop()); hand.board.push(hand.deck.pop()); }
    stage++;
    Snd.sfx('card');
    startRound();
  }
  function startRound() {
    r = { level: 0, put: {}, acted: {}, raises: 0, idx: 0 };
    msg = stage === 1 ? 'The flop is out. Betting.' : 'Turn and river are out. Final betting.';
    nextTurn();
  }
  function nextActor() {
    for (let k = 0; k < 3; k++) {
      const idx = (r.idx + k) % 3, p = order[idx];
      if (hand.folded[p] || G.chips[p] <= 0) continue;
      if (!r.acted[p] || (r.put[p] || 0) < r.level) { r.idx = idx; return p; }
    }
    return null;
  }
  function nextTurn() {
    if (activeList().length === 1) { finishHand(false); return; }
    actor = nextActor();
    if (!actor) { endRound(); return; }
    if (actor === me && !hand.folded[me]) {
      state = 'human';
      const toCall = r.level - (r.put[me] || 0);
      const canRaise = r.raises < 2 && G.chips[me] > toCall;
      opts = [];
      if (toCall > 0) { opts.push({ k: 'fold', t: 'FOLD' }); opts.push({ k: 'call', t: 'CALL ' + Math.min(toCall, G.chips[me]) }); }
      else opts.push({ k: 'call', t: 'CHECK' });
      if (canRaise) opts.push({ k: 'raise', t: (toCall > 0 ? 'RAISE +' : 'BET ') + bet[stage] });
      sel = opts.length > 1 && toCall > 0 ? 1 : 0;
    } else { state = 'ai'; timer = 0.9; }
  }
  function act(p, a) {
    const toCall = r.level - (r.put[p] || 0);
    r.acted[p] = true;
    let label;
    if (a === 'fold' && toCall > 0) { hand.folded[p] = true; label = 'FOLD'; Snd.sfx('back'); }
    else if (a === 'raise' && r.raises < 2 && G.chips[p] > toCall) { pay(p, toCall + bet[stage]); r.level += bet[stage]; r.raises++; label = toCall > 0 ? 'RAISE +' + bet[stage] : 'BET ' + bet[stage]; Snd.sfx('chip'); }
    else { pay(p, toCall); label = toCall > 0 ? 'CALL ' + toCall : 'CHECK'; if (toCall > 0) Snd.sfx('chip'); }
    if (p !== me && QUIPS[p] && Math.random() < 0.55) {
      const kind = label.indexOf('FOLD') === 0 ? 'fold' : label.indexOf('CHECK') === 0 || label.indexOf('CALL') === 0 ? 'call' : 'raise';
      say(p, label + ': ' + pick(QUIPS[p][kind]));
    } else say(p, label);
    r.idx = (order.indexOf(p) + 1) % 3;
    nextTurn();
  }
  function endRound() {
    if (stage >= 2) { finishHand(true); return; }
    state = 'dealing'; timer = 0.8; msg = 'Next cards coming...';
  }
  function finishHand(showdown) {
    const act = activeList();
    let winners, name = '';
    reveal = showdown;
    if (act.length === 1) { winners = act; name = 'everyone else folded'; }
    else {
      let best = null; winners = [];
      act.forEach(c => {
        const v = bestOf(hand.hole[c].concat(hand.board));
        hand.hole[c].val = v;
        if (!best || cmpHands(v, best) > 0) { best = v; winners = [c]; } else if (cmpHands(v, best) === 0) winners.push(c);
      });
      name = HAND_NAMES[best[0]];
    }
    const share = Math.floor(hand.pot / winners.length);
    winners.forEach((w, i) => { G.chips[w] += share + (i === 0 ? hand.pot - share * winners.length : 0); G.pokerWins[w]++; });
    lastWinMsg = winners.map(nm).join(' & ') + ' win' + (winners.length === 1 ? 's' : '') + ' ' + hand.pot + ' (' + name + ')';
    msg = lastWinMsg;
    if (winners.indexOf(me) >= 0) { addMood(3); Snd.sfx('win'); } else { addMood(1); Snd.sfx('lose'); }
    const bigPot = hand.pot >= 70;
    if (bigPot || (showdown && winners.length === 1 && hand.pot >= 50 && Math.random() < 0.6)) Snap.take('poker', lastWinMsg);
    G.stats.lastPokerWinner = winners[0];
    state = 'between'; resultT = 0; S.noSwitch = false;
    S.handsDone = handNo + 1;
  }

  S.enter = function () {
    t = 0; handNo = 0; bubbles = {}; stage = 0; this.handsDone = 0;
    me = G.player; startHand();
  };
  S.onSwitch = function () { me = G.player; layoutSeats(); };
  S.update = function (dt) {
    t += dt;
    Object.keys(bubbles).forEach(k => { bubbles[k].t -= dt; });
    if (state === 'dealing') { timer -= dt; if (timer <= 0) { if (stage === 0 && hand.board.length === 0 && msg.indexOf('Dealing') >= 0) { dealBoard(); } else dealBoard(); } }
    else if (state === 'ai') {
      timer -= dt;
      if (timer <= 0) {
        const toCall = r.level - (r.put[actor] || 0);
        const s = handStrength(hand.hole[actor], hand.board);
        const a = aiDecide(actor, s, toCall, r.raises < 2 && G.chips[actor] > toCall);
        act(actor, a);
      }
    } else if (state === 'human') {
      if (Input.pressed.left) { sel = (sel + opts.length - 1) % opts.length; Snd.sfx('select'); }
      if (Input.pressed.right) { sel = (sel + 1) % opts.length; Snd.sfx('select'); }
      if (Input.pressed.a) { Snd.sfx('confirm'); act(me, opts[sel].k); }
    } else if (state === 'between') {
      resultT += dt;
      if (Input.pressed.a && resultT > 0.7) {
        handNo++;
        if (venue === 'home' ? handNo % 2 === 0 : true) {
          drinkAll(1); Snd.sfx('clink'); Toast.show('Everyone takes a sip. Cheers!');
        }
        if (handNo >= o.hands) { state = 'final'; resultT = 0; this.winnerChips = NAMES.slice().sort((a, b) => G.chips[b] - G.chips[a]); const w = this.winnerChips[0]; logEvent('poker_' + venue, nm(w) + ' won the ' + (venue === 'home' ? 'home poker night' : 'restaurant poker round') + ' with ' + G.chips[w] + ' chips.', true); G.flags['pokerWinner_' + venue] = w; }
        else startHand();
      }
    } else if (state === 'final') {
      resultT += dt;
      if (Input.pressed.a && resultT > 0.8) o.done(this.winnerChips[0]);
    }
  };
  S.draw = function () {
    rect(0, 0, W, H, venue === 'home' ? '#1a1424' : '#2a1a14');
    ctx.fillStyle = '#5a3a1e'; ctx.beginPath(); ctx.ellipse(240, 108, 222, 90, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#1f6b3a'; ctx.beginPath(); ctx.ellipse(240, 108, 210, 80, 0, 0, 7); ctx.fill();
    ctx.strokeStyle = '#2a8a4c'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(240, 108, 196, 68, 0, 0, 7); ctx.stroke();
    // board
    for (let i = 0; i < 5; i++) {
      const x = 172 + i * 28, y = 66;
      if (hand.board[i]) drawCard(x, y, hand.board[i], true);
      else { ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.strokeRect(x, y, 26, 36); }
    }
    T('POT ' + hand.pot, 240, 108, { size: 12, align: 'center', c: '#ffd166' });
    for (let i = 0; i < Math.min(12, Math.floor(hand.pot / 10)); i++) circle(190 + i * 8, 130, 4, ['#d62c3a', '#2b4fb8', '#f0f0f0'][i % 3]);
    // seats
    NAMES.forEach(c => {
      const p = seatPos[c]; if (!p) return;
      const folded = hand.folded[c];
      ctx.globalAlpha = folded ? 0.35 : 1;
      Sprites.head(ctx, c, 'in', p.x, p.y, 2, G.bac[c] > 0.35 ? 'drunk' : undefined);
      ctx.globalAlpha = 1;
      const isMe = c === me;
      T(nm(c).toUpperCase() + (isMe ? ' (YOU)' : ''), p.x + 60, p.y + 4, { size: 10, c: CH[c].color });
      T('Chips: ' + G.chips[c], p.x + 60, p.y + 17, { size: 9, c: '#fff' });
      T({ rauno: 'loose-passive', tuomas: 'loose-aggro', antti: 'tight-aggro' }[c], p.x + 60, p.y + 29, { size: 7, c: '#9a96ae' });
      if (!isMe) {
        const show = reveal && !folded;
        if (!folded) { drawCard(p.x + 58, p.y + 40, hand.hole[c][0], show); drawCard(p.x + 86, p.y + 40, hand.hole[c][1], show); }
        else T('folded', p.x + 60, p.y + 50, { size: 9, c: '#9a96ae' });
      }
      const b = bubbles[c];
      if (b && b.t > 0) {
        const bw = Math.min(250, tw(b.text, 8) + 12);
        const bx = p.side === 'R' ? p.x - 20 - bw + 60 : p.x + 56, by = p.y + 82;
        ctx.fillStyle = 'rgba(0,0,0,0.78)'; ctx.fillRect(bx, by, bw, 14);
        T(b.text, bx + 6, by + 3, { size: 8, c: '#fff' });
      }
    });
    // my cards
    const mp = seatPos[me];
    if (mp) {
      const folded = hand.folded[me];
      ctx.globalAlpha = folded ? 0.45 : 1;
      drawCard(214, 138, hand.hole[me][0], true); drawCard(244, 138, hand.hole[me][1], true);
      ctx.globalAlpha = 1;
      if (!folded && hand.board.length >= 3) { const v = bestOf(hand.hole[me].concat(hand.board)); T(HAND_NAMES[v[0]], 240, 178, { size: 8, align: 'center', c: '#cdd8ff' }); }
    }
    applyWobble(G.bac[me] * 0.8, t);
    T('BEER', 418, 202, { size: 8 }); bar(446, 203, 22, 5, G.bac[me], '#f2a02e');
    // bottom panel
    panel(8, 196, W - 16, 68, '#10162e');
    T(msg, 18, 202, { size: 10, c: '#f2e6c9' });
    if (state === 'human') {
      const toCall = r.level - (r.put[me] || 0);
      T('Your move.  To call: ' + toCall + '   Pot: ' + hand.pot + '   (Left/Right, A)', 18, 218, { size: 8, c: '#9a96ae' });
      opts.forEach((op, i) => {
        const x = 18 + i * 140;
        ctx.fillStyle = i === sel ? '#ffd166' : '#2a2f45'; ctx.fillRect(x, 232, 128, 24);
        T(op.t, x + 64, 238, { size: 11, align: 'center', c: i === sel ? '#101010' : '#f2e6c9', shadow: false });
      });
    } else if (state === 'ai') {
      T(nm(actor) + ' is thinking...', 18, 224, { size: 10, c: '#9a96ae' });
    } else if (state === 'between') {
      T(this.handsDone + ' / ' + o.hands + ' hands played.   A: next   C: switch guy', 18, 224, { size: 9, c: '#9a96ae' });
      if (Math.floor(t * 2) % 2 === 0) T('▼', W - 30, 244, { size: 10 });
    } else if (state === 'final') {
      T('FINAL STANDINGS', 18, 218, { size: 10, c: '#ffd166' });
      this.winnerChips.forEach((c, i) => T((i + 1) + '. ' + nm(c) + ': ' + G.chips[c] + ' chips', 18 + i * 150, 236, { size: 10, c: CH[c].color }));
      T('A: continue', W - 20, 246, { size: 8, align: 'right', c: '#9a96ae' });
    }
    drawToast();
  };
  return S;
}
