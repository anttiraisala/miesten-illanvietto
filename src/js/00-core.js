'use strict';
// Miesten illanvietto: core engine (canvas, input, scene manager, game state)

const W = 480, H = 270;
const cv = document.getElementById('game');
const ctx = cv.getContext('2d');
cv.width = W; cv.height = H;
ctx.imageSmoothingEnabled = false;

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, f) => a + (b - a) * f;
const rnd = (a, b) => a + Math.random() * (b - a);
const ri = (a, b) => Math.floor(rnd(a, b + 1));
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const dist = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);
const NAMES = ['rauno', 'tuomas', 'antti'];
const CH = {
  rauno:  { name: 'Rauno',  color: '#8fe36a' },
  tuomas: { name: 'Tuomas', color: '#f2a65a' },
  antti:  { name: 'Antti',  color: '#9ec5ff' },
};

// ---------- screen fitting ----------
function fit() {
  const s = Math.min(innerWidth / W, innerHeight / H);
  const sc = s >= 2 ? Math.floor(s) : s;
  cv.style.width = Math.floor(W * sc) + 'px';
  cv.style.height = Math.floor(H * sc) + 'px';
}
addEventListener('resize', fit);
addEventListener('orientationchange', fit);
fit();

// ---------- input ----------
const Input = { down: {}, pressed: {} };
function setKey(k, v) {
  if (v && !Input.down[k]) Input.pressed[k] = true;
  Input.down[k] = v;
}
const KEYMAP = {
  ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
  ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down',
  Space: 'a', Enter: 'a', KeyZ: 'a', KeyX: 'b', Escape: 'b', Backspace: 'b',
  KeyC: 'sw', Tab: 'sw', KeyM: 'mute',
};
addEventListener('keydown', e => {
  const k = KEYMAP[e.code];
  if (!k) return;
  e.preventDefault();
  Snd.unlock();
  setKey(k, true);
});
addEventListener('keyup', e => {
  const k = KEYMAP[e.code];
  if (!k) return;
  e.preventDefault();
  setKey(k, false);
});
const IS_TOUCH = (window.matchMedia && matchMedia('(pointer:coarse)').matches) || 'ontouchstart' in window;
if (IS_TOUCH) document.body.classList.add('touch');
document.querySelectorAll('[data-k]').forEach(el => {
  const k = el.dataset.k;
  const on = e => { e.preventDefault(); Snd.unlock(); setKey(k, true); el.classList.add('on'); };
  const off = e => { e.preventDefault(); setKey(k, false); el.classList.remove('on'); };
  el.addEventListener('pointerdown', on);
  el.addEventListener('pointerup', off);
  el.addEventListener('pointercancel', off);
  el.addEventListener('pointerleave', off);
});
// tap on the canvas = A (advance dialogue)
cv.addEventListener('pointerdown', e => { e.preventDefault(); Snd.unlock(); setKey('a', true); });
cv.addEventListener('pointerup', () => setKey('a', false));
cv.addEventListener('pointercancel', () => setKey('a', false));
document.addEventListener('contextmenu', e => e.preventDefault());

// ---------- game state ----------
let G = null;
function newGame(start) {
  G = {
    player: start || 'tuomas',
    mood: 55, hunger: 35,
    bac: { rauno: 0, tuomas: 0, antti: 0 },
    beers: { rauno: 0, tuomas: 0, antti: 0 },
    shop: {}, flags: {}, log: [], snaps: [],
    chips: { rauno: 100, tuomas: 100, antti: 100 },
    pokerWins: { rauno: 0, tuomas: 0, antti: 0 },
    stats: {},
  };
}
newGame();
const addMood = n => { G.mood = clamp(G.mood + n, 0, 100); };
const addHunger = n => { G.hunger = clamp(G.hunger + n, 0, 100); };
function drinkBeer(who, n) {
  const k = n || 1;
  G.beers[who] += k;
  G.bac[who] = clamp(G.bac[who] + 0.07 * k, 0, 1);
}
function drinkAll(n) { NAMES.forEach(c => drinkBeer(c, n)); }
const others = (me) => NAMES.filter(c => c !== (me || G.player));
const nm = c => CH[c].name;

// event log: used to build the credits
function logEvent(id, credit, snap) {
  G.log.push({ id, credit, t: G.log.length });
  if (snap) Snap.take(id, credit);
}
const Snap = {
  take(id, caption) {
    try {
      const c = document.createElement('canvas');
      c.width = 240; c.height = 135;
      c.getContext('2d').drawImage(cv, 0, 0, 240, 135);
      G.snaps.push({ id, canvas: c, caption: caption || '' });
    } catch (e) { /* ignore */ }
  },
};

// ---------- toast ----------
const Toast = { text: '', t: 0, show(s, d) { this.text = s; this.t = d || 1.6; } };

// ---------- scene manager ----------
const Scenes = {
  cur: null, pending: null, fade: 0, state: 'run', time: 0,
  go(s, d) {
    if (this.pending) return;
    this.pending = { s, d };
    this.state = this.cur ? 'out' : 'swap';
    this.fade = 0;
  },
  update(dt) {
    this.time += dt;
    if (Toast.t > 0) Toast.t -= dt;
    if (this.state === 'out') {
      this.fade = Math.min(1, this.fade + dt / 0.22);
      if (this.fade >= 1) this.state = 'swap';
    }
    if (this.state === 'swap') {
      const p = this.pending; this.pending = null;
      this.cur = p.s;
      this.state = 'in'; this.fade = 1;
      if (this.cur.music !== undefined) Music.play(this.cur.music);
      if (this.cur.enter) this.cur.enter(p.d);
      Input.pressed = {};
    } else if (this.state === 'in') {
      this.fade = Math.max(0, this.fade - dt / 0.22);
      if (this.fade <= 0) this.state = 'run';
      Input.pressed = {};
    }
    if (!this.cur) return;
    if (Input.pressed.mute) { Snd.toggleMute(); }
    if (this.state === 'run' && Input.pressed.sw && !this.cur.noSwitch && G) {
      const i = NAMES.indexOf(G.player);
      G.player = NAMES[(i + 1) % 3];
      Snd.sfx('switch');
      Toast.show('Now playing: ' + nm(G.player));
      if (this.cur.onSwitch) this.cur.onSwitch();
    }
    if (this.state !== 'out' || true) this.cur.update(dt);
  },
  draw() {
    if (this.cur) this.cur.draw(ctx);
    else { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); }
  },
};
