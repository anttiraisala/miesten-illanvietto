// Headless bot playthrough: node tests/playthrough.js [outDir]
// Plays the whole game with simple bots and random key presses at high speed; reports errors and reached episodes.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
(async () => {
  const out = process.argv[2] || '/tmp/shots';
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  await page.goto('file://' + path.resolve(__dirname, '..', 'index.html'));
  await page.waitForTimeout(500);
  await page.evaluate(() => { __dbg.dbg.auto = true; __dbg.dbg.speed = 3; });
  const t0 = Date.now(); let n = 0, lastTrace = '';
  while (Date.now() - t0 < (+process.env.MAXMS || 240000)) {
    await page.waitForTimeout(1500);
    const info = await page.evaluate(() => ({ trace: (window.__trace || []).join(','), music: Scenes.cur && Scenes.cur.music, mood: G.mood }));
    if (info.trace !== lastTrace || n % 4 === 0) { await page.screenshot({ path: `${out}/s${String(n).padStart(3, '0')}.png` }); }
    lastTrace = info.trace; n++;
    if (info.trace.includes('credits')) { await page.evaluate(() => { __dbg.dbg.auto = false; __dbg.dbg.speed = 1; }); for (let k = 0; k < 6; k++) { await page.waitForTimeout(3500); await page.screenshot({ path: `${out}/credits${k}.png` }); } break; }
    if (errors.length) break;
  }
  const trace = await page.evaluate(() => (window.__trace || []).join(','));
  console.log('trace:', trace);
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no errors');
  await browser.close();
})();
