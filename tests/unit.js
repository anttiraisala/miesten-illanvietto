// Unit checks for the poker evaluator and AI decisions (runs in the page): node tests/unit.js
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('file://' + path.resolve(__dirname, '..', 'index.html'));
  const res = await page.evaluate(() => {
    const C = (r, s) => ({ r, s });
    const fails = [];
    const ok = (name, cond) => { if (!cond) fails.push(name); };
    const royal = bestOf([C(14, 0), C(13, 0), C(12, 0), C(11, 0), C(10, 0), C(2, 1), C(3, 2)]);
    const quads = bestOf([C(9, 0), C(9, 1), C(9, 2), C(9, 3), C(2, 0), C(3, 1), C(4, 2)]);
    const full = bestOf([C(9, 0), C(9, 1), C(9, 2), C(4, 3), C(4, 0), C(3, 1), C(2, 2)]);
    const flush = bestOf([C(2, 0), C(5, 0), C(7, 0), C(9, 0), C(13, 0), C(3, 1), C(4, 2)]);
    const wheel = bestOf([C(14, 0), C(2, 1), C(3, 2), C(4, 3), C(5, 0), C(9, 1), C(11, 2)]);
    const straight = bestOf([C(5, 0), C(6, 1), C(7, 2), C(8, 3), C(9, 0), C(2, 1), C(2, 2)]);
    const trips = bestOf([C(8, 0), C(8, 1), C(8, 2), C(4, 3), C(5, 0), C(9, 1), C(11, 2)]);
    const twop = bestOf([C(8, 0), C(8, 1), C(4, 2), C(4, 3), C(5, 0), C(9, 1), C(11, 2)]);
    const pair = bestOf([C(8, 0), C(8, 1), C(3, 2), C(4, 3), C(5, 0), C(9, 1), C(11, 2)]);
    const high = bestOf([C(14, 0), C(12, 1), C(3, 2), C(4, 3), C(6, 0), C(9, 1), C(11, 2)]);
    ok('royal is straight flush', royal[0] === 8);
    ok('quads', quads[0] === 7); ok('full house', full[0] === 6); ok('flush', flush[0] === 5);
    ok('wheel is straight, high 5', wheel[0] === 4 && wheel[1] === 5);
    ok('straight', straight[0] === 4 && straight[1] === 9);
    ok('trips', trips[0] === 3); ok('two pair', twop[0] === 2); ok('pair', pair[0] === 1); ok('high', high[0] === 0);
    ok('ordering', cmpHands(royal, quads) > 0 && cmpHands(quads, full) > 0 && cmpHands(full, flush) > 0 && cmpHands(flush, straight) > 0 && cmpHands(straight, trips) > 0 && cmpHands(trips, twop) > 0 && cmpHands(twop, pair) > 0 && cmpHands(pair, high) > 0);
    ok('kicker', cmpHands(bestOf([C(8, 0), C(8, 1), C(14, 2), C(4, 3), C(5, 0)]), bestOf([C(8, 2), C(8, 3), C(13, 2), C(4, 1), C(5, 1)])) > 0);
    // AI personalities: fold rates with a weak hand facing a bet
    const rate = who => { let f = 0, r = 0; for (let i = 0; i < 2000; i++) { const a = aiDecide(who, 0.12, 10, true); if (a === 'fold') f++; if (a === 'raise') r++; } return { f: f / 2000, r: r / 2000 }; };
    const t = rate('tuomas'), a = rate('antti'), p = rate('rauno');
    ok('antti folds weak hands most', a.f > t.f && a.f > p.f);
    ok('tuomas bluffs (raises) weak hands', t.r > 0.1);
    ok('rauno never raises weak hands', p.r === 0);
    return { fails, t, a, p };
  });
  console.log(JSON.stringify(res));
  console.log(errors.length ? 'ERRORS ' + errors.join('\n') : (res.fails.length ? 'FAIL' : 'all unit checks passed'));
  await browser.close();
})();
