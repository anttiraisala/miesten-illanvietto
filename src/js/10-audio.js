// Audio: Web Audio chiptune music + synthesized sound effects (no audio files)

const Snd = (() => {
  let ac = null, master = null, musicGain = null, sfxGain = null, noiseBuf = null;
  let muted = false;
  try { muted = localStorage.getItem('mi_muted') === '1'; } catch (e) { /* ignore */ }

  function unlock() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ac = new AC();
      master = ac.createGain(); master.gain.value = muted ? 0 : 0.6; master.connect(ac.destination);
      musicGain = ac.createGain(); musicGain.gain.value = 0.30; musicGain.connect(master);
      sfxGain = ac.createGain(); sfxGain.gain.value = 0.8; sfxGain.connect(master);
      const len = ac.sampleRate;
      noiseBuf = ac.createBuffer(1, len, ac.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      Music.begin();
    } catch (e) { ac = null; }
  }
  function toggleMute() {
    muted = !muted;
    try { localStorage.setItem('mi_muted', muted ? '1' : '0'); } catch (e) { /* ignore */ }
    if (master) master.gain.value = muted ? 0 : 0.6;
    Toast.show(muted ? 'Ääni pois' : 'Ääni päällä');
  }
  const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  function freq(n) {
    const m = /^([A-G])([#b]?)(\d)$/.exec(n);
    if (!m) return 0;
    const s = NOTE[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
    const midi = 12 * (+m[3] + 1) + s;
    return 440 * Math.pow(2, (midi - 69) / 12);
  }
  function tone(f, t0, dur, type, vol, dest, slideTo) {
    if (!ac || !f) return;
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type || 'square';
    o.frequency.setValueAtTime(f, t0);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + Math.max(0.03, dur));
    o.connect(g); g.connect(dest || sfxGain);
    o.start(t0); o.stop(t0 + dur + 0.05);
  }
  function noise(t0, dur, vol, dest, hp) {
    if (!ac) return;
    const s = ac.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
    const g = ac.createGain();
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    let node = s;
    if (hp) { const f = ac.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp; s.connect(f); node = f; }
    node.connect(g); g.connect(dest || sfxGain);
    s.start(t0); s.stop(t0 + dur + 0.05);
  }
  function sfx(name) {
    if (!ac || muted) return;
    const t = ac.currentTime;
    const seq = (notes, step, type, vol, dur) => notes.forEach((n, i) => tone(freq(n), t + i * step, dur || step * 1.3, type || 'square', vol || 0.2));
    switch (name) {
      case 'select': tone(880, t, 0.05, 'square', 0.12); break;
      case 'confirm': seq(['E5', 'A5'], 0.06, 'square', 0.18); break;
      case 'back': seq(['A4', 'E4'], 0.06, 'square', 0.15); break;
      case 'bad': tone(180, t, 0.25, 'sawtooth', 0.2, null, 70); break;
      case 'good': seq(['C5', 'E5', 'G5', 'C6'], 0.06, 'square', 0.18); break;
      case 'coin': seq(['B5', 'E6'], 0.07, 'square', 0.16); break;
      case 'switch': seq(['C5', 'G5'], 0.05, 'triangle', 0.25); break;
      case 'crash': noise(t, 0.5, 0.5); tone(220, t, 0.5, 'sawtooth', 0.25, null, 40); break;
      case 'cone': noise(t, 0.12, 0.35); tone(300, t, 0.1, 'square', 0.15, null, 120); break;
      case 'bump': tone(120, t, 0.1, 'square', 0.2, null, 60); break;
      case 'checkpoint': seq(['G5', 'C6'], 0.07, 'square', 0.16); break;
      case 'finish': seq(['C5', 'E5', 'G5', 'C6', 'E6', 'G6'], 0.07, 'square', 0.16); break;
      case 'ring': seq(['E6', 'A6'], 0.05, 'triangle', 0.3); break;
      case 'sizzle': noise(t, 0.7, 0.28, null, 2500); break;
      case 'steam': noise(t, 0.9, 0.3, null, 1200); tone(200, t, 0.5, 'triangle', 0.1, null, 400); break;
      case 'card': noise(t, 0.05, 0.3, null, 3000); tone(500, t, 0.03, 'square', 0.06); break;
      case 'chip': tone(1600, t, 0.03, 'square', 0.1); tone(2100, t + 0.04, 0.03, 'square', 0.1); break;
      case 'clink': tone(2093, t, 0.18, 'triangle', 0.25); tone(2637, t + 0.02, 0.18, 'triangle', 0.18); break;
      case 'love': seq(['E5', 'G5', 'B5', 'E6'], 0.09, 'triangle', 0.3, 0.2); break;
      case 'burn': noise(t, 0.4, 0.3, null, 800); tone(300, t, 0.4, 'sawtooth', 0.12, null, 60); break;
      case 'win': seq(['C5', 'C5', 'C5', 'E5', 'G5', 'E5', 'G5', 'C6'], 0.09, 'square', 0.18); break;
      case 'lose': seq(['E4', 'D4', 'C4', 'A3'], 0.12, 'triangle', 0.3, 0.2); break;
      case 'tick': tone(1000, t, 0.02, 'square', 0.07); break;
      case 'whoosh': noise(t, 0.3, 0.25, null, 600); break;
      case 'hot': tone(260, t, 0.25, 'sawtooth', 0.1, null, 520); break;
      default: break;
    }
  }
  function blip(ch) {
    if (!ac || muted) return;
    const f = 260 + (ch.charCodeAt(0) % 12) * 18;
    tone(f, ac.currentTime, 0.03, 'square', 0.035);
  }
  return { unlock, toggleMute, sfx, blip, freq, tone, noise, ctx: () => ac, music: () => musicGain, isMuted: () => muted };
})();

// ---------- music sequencer ----------
// Tracks: lead/bass are space separated tokens, one token = one eighth note.
// '-' rest, '_' hold previous note, '|' bar line (ignored). perc: k kick, s snare, h hat, '.' none.
const TRACKS = {
  title: { bpm: 132, wave: 'square',
    lead: 'C5 E5 G5 E5 C5 E5 G5 _ | A4 C5 E5 C5 A4 C5 E5 _ | F4 A4 C5 A4 F4 A4 C5 _ | G4 B4 D5 B4 G5 _ D5 _',
    bass: 'C3 _ C3 _ G2 _ G2 _ | A2 _ A2 _ E3 _ E3 _ | F2 _ F2 _ C3 _ C3 _ | G2 _ G2 _ G2 _ B2 _',
    perc: 'k.h.s.h. k.h.s.h. k.h.s.h. k.hks.hh' },
  day: { bpm: 142, wave: 'square',
    lead: 'G4 B4 D5 B4 G4 B4 D5 _ | E5 D5 B4 D5 E5 _ - - | C5 E5 G5 E5 C5 E5 G5 _ | D5 C5 B4 A4 G4 _ - -',
    bass: 'G2 - D3 - G2 - D3 - | E2 - B2 - E2 - B2 - | C3 - G3 - C3 - G3 - | D3 - A3 - D3 - G2 -',
    perc: 'k.hhs.hh k.hhs.hh k.hhs.hh k.hhs.sk' },
  sauna: { bpm: 76, wave: 'triangle',
    lead: 'D5 _ _ _ F5 _ A5 _ | G5 _ _ _ F5 _ E5 _ | D5 _ _ _ C5 _ A4 _ | Bb4 _ A4 _ D5 _ _ _',
    bass: 'D3 _ _ _ A3 _ _ _ | G2 _ _ _ D3 _ _ _ | Bb2 _ _ _ F3 _ _ _ | A2 _ _ _ D3 _ _ _',
    perc: '........ ....h... ........ ....h...' },
  kitchen: { bpm: 156, wave: 'square',
    lead: 'A4 - C5 A4 E5 - C5 A4 | G4 - B4 G4 D5 - B4 G4 | F4 - A4 F4 C5 - A4 F4 | E4 G4 B4 E5 D5 - B4 -',
    bass: 'A2 A2 - A3 A2 - E3 - | G2 G2 - G3 G2 - D3 - | F2 F2 - F3 F2 - C3 - | E2 E2 - E3 E2 - B2 -',
    perc: 'k.h.s.hk k.h.s.hk k.h.s.hk k.hks.hh' },
  poker: { bpm: 104, wave: 'square',
    lead: 'E4 - - G4 - B4 - - | A4 - - C5 - E5 - - | D4 - - F4 - A4 - - | B3 - D4 - E4 - - -',
    bass: 'E2 - E2 - G2 - E2 - | A2 - A2 - C3 - A2 - | D2 - D2 - F2 - D2 - | B1 - B2 - E2 - E2 -',
    perc: 'k...s.h. k.h.s... k...s.h. k.h.s.hs' },
  restaurant: { bpm: 126, wave: 'square',
    lead: 'F5 A5 C6 A5 F5 A5 C6 _ | Bb5 A5 G5 F5 E5 _ - - | D5 F5 A5 F5 D5 F5 A5 _ | G5 F5 E5 D5 C5 _ - -',
    bass: 'F3 - C3 - F3 - C3 - | Bb2 - F3 - Bb2 - F3 - | D3 - A2 - D3 - A2 - | C3 - G2 - C3 - E3 -',
    perc: 'k.h.s.h. k.h.s.hh k.h.s.h. k.hks.hh' },
  night: { bpm: 88, wave: 'triangle',
    lead: 'A4 _ C5 _ E5 _ D5 _ | C5 _ _ _ A4 _ - - | F4 _ A4 _ C5 _ B4 _ | G4 _ _ _ E4 _ - -',
    bass: 'A2 _ _ _ E3 _ _ _ | C3 _ _ _ G3 _ _ _ | F2 _ _ _ C3 _ _ _ | G2 _ _ _ E3 _ _ _',
    perc: 'k....... ....s... k....... ....s.h.' },
  credits: { bpm: 108, wave: 'square',
    lead: 'C5 _ E5 _ G5 _ E5 _ | F5 _ A5 _ G5 _ E5 _ | D5 _ F5 _ A5 _ F5 _ | G5 _ B5 _ C6 _ - -',
    bass: 'C3 - G2 - C3 - G2 - | F2 - C3 - F2 - C3 - | D3 - A2 - D3 - A2 - | G2 - D3 - C3 - G2 -',
    perc: 'k.h.s.h. k.h.s.h. k.h.s.h. k.hks.hh' },
};

const Music = (() => {
  let cur = null, want = null, step = 0, nextT = 0, timer = null;
  const parsed = {};
  function parse(str) {
    const toks = str.split(/[\s|]+/).filter(Boolean);
    const out = [];
    for (let i = 0; i < toks.length; i++) {
      if (toks[i] === '-' || toks[i] === '_') { out.push(null); continue; }
      let len = 1;
      while (toks[i + len] === '_') len++;
      out.push({ f: Snd.freq(toks[i]), len });
    }
    return out;
  }
  function get(name) {
    if (!parsed[name]) {
      const t = TRACKS[name];
      parsed[name] = { t, lead: parse(t.lead), bass: parse(t.bass), perc: t.perc.replace(/\s/g, '') };
    }
    return parsed[name];
  }
  function tick() {
    const ac = Snd.ctx();
    if (!ac || !cur) return;
    const p = get(cur), dur = 60 / p.t.bpm / 2;
    while (nextT < ac.currentTime + 0.2) {
      const L = p.lead[step % p.lead.length], B = p.bass[step % p.bass.length], c = p.perc[step % p.perc.length];
      if (L) Snd.tone(L.f, nextT, L.len * dur * 0.92, p.t.wave, 0.20, Snd.music());
      if (B) Snd.tone(B.f, nextT, B.len * dur * 0.95, 'triangle', 0.34, Snd.music());
      if (c === 'k') Snd.tone(140, nextT, 0.11, 'sine', 0.5, Snd.music(), 40);
      else if (c === 's') Snd.noise(nextT, 0.11, 0.30, Snd.music(), 1500);
      else if (c === 'h') Snd.noise(nextT, 0.03, 0.12, Snd.music(), 6000);
      nextT += dur; step++;
    }
  }
  function start(name) {
    const ac = Snd.ctx();
    cur = name; step = 0;
    if (!ac) return;
    nextT = ac.currentTime + 0.08;
    if (!timer) timer = setInterval(tick, 40);
  }
  function play(name) {
    if (name === want) return;
    want = name;
    if (!name) { cur = null; return; }
    start(name);
  }
  function begin() { if (want) start(want); }
  return { play, begin, current: () => want };
})();
