// Pixel-art characters, drawn procedurally (32x62 full body). Ported from tools/generate_sprites.py.
// Variants: 'out' (hats/caps), 'in' (indoors), 'sauna' (bare head, towel). Expressions: normal, drunk, hot.

const Sprites = (() => {
  const SW = 32, SH = 62;
  const SK = '#e8b996', SKS = '#c98f6e', SKH = '#f2cdb0', BLK = '#15151b', BLK2 = '#23232c';
  const EYE = '#1c1218', MOUTH = '#a8504a', WHITE = '#f4f4f4';
  const cache = {};

  function make(name, variant, expr, pose) {
    const c = document.createElement('canvas'); c.width = SW; c.height = SH;
    const g = c.getContext('2d');
    const R = (x0, y0, x1, y1, col) => { g.fillStyle = col; g.fillRect(x0, y0, x1 - x0 + 1, y1 - y0 + 1); };
    const P = (pts, col) => { g.fillStyle = col; for (const p of pts) g.fillRect(p[0], p[1], 1, 1); };
    const hw = { rauno: 9, tuomas: 11, antti: 13 }[name];
    const towel = variant === 'sauna';
    const x0 = 16 - hw, x1 = 15 + hw;

    // legs
    const lw = hw >= 13 ? 7 : hw >= 11 ? 6 : 5;
    const legs = [[14 - lw + 1, 14], [17, 17 + lw - 1]];
    legs.forEach((l, i) => {
      const up = (pose === 'walk0' && i === 0) || (pose === 'walk1' && i === 1);
      const bot = up ? 55 : 59;
      R(l[0], 46, l[1], bot, towel ? SK : '#2c3352');
      R(l[0], 46, l[0], bot, towel ? SKS : '#222a45');
      R(l[0] - (i === 0 ? 1 : 0), bot + 1, l[1] + (i === 1 ? 1 : 0), bot + 2, towel ? SKS : '#2a2420');
    });

    // torso
    if (towel) {
      R(x0, 29, x1, 45, SK); R(x0 + 2, 28, x1 - 2, 28, SK);
      R(x0, 31, x0 + 1, 45, SKS); R(x1 - 1, 31, x1, 45, SKS);
      R(x0, 40, x1, 52, '#e9eef5'); R(x0, 40, x1, 40, '#b9c6d8'); R(x0, 52, x1, 52, '#cfd9e6');
    } else {
      R(x0, 29, x1, 45, BLK); R(x0 + 2, 28, x1 - 2, 28, BLK);
      R(x0, 31, x0 + 1, 45, BLK2); R(x1 - 1, 31, x1, 45, BLK2);
    }
    R(13, 27, 18, 29, SKS); R(14, 29, 17, 30, SK); R(14, 28, 17, 28, SKS);

    const head = (a, b) => {
      R(a, 13, b, 26, SK); R(a + 1, 12, b - 1, 12, SK); R(a + 2, 27, b - 2, 27, SK);
      R(a - 1, 17, a - 1, 20, SKS); R(b + 1, 17, b + 1, 20, SKS);
      R(15, 19, 16, 21, SKS); P([[15, 19]], SK);
    };
    const eyes = () => P([[12, 17], [13, 17], [18, 17], [19, 17]], EYE);
    const glasses = (a, b, col, bottom) => {
      [[10, 14], [17, 21]].forEach(l => {
        R(l[0], 15, l[1], 15, col); R(l[0], 19, l[1], 19, bottom || col);
        R(l[0], 15, l[0], 19, col); R(l[1], 15, l[1], 19, col);
      });
      R(15, 16, 16, 16, col); R(a, 16, 9, 16, col); R(22, 16, b, 16, col);
    };
    const beard = (a, b, col, chin, sides) => {
      if (sides !== false) { R(a, 18, a + 1, 26, col); R(b - 1, 18, b, 26, col); }
      R(a + 1, 22, b - 1, 26, col); R(a + 2, 27, b - 2, 27, col);
      R(12, 21, 19, 21, col);
      R(14, 22, 17, 23, MOUTH);
      R(13, 25, 18, 27, chin); R(12, 26, 19, 26, chin);
    };

    if (name === 'rauno') {
      head(9, 22);
      beard(9, 22, '#6e4b30', '#b9b2a6');
      R(13, 22, 18, 23, WHITE); R(14, 23, 17, 23, MOUTH); P([[12, 22], [19, 22]], MOUTH);
      eyes();
      glasses(8, 23, '#8a4a24');
      R(10, 14, 14, 14, '#8a4a24'); R(17, 14, 21, 14, '#8a4a24');
      R(10, 20, 14, 20, '#8a4a24'); R(17, 20, 21, 20, '#8a4a24');
      eyes();
      if (!towel) {
        R(10, 36, 21, 43, '#b8842e'); R(12, 34, 19, 35, '#b8842e'); R(13, 38, 18, 41, '#e0b252');
        R(11, 37, 12, 37, BLK); R(19, 40, 20, 40, BLK); R(14, 43, 17, 43, BLK);
        for (let i = 0; i < 10; i++) { P([[12 + (i >> 1), 29 + i]], '#7cf04a'); P([[19 - (i >> 1), 29 + i]], '#7cf04a'); }
        P([[16, 40], [15, 40], [16, 41], [15, 41]], '#3a7a2a');
      }
      if (variant === 'out') {
        R(8, 8, 23, 12, '#8a3d1e'); R(10, 7, 21, 7, '#8a3d1e'); R(8, 13, 24, 13, '#5e2813'); R(22, 12, 25, 13, '#5e2813');
        P([[11, 9], [14, 10], [17, 8], [20, 10], [13, 12], [19, 12], [22, 9], [9, 11]], '#e8c9a0');
        P([[12, 8], [16, 9], [21, 11], [10, 10]], '#c8581f');
        R(9, 14, 10, 16, '#a8a39a'); R(21, 14, 22, 16, '#a8a39a');
      } else {
        const brown = '#6b4a2c';
        R(9, 10, 22, 13, brown); R(10, 9, 21, 9, brown);
        P([[10, 8], [12, 7], [13, 8], [16, 7], [18, 8], [20, 7], [21, 8], [8, 10], [7, 12], [23, 10], [24, 9]], brown);
        P([[12, 10], [15, 9], [18, 11], [20, 10], [11, 12], [19, 8]], '#c49a63');
        R(9, 13, 11, 14, brown); R(20, 13, 22, 14, brown);
      }
    } else if (name === 'tuomas') {
      head(9, 22);
      const rb = '#7a4528', rb2 = '#8f5230';
      beard(9, 22, rb, '#6b3c22');
      R(10, 24, 21, 25, rb2); P([[12, 21], [19, 21], [11, 22], [20, 22]], rb2);
      R(14, 23, 17, 23, '#b0605a');
      [[10, 14], [17, 21]].forEach(l => {
        R(l[0], 14, l[1], 15, BLK); R(l[0], 16, l[0], 19, BLK); R(l[1], 16, l[1], 19, BLK);
        R(l[0] + 1, 16, l[1] - 1, 19, SKH); R(l[0], 20, l[1], 20, '#8fb08a');
      });
      R(15, 15, 16, 15, BLK); R(8, 15, 9, 15, BLK); R(22, 15, 23, 15, BLK);
      P([[12, 17], [13, 17], [18, 17], [19, 17]], EYE);
      if (!towel) {
        R(10, 36, 21, 36, '#cfd2d6'); R(10, 38, 21, 38, '#cfd2d6');
        for (let x = 10; x < 22; x += 2) P([[x, 37]], '#cfd2d6');
      }
      if (variant === 'sauna') {
        const hr = '#6b4026';
        R(9, 11, 22, 14, hr); R(10, 10, 21, 10, hr); P([[11, 9], [14, 9], [18, 9], [20, 9], [8, 12], [23, 12]], hr);
        P([[12, 11], [17, 12], [20, 11]], '#8a5a38');
        R(10, 14, 21, 14, BLK);
      } else {
        R(10, 5, 21, 11, BLK); R(11, 4, 20, 4, BLK); R(10, 10, 21, 10, '#34343e');
        R(5, 12, 26, 13, BLK); R(7, 14, 24, 14, BLK2); R(6, 11, 9, 11, BLK); R(22, 11, 25, 11, BLK);
      }
    } else {
      const hair = '#2b2018';
      const longHair = variant === 'out' || variant === 'sauna';
      if (longHair) { R(6, 14, 9, 31, hair); R(22, 14, 25, 31, hair); R(7, 12, 24, 13, hair); }
      else { R(24, 15, 27, 18, hair); R(25, 19, 27, 27, hair); R(26, 28, 27, 29, hair); }
      head(8, 23);
      const dk = '#3a2c24';
      R(9, 21, 22, 26, dk); R(8, 19, 8, 25, dk); R(23, 19, 23, 25, dk); R(10, 27, 21, 27, dk);
      R(11, 22, 20, 22, '#4a3a30'); R(14, 23, 17, 23, '#8f4a46');
      R(13, 25, 18, 27, '#9d9b95'); R(12, 25, 12, 26, '#6a6762'); R(19, 25, 19, 26, '#6a6762');
      R(14, 28, 17, 28, '#9d9b95'); R(9, 21, 10, 23, '#4f4540'); R(21, 21, 22, 23, '#4f4540');
      R(12, 21, 19, 21, '#2f241d'); R(14, 22, 17, 22, '#8f4a46'); R(14, 23, 17, 23, '#6a6762');
      eyes();
      glasses(7, 24, '#b9bcc6');
      eyes();
      R(10, 15, 14, 15, '#80838d'); R(17, 15, 21, 15, '#80838d');
      if (variant === 'out') {
        R(8, 10, 23, 13, BLK); R(10, 9, 21, 9, BLK); R(9, 13, 23, 13, BLK2);
        R(8, 13, 9, 13, hair); R(22, 13, 23, 13, hair);
      } else {
        R(9, 10, 22, 13, hair); R(10, 9, 21, 9, hair); R(8, 12, 9, 17, hair); R(22, 12, 23, 17, hair);
        R(15, 9, 16, 9, '#4a3a2e'); R(15, 10, 15, 12, '#4a3a2e');
      }
    }

    if (expr === 'drunk') {
      P([[12, 16], [13, 16], [18, 16], [19, 16]], SKS);
      P([[10, 21], [11, 21], [20, 21], [21, 21]], '#e07a7a');
    } else if (expr === 'hot') {
      g.globalCompositeOperation = 'source-atop';
      g.fillStyle = 'rgba(255,60,40,0.30)';
      g.fillRect(7, 12, 18, 17);
      g.globalCompositeOperation = 'source-over';
      P([[10, 12], [22, 14], [8, 18], [23, 22]], '#8fd3ff');
    }
    return c;
  }

  function get(name, variant, expr, pose) {
    const k = name + '|' + variant + '|' + (expr || 'normal') + '|' + (pose || 'idle');
    if (!cache[k]) cache[k] = make(name, variant, expr || 'normal', pose || 'idle');
    return cache[k];
  }

  // Draw a character so that its feet are at (x, footY). opts: flip, expr, pose, scale, bust (top 46 rows only)
  function draw(g, name, variant, x, footY, opts) {
    const o = opts || {};
    const spr = get(name, variant, o.expr, o.pose);
    const sc = o.scale || 1;
    const sh = o.bust ? 46 : SH;
    g.save();
    g.translate(Math.round(x), Math.round(footY));
    if (o.flip) g.scale(-1, 1);
    g.drawImage(spr, 0, 0, SW, sh, -16 * sc, -sh * sc, SW * sc, sh * sc);
    g.restore();
  }
  // Head portrait crop, top-left at (x, y)
  function head(g, name, variant, x, y, scale, expr) {
    const spr = get(name, variant, expr);
    g.drawImage(spr, 3, 3, 26, 27, Math.round(x), Math.round(y), 26 * (scale || 1), 27 * (scale || 1));
  }
  return { get, draw, head, SW, SH };
})();
