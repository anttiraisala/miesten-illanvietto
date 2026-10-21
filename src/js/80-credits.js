// End credits: polaroid "photos" hop between left and right while text scrolls on the opposite side.

const CREDIT_HEAD = {
  shop: 'SUPPLY CHAIN', rc: 'MOTORSPORT', drone_tree: 'AVIATION', drone_land: 'AVIATION', drone_crash: 'AVIATION',
  steam: 'THERMAL ARTS', endurance: 'ENDURANCE', compliment: 'EMOTIONAL SUPPORT', hug: 'EMOTIONAL SUPPORT', hug_fail: 'EMOTIONAL SUPPORT',
  porch: 'LAKE RELATIONS', cook: 'CULINARY ARTS', golden: 'CULINARY ARTS', poker_home: 'GAMBLING (FOR HONOR)', poker_restaurant: 'GAMBLING (FOR HONOR)', poker: 'GAMBLING (FOR HONOR)',
  seagull: 'WILDLIFE', cat: 'WILDLIFE', kebab: 'LOGISTICS', cheers: 'HYDRATION', lamp: 'URBAN PLANNING', ride: 'TRANSPORT',
};
const CREDIT_EXTRA = {
  rc: ['Kevin the RC car: as himself'], drone_tree: ['The tree: as itself', 'Drone retrieval: pending'], drone_crash: ['Gravity: as itself'],
  steam: ['Steam consultant: Rauno'], endurance: ['Cooling off: nobody'], cook: ['Kitchen safety officer: none'], golden: ['Sausages: as themselves'],
  porch: ['Lake: as itself'], poker_home: ['Poker faces: sourced locally'], poker_restaurant: ['Chips: emotionally damaged'],
  ride: ['Taxi: eventually'], hug: ['Towels: reluctantly'], cheers: ['Beer: plentiful'], seagull: ['Seagull: as the winner'],
};

function drawPolaroid(x, y, rot, snap) {
  ctx.save();
  ctx.translate(Math.round(x + 106), Math.round(y + 82)); ctx.rotate(rot);
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(-100 + 4, -78 + 5, 212, 164);
  ctx.fillStyle = '#f4f0e4'; ctx.fillRect(-106, -82, 212, 164);
  ctx.save(); ctx.translate(-100, -76); ctx.beginPath(); ctx.rect(0, 0, 200, 113); ctx.clip();
  if (snap.canvas) ctx.drawImage(snap.canvas, 0, 0, 240, 135, 0, 0, 200, 113);
  else snap.draw(0, 0);
  ctx.restore();
  T(snap.caption || '', 0, 46, { size: 8, align: 'center', c: '#4a4038', shadow: false });
  ctx.restore();
}
// local-coordinate drawing helpers for generated "photos" (200x113 area at origin ox,oy)
function drawPoster(ox, oy) {
  ctx.save(); ctx.translate(ox, oy);
  rect(0, 0, 200, 113, mix('#d9694a', '#ffd9a0', 0.5)); rect(0, 70, 200, 43, '#4b4e5a');
  circle(150, 40, 16, '#ffe9a8');
  ['tuomas', 'antti', 'rauno'].forEach((c, i) => Sprites.draw(ctx, c, 'out', 52 + i * 48, 112, { scale: 1 }));
  ctx.restore();
}
function drawSelfie(ox, oy) {
  ctx.save(); ctx.translate(ox, oy);
  rect(0, 0, 200, 113, '#b4b6bd'); rect(0, 0, 200, 14, '#6b6d76'); rect(10, 22, 50, 50, '#9fd0f0'); rect(140, 22, 50, 50, '#9fd0f0');
  Sprites.head(ctx, 'antti', 'out', 74, 20, 2);
  Sprites.head(ctx, 'rauno', 'out', 8, 40, 2);
  Sprites.head(ctx, 'tuomas', 'out', 140, 40, 2);
  rect(0, 96, 200, 17, '#2a2c33'); rect(0, 94, 200, 3, '#44464f');
  ctx.restore();
}

function CreditsScene() {
  let slides = [], i = 0, t = 0, prev = null, prevT = 0, ended = false;
  function build() {
    slides = [];
    slides.push({ head: 'MIESTEN ILLANVIETTO', lines: ['A production of three friends', '', 'STARRING', 'Rauno as The Professor', 'Tuomas as The Pilot (allegedly)', 'Antti as The Chef', '', 'Filmed on location in Finland'], snap: { draw: drawPoster, caption: 'the guys' } });
    const byId = {};
    G.snaps.forEach(s => { byId[s.id] = s; });
    let ids = Object.keys(byId);
    if (ids.length > 9) ids = ids.filter((k, idx) => idx % Math.ceil(ids.length / 9) === 0 || idx === ids.length - 1).slice(0, 9);
    ids.forEach(id => {
      const s = byId[id];
      const log = G.log.filter(l => l.id === id).pop() || G.log.filter(l => l.id === id.split('_')[0]).pop();
      const text = log ? log.credit : s.caption;
      const lines = wrap(text, 190, 9);
      (CREDIT_EXTRA[id] || []).forEach(x => { lines.push(''); lines.push(x); });
      slides.push({ head: CREDIT_HEAD[id] || 'HIGHLIGHTS', lines, snap: { canvas: s.canvas, caption: s.caption.length > 34 ? s.caption.slice(0, 32) + '..' : s.caption } });
    });
    const label = G.mood >= 85 ? 'LEGENDARY EVENING' : G.mood >= 65 ? 'GREAT EVENING' : G.mood >= 45 ? 'SOLID EVENING' : 'AWKWARD BUT MEMORABLE EVENING';
    const stat = [label, '', 'Beers'].concat(NAMES.map(c => nm(c) + ': ' + G.beers[c]));
    stat.push('');
    if (G.flags.pokerWinner_home) stat.push('Home poker champion: ' + nm(G.flags.pokerWinner_home));
    if (G.flags.pokerWinner_restaurant) stat.push('Pub poker champion: ' + nm(G.flags.pokerWinner_restaurant));
    if (G.flags.saunaWinner) stat.push('Sauna endurance: ' + nm(G.flags.saunaWinner));
    stat.push('Burnt dinners: ' + (G.flags.burnt || 0));
    stat.push('Drone status: ' + (G.flags.droneTree ? 'in a tree' : G.flags.droneCrash ? 'on the ground' : 'airworthy'));
    const out = [];
    stat.forEach(l => wrap(l, 190, 9).forEach(x => out.push(x)));
    slides.push({ head: 'THE NUMBERS', lines: out, snap: { draw: drawSelfie, caption: 'the ride home' } });
    slides.push({ head: 'THE END', lines: ['', 'Thanks for the evening.', 'Same time next month?', '', 'Press A to play again'], snap: { draw: drawSelfie, caption: 'see you next time' }, last: true });
    slides.forEach(s => { s.dur = s.last ? 9999 : Math.max(7, (H + s.lines.length * 13) / 34); });
  }
  return {
    music: 'credits', hud: false, noSwitch: true,
    enter() { build(); i = 0; t = 0; prev = null; ended = false; (window.__trace = window.__trace || []).push('credits'); },
    update(dt) {
      t += dt; prevT += dt;
      const s = slides[i];
      if (Input.pressed.a && t > 0.5) {
        if (s.last) { Snd.sfx('confirm'); go(TitleScene()); return; }
        prev = s; prevT = 0; i++; t = 0; Snd.sfx('whoosh');
      } else if (t > s.dur && !s.last) { prev = s; prevT = 0; i++; t = 0; Snd.sfx('whoosh'); }
    },
    draw() {
      rect(0, 0, W, H, '#0a0818');
      for (let k = 0; k < 60; k++) if (Math.sin(Scenes.time * 2 + k) > -0.5) rect((k * 97) % W, (k * 53) % H, 1, 1, 'rgba(255,255,255,0.35)');
      rect(0, 0, W, 14, '#000'); rect(0, H - 14, W, 14, '#000');
      for (let x = 4; x < W; x += 16) { rect(x, 4, 8, 6, '#1a1730'); rect(x, H - 10, 8, 6, '#1a1730'); }
      const s = slides[i];
      const side = i % 2 === 0 ? 'L' : 'R';
      const target = side === 'L' ? 22 : W - 232;
      // exiting previous photo
      if (prev && prevT < 0.55) {
        const pside = (i - 1) % 2 === 0 ? 'L' : 'R';
        const px0 = pside === 'L' ? 22 : W - 232;
        const f = prevT / 0.55;
        drawPolaroid(px0 + (pside === 'L' ? -1 : 1) * f * 320, 48 - Math.sin(f * 3.14) * 18, (pside === 'L' ? -1 : 1) * 0.05 + f * 0.4 * (pside === 'L' ? -1 : 1), prev.snap);
      }
      // entering photo
      const e = clamp(t / 0.6, 0, 1), ease = 1 - Math.pow(1 - e, 3);
      const fromX = side === 'L' ? -240 : W + 30;
      const px = lerp(fromX, target, ease);
      const hop = Math.abs(Math.sin(e * 3.14 * 2)) * 22 * (1 - e);
      const float = e >= 1 ? Math.sin(t * 2) * 2 : 0;
      drawPolaroid(px, 48 - hop + float, (side === 'L' ? -1 : 1) * 0.05, s.snap);
      // scrolling text on the opposite side
      const tx = side === 'L' ? 368 : 118;
      const y0 = H - 30 - t * 34;
      ctx.save(); ctx.beginPath(); ctx.rect(side === 'L' ? 250 : 8, 16, 220, H - 32); ctx.clip();
      T(s.head, tx, y0, { size: 13, align: 'center', c: '#ffd166' });
      s.lines.forEach((l, k) => T(l, tx, y0 + 24 + k * 13, { size: 9, align: 'center', c: '#f2e6c9' }));
      ctx.restore();
      if (s.last && Math.floor(Scenes.time * 2) % 2 === 0) T('A: play again', W / 2, H - 28, { size: 9, align: 'center', c: '#fff' });
      drawToast();
    },
  };
}
