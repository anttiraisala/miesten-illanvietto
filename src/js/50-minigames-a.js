// Minigames A: shop, RC car course, drone flight

// skill multipliers by character
const SKILL = {
  rc:    { tuomas: 1.2, rauno: 1.0, antti: 0.95 },
  drone: { tuomas: 1.2, rauno: 1.1, antti: 0.95 },
  cook:  { tuomas: 0.9, rauno: 0.95, antti: 1.35 },
};
const sk = (k) => SKILL[k][G.player];

// ---------- shop ----------
const SHOP_ITEMS = [
  { id: 'beer', name: 'Beer, 12 cans', price: 12 },
  { id: 'sausage', name: 'Grill sausages', price: 6 },
  { id: 'onion', name: 'Onions (the good ones)', price: 2 },
  { id: 'chips', name: 'Chips & dip', price: 4 },
  { id: 'mustard', name: 'Mustard of destiny', price: 2 },
  { id: 'herring', name: 'Suspicious herring', price: 5 },
  { id: 'cards', name: 'Fresh deck of cards', price: 3 },
];
function ShopScene(o) {
  let sel = 0, t = 0, msg = '', picked = {};
  const BUDGET = 26;
  const total = () => SHOP_ITEMS.reduce((a, it) => a + (picked[it.id] ? it.price : 0), 0);
  return {
    music: 'day', noSwitch: false,
    enter() { t = 0; sel = 0; picked = {}; msg = 'Budget: ' + BUDGET + ' EUR. Pick wisely.'; },
    bot() { if (sel < SHOP_ITEMS.length) { if (sel < 3 && !picked[SHOP_ITEMS[sel].id]) Input.pressed.a = true; else Input.pressed.down = true; } else Input.pressed.a = true; },
    update(dt) {
      t += dt;
      const n = SHOP_ITEMS.length + 1;
      if (Input.pressed.up) { sel = (sel + n - 1) % n; Snd.sfx('select'); }
      if (Input.pressed.down) { sel = (sel + 1) % n; Snd.sfx('select'); }
      if (Input.pressed.a) {
        if (sel < SHOP_ITEMS.length) {
          const it = SHOP_ITEMS[sel];
          if (picked[it.id]) { delete picked[it.id]; Snd.sfx('back'); }
          else if (total() + it.price > BUDGET) { Snd.sfx('bad'); msg = 'Not enough money for that!'; }
          else { picked[it.id] = true; Snd.sfx('coin'); msg = ''; }
        } else {
          G.shop = Object.assign({}, picked);
          if (!picked.beer) { addMood(-10); G.flags.noBeer = true; }
          if (!picked.sausage) G.flags.noSausage = true;
          if (picked.cards) G.flags.freshCards = true;
          if (picked.herring) G.flags.herring = true;
          if (picked.chips) addMood(3);
          const items = SHOP_ITEMS.filter(i => picked[i.id]).map(i => i.name.toLowerCase()).join(', ') || 'absolutely nothing';
          logEvent('shop', 'The shopping list: ' + items + '. Cashier verdict: "Interesting."');
          Snd.sfx('good');
          o.done();
        }
      }
    },
    draw() {
      BG.shop(t);
      panel(16, 22, 300, 220, '#141a33');
      T('THE SHOP', 30, 30, { size: 14, c: '#ffd166' });
      SHOP_ITEMS.forEach((it, i) => {
        const y = 56 + i * 22, on = picked[it.id];
        T((sel === i ? '► ' : '  ') + (on ? '[x] ' : '[ ] ') + it.name, 28, y, { size: 10, c: sel === i ? '#ffd166' : (on ? '#8fe36a' : '#f2e6c9') });
        T(it.price + ' EUR', 306, y, { size: 10, align: 'right', c: '#b8b0a0' });
      });
      T((sel === SHOP_ITEMS.length ? '► ' : '  ') + 'PAY & LEAVE', 28, 56 + SHOP_ITEMS.length * 22 + 6, { size: 11, c: sel === SHOP_ITEMS.length ? '#ffd166' : '#ff7aa8' });
      panel(330, 22, 134, 110, '#141a33');
      T('CART', 340, 30, { size: 11, c: '#ffd166' });
      T('Total: ' + total() + ' EUR', 340, 50, { size: 10 });
      T('Left:  ' + (BUDGET - total()) + ' EUR', 340, 64, { size: 10, c: BUDGET - total() < 4 ? '#ff7a7a' : '#8fe36a' });
      wrap(msg, 120, 8).forEach((l, i) => T(l, 340, 86 + i * 10, { size: 8, c: '#cdd8ff' }));
      Sprites.draw(ctx, G.player, 'out', 395, 250, { flip: true });
      T('Up/Down, A = pick', 400, 148, { size: 8, align: 'center', c: '#8c88a0' });
      drawHUD(); drawToast();
    },
  };
}

// ---------- RC car course ----------
function RCScene(o) {
  const cps = [[80, 70], [240, 45], [420, 80], [420, 215], [240, 165], [60, 225]];
  const boxes = [{ x: 170, y: 120, w: 36, h: 22 }, { x: 340, y: 130, w: 30, h: 30 }, { x: 205, y: 195, w: 46, h: 18 }];
  let car, cones, idx, time, hits, state, t, resultT, penalty, shake;
  return {
    music: 'day',
    enter() {
      car = { x: 50, y: 232, a: -Math.PI / 2, s: 0 };
      cones = [[130, 90], [160, 60], [300, 60], [360, 70], [450, 140], [400, 175], [330, 195], [300, 160], [140, 200], [100, 150]]
        .map(c => ({ x: c[0], y: c[1], vx: 0, vy: 0, fly: 0 }));
      idx = 0; time = 0; hits = 0; penalty = 0; state = 'ready'; t = 0; resultT = 0; shake = 0;
      this.ready = 2.2;
    },
    bot() {
      if (state === 'done') { Input.pressed.a = true; return; }
      const tg = cps[Math.min(idx, cps.length - 1)];
      let da = Math.atan2(tg[1] - car.y, tg[0] - car.x) - car.a;
      while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI;
      Input.down.left = da < -0.08; Input.down.right = da > 0.08; Input.down.up = Math.abs(da) < 1.2; Input.down.a = false; Input.down.down = false;
    },
    update(dt) {
      t += dt;
      if (shake > 0) shake -= dt;
      if (state === 'ready') { this.ready -= dt; if (this.ready <= 0) { state = 'go'; Snd.sfx('good'); } return; }
      if (state === 'done') { resultT += dt; if (Input.pressed.a && resultT > 0.6) o.done({ time, hits, rating: this.rating }); return; }
      time += dt;
      const k = sk('rc');
      const gas = Input.down.up || Input.down.a, brake = Input.down.down;
      if (gas) car.s += 150 * dt * k; else if (brake) car.s -= 220 * dt; else car.s *= Math.pow(0.35, dt);
      car.s = clamp(car.s, -45, 135 * k);
      const steer = (Input.down.left ? -1 : 0) + (Input.down.right ? 1 : 0);
      car.a += steer * 3.0 * dt * clamp(Math.abs(car.s) / 55, 0, 1) * Math.sign(car.s || 1) * (0.9 + 0.2 * k);
      car.x += Math.cos(car.a) * car.s * dt; car.y += Math.sin(car.a) * car.s * dt;
      if (car.x < 8 || car.x > W - 8 || car.y < 8 || car.y > H - 8) { car.x = clamp(car.x, 8, W - 8); car.y = clamp(car.y, 8, H - 8); car.s *= -0.3; Snd.sfx('bump'); }
      boxes.forEach(b => {
        if (car.x > b.x - 6 && car.x < b.x + b.w + 6 && car.y > b.y - 6 && car.y < b.y + b.h + 6) {
          car.x -= Math.cos(car.a) * car.s * dt * 1.5; car.y -= Math.sin(car.a) * car.s * dt * 1.5;
          car.s *= -0.35; penalty += 0.4; Snd.sfx('bump'); shake = 0.15;
        }
      });
      cones.forEach(c => {
        if (c.fly > 0) { c.fly -= dt; c.x += c.vx * dt; c.y += c.vy * dt; return; }
        if (dist(c.x, c.y, car.x, car.y) < 9) {
          c.fly = 0.8; c.vx = Math.cos(car.a) * car.s * 1.2 + rnd(-30, 30); c.vy = Math.sin(car.a) * car.s * 1.2 + rnd(-30, 30);
          car.s *= 0.55; hits++; penalty += 1; Snd.sfx('cone'); shake = 0.2;
        }
      });
      const tg = cps[idx];
      if (dist(tg[0], tg[1], car.x, car.y) < 22) {
        idx++;
        if (idx >= cps.length) {
          state = 'done'; time += penalty;
          this.rating = time < 16 ? 'S' : time < 21 ? 'A' : time < 29 ? 'B' : 'C';
          addMood({ S: 8, A: 5, B: 2, C: 0 }[this.rating]);
          Snd.sfx('finish');
          logEvent('rc', nm(G.player) + ' drove the RC course in ' + time.toFixed(1) + ' seconds with ' + hits + ' cone casualt' + (hits === 1 ? 'y' : 'ies') + '.', true);
          G.stats.rc = time;
        } else Snd.sfx('checkpoint');
      }
    },
    draw() {
      ctx.save();
      if (shake > 0) ctx.translate(rnd(-2, 2), rnd(-2, 2));
      rect(0, 0, W, H, '#5a5d68');
      for (let i = 0; i < 80; i++) rect((i * 73) % W, (i * 41) % H, 2, 1, '#666a76');
      for (let x = 20; x < W; x += 80) rect(x, 0, 2, H, 'rgba(255,255,255,0.06)');
      // finish line
      for (let i = 0; i < 6; i++) { rect(30 + i * 6, 222, 6, 6, i % 2 ? '#fff' : '#111'); rect(30 + i * 6, 228, 6, 6, i % 2 ? '#111' : '#fff'); }
      boxes.forEach(b => { rect(b.x, b.y, b.w, b.h, '#b98a4e'); rect(b.x, b.y, b.w, 3, '#d9aa6e'); rect(b.x + b.w / 2 - 1, b.y, 2, b.h, '#8d6733'); });
      cones.forEach(c => {
        if (c.fly > 0) { circle(c.x, c.y, 4, '#ff7a2a'); rect(c.x - 1, c.y - 1, 3, 3, '#fff'); }
        else { circle(c.x, c.y + 1, 4, 'rgba(0,0,0,0.3)'); circle(c.x, c.y, 4, '#ff7a2a'); circle(c.x, c.y, 2, '#fff'); }
      });
      cps.forEach((p, i) => {
        if (i < idx) return;
        const cur = i === idx;
        ctx.strokeStyle = cur ? (Math.floor(t * 4) % 2 ? '#ffd166' : '#fff') : 'rgba(255,255,255,0.25)';
        ctx.lineWidth = cur ? 2 : 1; ctx.beginPath(); ctx.arc(p[0], p[1], 18, 0, 7); ctx.stroke();
        T(i === cps.length - 1 ? 'F' : String(i + 1), p[0], p[1] - 5, { align: 'center', size: 10, c: cur ? '#ffd166' : '#999' });
      });
      // car
      ctx.save(); ctx.translate(car.x, car.y); ctx.rotate(car.a);
      rect(-8, -5, 16, 10, 'rgba(0,0,0,0.3)');
      rect(-7, -4, 14, 8, '#d92b2b'); rect(-2, -3, 6, 6, '#7fd0ff'); rect(5, -3, 2, 6, '#fff'); rect(-7, -5, 4, 2, '#111'); rect(-7, 3, 4, 2, '#111'); rect(3, -5, 4, 2, '#111'); rect(3, 3, 4, 2, '#111');
      ctx.restore();
      ctx.restore();
      // HUD
      drawHUD();
      T('TIME ' + (time + (state === 'done' ? 0 : penalty)).toFixed(1), 6, 36, { size: 10, c: '#fff' });
      T('Cones: ' + hits, 6, 48, { size: 8, c: '#ff9a4a' });
      T('Up/A gas  Down brake  Left/Right steer', W / 2, H - 12, { size: 8, align: 'center', c: '#b8b0a0' });
      if (state === 'ready') { T(this.ready > 1 ? 'GET READY...' : 'GO!', W / 2, 110, { size: 26, align: 'center', c: '#ffd166' }); T('Tuomas drives best (C to switch)', W / 2, 146, { size: 8, align: 'center', c: '#b8b0a0' }); }
      if (state === 'done') {
        panel(130, 80, 220, 90, '#10162e');
        T('FINISH!', W / 2, 90, { size: 16, align: 'center', c: '#ffd166' });
        T('Time ' + time.toFixed(1) + 's (incl. penalties)', W / 2, 114, { size: 10, align: 'center' });
        T('Rating: ' + this.rating, W / 2, 130, { size: 14, align: 'center', c: '#8fe36a' });
        T('A: continue', W / 2, 152, { size: 8, align: 'center', c: '#b8b0a0' });
      }
      drawToast();
    },
  };
}

// ---------- drone flight ----------
function DroneScene(o) {
  const rings = [[90, 70], [240, 55], [400, 120], [310, 215], [150, 160]];
  const trees = [[180, 105], [330, 80], [420, 190], [120, 205], [255, 150], [45, 120], [235, 215]];
  const pad = [240, 245];
  let d, idx, bat, t, state, wind, windT, shake, crashT, tree, result, landed, resultT;
  return {
    music: 'day',
    enter() {
      d = { x: 240, y: 235, vx: 0, vy: 0, alt: 0, spin: 0 };
      idx = 0; bat = 60; t = 0; state = 'ready'; wind = [0, 0]; windT = 3; shake = 0; crashT = 0; tree = false; landed = false; resultT = 0;
      this.ready = 2;
    },
    update(dt) {
      t += dt;
      if (shake > 0) shake -= dt;
      if (state === 'ready') { this.ready -= dt; if (this.ready <= 0) state = 'fly'; return; }
      if (state === 'crash') {
        crashT += dt; d.alt = Math.max(0, d.alt - 60 * dt); d.spin += dt * 12; d.vx *= 0.9; d.vy *= 0.9; d.x += d.vx * dt; d.y += d.vy * dt;
        if (crashT > 1.4) { state = 'done'; }
        return;
      }
      if (state === 'done') { resultT += dt; if (Input.pressed.a && resultT > 0.6) o.done(result); return; }
      const k = sk('drone');
      const ax = (Input.down.right ? 1 : 0) - (Input.down.left ? 1 : 0), ay = (Input.down.down ? 1 : 0) - (Input.down.up ? 1 : 0);
      d.vx += ax * 230 * dt * k + wind[0] * dt; d.vy += ay * 230 * dt * k + wind[1] * dt;
      const drag = Math.pow(0.28 / (0.9 + 0.1 * k), dt);
      d.vx *= drag; d.vy *= drag;
      d.x += d.vx * dt; d.y += d.vy * dt;
      d.x = clamp(d.x, 6, W - 6); d.y = clamp(d.y, 6, H - 6);
      d.alt = Math.min(1, d.alt + dt * 2);
      d.spin += dt * 40;
      bat -= dt;
      windT -= dt;
      if (windT <= 0) { wind = Math.random() < 0.5 ? [0, 0] : [rnd(-60, 60), rnd(-60, 60)]; windT = rnd(2, 4); }
      const r = rings[idx];
      if (r && dist(r[0], r[1], d.x, d.y) < 14) { idx++; Snd.sfx('ring'); addMood(1); }
      for (const tr of trees) {
        if (dist(tr[0], tr[1], d.x, d.y) < 12) { this.crash(true); return; }
      }
      if (bat <= 0) { this.crash(false); return; }
      if (idx >= rings.length && Input.pressed.a) {
        const sp = Math.hypot(d.vx, d.vy);
        if (dist(pad[0], pad[1], d.x, d.y) < 22 && sp < 45) {
          landed = true; state = 'done'; Snd.sfx('finish'); addMood(8);
          result = { landed: true, tree: false, rings: idx };
          logEvent('drone_land', nm(G.player) + ' landed the drone perfectly. Everyone assumed it was luck.', true);
        } else this.crash(false);
      }
    },
    bot() {
      if (state === 'done') { Input.pressed.a = true; return; }
      if (state !== 'fly') return;
      const tg = idx < rings.length ? rings[idx] : pad;
      let vx = tg[0] - d.x, vy = tg[1] - d.y;
      const l = Math.hypot(vx, vy) || 1; vx /= l; vy /= l;
      trees.forEach(tr => { const dd = dist(tr[0], tr[1], d.x, d.y); if (dd < 48) { vx += (d.x - tr[0]) / dd * (48 - dd) / 12; vy += (d.y - tr[1]) / dd * (48 - dd) / 12; } });
      const sp = Math.hypot(d.vx, d.vy);
      const near = idx >= rings.length && dist(pad[0], pad[1], d.x, d.y) < 60;
      Input.down.left = vx < -0.3 && !(near && sp > 30 && d.vx < 0 && vx > -0.8); Input.down.right = vx > 0.3; Input.down.up = vy < -0.3; Input.down.down = vy > 0.3;
      if (near) { Input.down.left = d.vx > 6 || (vx < -0.5 && sp < 25); Input.down.right = d.vx < -6 || (vx > 0.5 && sp < 25); Input.down.up = d.vy > 6 || (vy < -0.5 && sp < 25); Input.down.down = d.vy < -6 || (vy > 0.5 && sp < 25); }
      if (idx >= rings.length && dist(pad[0], pad[1], d.x, d.y) < 18 && sp < 35) Input.pressed.a = true;
    },
    crash(hitTree) {
      state = 'crash'; crashT = 0; tree = hitTree; shake = 0.6; Snd.sfx('crash'); addMood(hitTree ? 4 : -2);
      result = { landed: false, tree: hitTree, rings: idx };
      G.flags.droneTree = hitTree; G.flags.droneCrash = true;
      logEvent(hitTree ? 'drone_tree' : 'drone_crash', hitTree
        ? "Tuomas's drone met a tree. The tree won."
        : "Tuomas's drone met the ground at an optimistic speed.", true);
    },
    draw() {
      ctx.save();
      if (shake > 0) ctx.translate(rnd(-3, 3), rnd(-3, 3));
      rect(0, 0, W, H, '#4e9a46');
      for (let i = 0; i < 160; i++) rect((i * 61) % W, (i * 37) % H, 2, 3, i % 3 ? '#439040' : '#5dac55');
      rect(210, 232, 60, 26, '#9a9fa8'); rect(212, 234, 56, 22, '#b4b8c0'); T('H', 240, 237, { size: 14, align: 'center', c: '#ff7a2a' });
      rings.forEach((p, i) => {
        if (i < idx) return;
        const cur = i === idx;
        ctx.strokeStyle = cur ? (Math.floor(t * 5) % 2 ? '#ffd166' : '#ff7aa8') : 'rgba(255,255,255,0.3)';
        ctx.lineWidth = cur ? 3 : 1; ctx.beginPath(); ctx.arc(p[0], p[1], 14, 0, 7); ctx.stroke();
      });
      trees.forEach(tr => {
        circle(tr[0] + 3, tr[1] + 4, 14, 'rgba(0,0,0,0.25)');
        circle(tr[0], tr[1], 14, '#245f2e'); circle(tr[0] - 4, tr[1] - 4, 9, '#2f7d3a'); circle(tr[0] + 5, tr[1] + 2, 6, '#3c9448');
      });
      // drone
      const lift = d.alt * 8;
      circle(d.x + 4, d.y + lift + 4, 7, 'rgba(0,0,0,0.3)');
      ctx.save(); ctx.translate(d.x, d.y - lift * 0.4);
      if (state === 'crash') ctx.rotate(d.spin);
      rect(-3, -3, 6, 6, '#222');
      [[-7, -7], [7, -7], [-7, 7], [7, 7]].forEach(p => {
        rect(p[0] / 2 - 1, p[1] / 2 - 1, 2, 2, '#444');
        const a = d.spin;
        ctx.strokeStyle = 'rgba(220,220,255,0.8)'; ctx.lineWidth = 1; ctx.beginPath();
        ctx.moveTo(p[0] + Math.cos(a) * 5, p[1] + Math.sin(a) * 5); ctx.lineTo(p[0] - Math.cos(a) * 5, p[1] - Math.sin(a) * 5); ctx.stroke();
      });
      rect(-1, -1, 2, 2, '#ff3a3a');
      ctx.restore();
      ctx.restore();
      drawHUD();
      T('BATTERY', 6, 36, { size: 8 }); bar(52, 37, 60, 5, bat / 60, bat < 12 ? '#ff4a4a' : '#7cf04a');
      T('Rings: ' + Math.min(idx, rings.length) + '/' + rings.length, 6, 48, { size: 8, c: '#ffd166' });
      if (idx >= rings.length && state === 'fly') T('LAND ON THE H PAD: slow down and press A!', W / 2, 20, { size: 10, align: 'center', c: '#ffd166' });
      if (wind[0] || wind[1]) T('WIND!', W - 60, 40, { size: 10, c: '#bfe3ff' });
      T('Arrows: fly', W / 2, H - 12, { size: 8, align: 'center', c: '#b8b0a0' });
      if (state === 'ready') { T(this.ready > 1 ? 'PRE-FLIGHT CHECK...' : 'TAKEOFF!', W / 2, 110, { size: 22, align: 'center', c: '#ffd166' }); T('Fly through the rings. Avoid the trees. (Good luck.)', W / 2, 142, { size: 9, align: 'center', c: '#fff' }); }
      if (state === 'crash') T(tree ? 'CRASH! Into a tree!' : 'CRASH!', W / 2, 100, { size: 20, align: 'center', c: '#ff4a4a' });
      if (state === 'done') {
        panel(130, 80, 220, 80, '#10162e');
        T(landed ? 'PERFECT LANDING' : (tree ? 'TREE: 1  DRONE: 0' : 'THE DRONE IS DOWN'), W / 2, 92, { size: 13, align: 'center', c: landed ? '#8fe36a' : '#ff7a7a' });
        T('Rings: ' + Math.min(idx, rings.length) + ' / ' + rings.length, W / 2, 116, { size: 10, align: 'center' });
        T('A: continue', W / 2, 140, { size: 8, align: 'center', c: '#b8b0a0' });
      }
      drawToast();
    },
  };
}
