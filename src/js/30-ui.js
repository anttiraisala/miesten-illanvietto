// UI helpers: text, panels, bars, HUD, toast overlay, drunk wobble

function setFont(size) { ctx.font = 'bold ' + size + 'px "Courier New",monospace'; }
function tw(s, size) { setFont(size || 10); return ctx.measureText(s).width; }
function T(s, x, y, o) {
  o = o || {};
  setFont(o.size || 10);
  ctx.textBaseline = 'top'; ctx.textAlign = o.align || 'left';
  if (o.shadow !== false) { ctx.fillStyle = o.sh || '#000'; ctx.fillText(s, Math.round(x) + 1, Math.round(y) + 1); }
  ctx.fillStyle = o.c || '#f2e6c9';
  ctx.fillText(s, Math.round(x), Math.round(y));
  ctx.textAlign = 'left';
}
function wrap(s, maxW, size) {
  setFont(size || 10);
  const out = [];
  s.split('\n').forEach(par => {
    const words = par.split(' ');
    let line = '';
    words.forEach(w => {
      const t = line ? line + ' ' + w : w;
      if (ctx.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t;
    });
    out.push(line);
  });
  return out;
}
function panel(x, y, w, h, fill, border) {
  ctx.fillStyle = border || '#f2e6c9'; ctx.fillRect(x - 2, y - 2, w + 4, h + 4);
  ctx.fillStyle = '#000'; ctx.fillRect(x - 1, y - 1, w + 2, h + 2);
  ctx.fillStyle = fill || '#141a33'; ctx.fillRect(x, y, w, h);
}
function bar(x, y, w, h, v, col, bg) {
  ctx.fillStyle = '#000'; ctx.fillRect(x - 1, y - 1, w + 2, h + 2);
  ctx.fillStyle = bg || '#2a2f45'; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = col; ctx.fillRect(x, y, Math.round(w * clamp(v, 0, 1)), h);
}
function mix(a, b, f) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const r = Math.round(lerp(pa >> 16, pb >> 16, f)), g = Math.round(lerp((pa >> 8) & 255, (pb >> 8) & 255, f)), bl = Math.round(lerp(pa & 255, pb & 255, f));
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | bl).toString(16).slice(1);
}
function rect(x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
function circle(x, y, r, c) { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }

// HUD: mood / hunger / blood alcohol of the current player, plus "who am I" badge
function drawHUD() {
  if (!G) return;
  const x = 6, y = 6;
  T('FIILIS', x, y, { size: 8 }); bar(x + 34, y + 1, 50, 5, G.mood / 100, '#ff7aa8');
  T('MAHA', x, y + 10, { size: 8 }); bar(x + 34, y + 11, 50, 5, 1 - G.hunger / 100, '#ffd166');
  T('KALJA', x, y + 20, { size: 8 }); bar(x + 34, y + 21, 50, 5, G.bac[G.player], '#f2a02e');
  const bx = W - 92;
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(bx - 2, 4, 90, 30);
  Sprites.head(ctx, G.player, 'in', bx, 6, 1);
  T(nm(G.player).toUpperCase(), bx + 30, 9, { size: 10, c: CH[G.player].color });
  T('C: vaihda', bx + 30, 21, { size: 8, c: '#b8b0a0' });
}
function drawToast() {
  if (Toast.t <= 0) return;
  const w = tw(Toast.text, 10) + 16;
  ctx.fillStyle = 'rgba(0,0,0,0.75)'; ctx.fillRect(W / 2 - w / 2, 40, w, 18);
  T(Toast.text, W / 2, 44, { align: 'center', size: 10 });
}

// wobble effect when drunk (horizontal row shifts)
let wobbleBuf = null;
function applyWobble(strength, t) {
  if (strength < 0.15) return;
  if (!wobbleBuf) { wobbleBuf = document.createElement('canvas'); wobbleBuf.width = W; wobbleBuf.height = H; }
  const wg = wobbleBuf.getContext('2d');
  wg.drawImage(cv, 0, 0);
  const amp = strength * 4;
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  for (let y = 0; y < H; y += 2) {
    const dx = Math.round(Math.sin(t * 2.2 + y * 0.05) * amp);
    ctx.drawImage(wobbleBuf, 0, y, W, 2, dx, y, W, 2);
  }
}
