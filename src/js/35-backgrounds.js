// Background painters. Each takes (t, opt) and paints the full 480x270 canvas. FLOOR = y where characters stand.

const TOD = {
  day: ['#5aa9f0', '#cfe9ff'],
  eve: ['#d9694a', '#ffd9a0'],
  night: ['#080c26', '#2a3563'],
};
function skyBands(top, bot, y1) {
  const n = 14;
  for (let i = 0; i < n; i++) rect(0, Math.floor(i * y1 / n), W, Math.ceil(y1 / n) + 1, mix(top, bot, i / (n - 1)));
}
function skyTOD(tod, y1, t) {
  const c = TOD[tod] || TOD.day;
  skyBands(c[0], c[1], y1);
  if (tod === 'night') {
    for (let i = 0; i < 45; i++) {
      const x = (i * 97) % W, y = (i * 53) % Math.max(10, y1 - 30);
      if (Math.sin(t * 2 + i) > -0.6) rect(x, y, 1, 1, '#fff6d8');
    }
    circle(410, 38, 14, '#f4efc8'); circle(404, 34, 12, mix(c[0], c[1], 0.1));
  } else if (tod === 'day') {
    for (let i = 0; i < 3; i++) {
      const x = ((t * 6 + i * 170) % (W + 100)) - 50, y = 24 + i * 22;
      rect(x, y, 48, 10, '#fff'); rect(x + 8, y - 6, 28, 8, '#fff'); rect(x + 4, y + 8, 40, 4, '#e6f2ff');
    }
  } else {
    circle(380, y1 - 40, 20, '#ffe9a8');
  }
}
function building(x, y, w, h, col, lit, t) {
  rect(x, y, w, h, col); rect(x, y, w, 3, mix(col, '#000000', 0.3));
  for (let wy = y + 8; wy < y + h - 8; wy += 12) {
    for (let wx = x + 6; wx < x + w - 8; wx += 12) {
      const on = lit && ((wx * 7 + wy * 3) % 5 !== 0);
      rect(wx, wy, 6, 7, on ? '#ffd66b' : mix(col, '#000000', 0.35));
    }
  }
}
function tree(x, y, s, col) {
  rect(x - 2 * s, y - 8 * s, 4 * s, 10 * s, '#5b3a22');
  circle(x, y - 16 * s, 12 * s, col || '#2f7d3a'); circle(x - 8 * s, y - 10 * s, 8 * s, col || '#2f7d3a');
  circle(x + 8 * s, y - 10 * s, 8 * s, col || '#2f7d3a'); circle(x - 3 * s, y - 20 * s, 7 * s, '#3c9448');
}
function lamp(x, y, on) {
  rect(x - 1, y - 50, 3, 50, '#3a3f4d'); rect(x - 8, y - 52, 16, 4, '#3a3f4d');
  rect(x - 7, y - 48, 14, 3, on ? '#fff3b0' : '#9aa0ac');
  if (on) { ctx.fillStyle = 'rgba(255,240,170,0.12)'; ctx.beginPath(); ctx.moveTo(x - 7, y - 46); ctx.lineTo(x - 36, y); ctx.lineTo(x + 36, y); ctx.lineTo(x + 7, y - 46); ctx.fill(); }
}

const BG = {
  FLOOR: { lot: 194, shop: 194, yard: 194, sauna: 190, porch: 196, kitchen: 196, living: 196, street: 196, restaurant: 196, car: 196 },

  lot(t, tod) {
    skyTOD(tod || 'day', 150, t);
    building(30, 96, 210, 56, '#8c90a0', tod !== 'day', t);
    building(300, 110, 150, 42, '#a09a8c', tod !== 'day', t);
    tree(20, 160, 1.4); tree(450, 160, 1.3);
    rect(0, 150, W, 120, '#4b4e5a');
    rect(0, 150, W, 3, '#6b6f7c');
    for (let x = 20; x < W; x += 56) { rect(x, 176, 3, 40, '#e9e6d8'); }
    rect(0, 218, W, 2, '#e9e6d8');
    lamp(238, 160, tod === 'night');
    rect(380, 140, 50, 14, '#c9422f'); rect(386, 134, 36, 8, '#a83322'); rect(388, 136, 14, 6, '#bfe3ff'); circle(392, 154, 4, '#111'); circle(420, 154, 4, '#111');
  },
  shop(t) {
    rect(0, 0, W, 180, '#e8e2cf'); rect(0, 0, W, 16, '#d34c4c');
    for (let x = 0; x < W; x += 32) rect(x, 0, 16, 16, '#f2e6c9');
    for (let s = 0; s < 3; s++) {
      const y = 40 + s * 40;
      rect(20, y + 24, 440, 5, '#7b5a3a');
      for (let x = 24; x < 450; x += 18) rect(x, y + 4, 12, 20, ['#d9534f', '#f0c05a', '#5aa9f0', '#6cc36f', '#c07be0'][(x * 3 + s) % 5]);
    }
    rect(0, 180, W, 90, '#b9b3a2');
    for (let x = 0; x < W; x += 30) rect(x, 180, 1, 90, '#a49e8e');
    for (let y = 180; y < H; y += 30) rect(0, y, W, 1, '#a49e8e');
  },
  yard(t, tod) {
    skyTOD(tod || 'day', 140, t);
    rect(0, 140, W, 130, '#4e9a46'); rect(0, 140, W, 3, '#6bbd5e');
    for (let i = 0; i < 30; i++) rect((i * 61) % W, 150 + (i * 37) % 110, 2, 3, '#3d8238');
    rect(300, 84, 150, 62, '#c9a06a'); rect(292, 70, 166, 18, '#8a3b2b');
    rect(312, 100, 22, 22, '#bfe3ff'); rect(406, 100, 22, 22, '#bfe3ff'); rect(362, 104, 24, 42, '#6b4a2a');
    tree(60, 164, 1.6); tree(190, 150, 1.1);
    rect(0, 236, W, 34, '#7a7f8a'); rect(0, 236, W, 2, '#979ca8');
  },
  sauna(t) {
    rect(0, 0, W, H, '#7a4a28');
    for (let x = 0; x < W; x += 24) { rect(x, 0, 2, H, '#5d3519'); rect(x + 12, 0, 1, H, '#8b5a34'); }
    rect(0, 0, W, 22, '#5d3519');
    rect(330, 120, 120, 100, '#2a2a30'); rect(336, 126, 108, 88, '#3b3b44');
    for (let i = 0; i < 9; i++) circle(350 + (i % 5) * 20, 112 + ((i * 7) % 4) * 4, 9, '#6f6a66');
    const g = 0.15 + 0.05 * Math.sin(t * 3);
    ctx.fillStyle = 'rgba(255,120,40,' + g + ')'; ctx.fillRect(0, 0, W, H);
    rect(0, 196, W, 74, '#63401f'); rect(0, 196, W, 4, '#8a5a30');
    rect(20, 90, 12, 120, '#8a5a30'); rect(40, 40, 200, 6, '#8a5a30');
  },
  porch(t, tod) {
    skyTOD(tod || 'eve', 170, t);
    rect(0, 150, W, 40, mix('#35607c', '#86b4cc', 0.3)); rect(0, 150, W, 2, '#bcd8e6');
    for (let i = 0; i < 12; i++) rect(((i * 83 + t * 8) % W), 156 + (i % 4) * 8, 24, 1, 'rgba(255,255,255,0.4)');
    rect(0, 190, W, 80, '#7b5a3a');
    for (let x = 0; x < W; x += 40) rect(x, 190, 2, 80, '#5d3f25');
    rect(0, 200, W, 1, '#5d3f25');
    tree(30, 190, 1.8, '#255f31'); tree(440, 190, 1.5, '#255f31');
  },
  kitchen(t) {
    rect(0, 0, W, 190, '#efe8d4');
    for (let x = 0; x < W; x += 20) for (let y = 0; y < 190; y += 20) rect(x, y, 1, 20, '#d9d1bb'), rect(x, y, 20, 1, '#d9d1bb');
    rect(0, 150, W, 40, '#9a7650'); rect(0, 150, W, 4, '#b5906a');
    rect(40, 40, 70, 50, '#bfe3ff'); rect(74, 40, 2, 50, '#efe8d4'); rect(40, 64, 70, 2, '#efe8d4');
    rect(330, 100, 100, 50, '#d0d3da'); rect(330, 98, 100, 4, '#9ea2ad');
    for (let i = 0; i < 4; i++) { circle(350 + i * 22, 90, 9, '#555'); rect(349 + i * 22, 70, 2, 12, '#777'); }
    rect(0, 190, W, 80, '#b89c78');
    for (let x = 0; x < W; x += 40) rect(x, 190, 1, 80, '#9d8461');
  },
  living(t, tod) {
    rect(0, 0, W, 196, '#a9a7a1');
    for (let x = 0; x < W; x += 44) { rect(x + 8, 10, 3, 170, '#bdbbb3'); rect(x + 20, 30, 12, 3, '#bdbbb3'); rect(x + 14, 90, 20, 3, '#bdbbb3'); }
    rect(60, 60, 110, 70, '#14102a'); rect(64, 64, 102, 62, mix('#080c26', '#2a3563', 0.5));
    rect(114, 64, 2, 62, '#a9a7a1');
    rect(300, 60, 120, 6, '#f5f2ea'); rect(330, 66, 24, 24, '#f5f2ea');
    rect(0, 196, W, 74, '#6d5a49'); rect(0, 196, W, 3, '#85705c');
    circle(250, 38, 14, '#ffe9a8'); rect(247, 40, 6, 30, '#444');
    ctx.fillStyle = 'rgba(255,220,140,0.10)'; ctx.fillRect(0, 0, W, 196);
  },
  street(t, tod) {
    skyTOD('night', 150, t);
    const off = (t * 20) % 160;
    for (let i = -1; i < 5; i++) building(i * 160 - off + 40, 70 + (i & 1) * 14, 120, 120, ['#4a4f6b', '#5a4a63', '#3f5a63'][((i % 3) + 3) % 3], true, t);
    rect(0, 190, W, 80, '#2c2e38'); rect(0, 190, W, 4, '#4a4d5c');
    for (let x = -((t * 40) % 60); x < W; x += 60) rect(x, 232, 30, 3, '#d8d3b0');
    lamp(((300 - t * 40) % 640 + 640) % 640 - 80, 196, true);
  },
  restaurant(t) {
    rect(0, 0, W, 190, '#4a2c2a');
    for (let x = 0; x < W; x += 30) rect(x, 0, 2, 190, '#5c3836');
    rect(0, 120, W, 6, '#7a4a2a');
    const col = Math.sin(t * 3) > 0 ? '#ff4a6b' : '#ff8aa0';
    rect(190, 24, 100, 34, '#1a0f14'); T('P U B', 240, 32, { size: 16, c: col, align: 'center' });
    for (let i = 0; i < 6; i++) { rect(30 + i * 70, 78, 8, 20, ['#d9a05a', '#7ad0a0', '#e07a7a'][i % 3]); }
    rect(0, 190, W, 80, '#3a2418'); rect(0, 190, W, 3, '#5a3a28');
    for (let x = 0; x < W; x += 48) rect(x, 190, 1, 80, '#2e1c12');
    rect(20, 214, 90, 6, '#7a4a2a'); rect(26, 220, 4, 30, '#7a4a2a'); rect(100, 220, 4, 30, '#7a4a2a');
    ctx.fillStyle = 'rgba(255,170,80,0.08)'; ctx.fillRect(0, 0, W, H);
  },
  car(t) {
    rect(0, 0, W, 90, '#b4b6bd'); rect(0, 90, W, 30, '#8e909a');
    rect(0, 0, 480, 18, '#6b6d76');
    rect(30, 40, 120, 90, '#9fd0f0'); rect(330, 40, 120, 90, '#9fd0f0');
    tree(60, 130, 0.8, '#3c9448'); rect(0, 130, W, 140, '#44464f');
    rect(0, 130, W, 4, '#2a2c33');
  },
};
