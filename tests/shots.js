// Screenshot specific scenes: node tests/shots.js outDir
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
(async () => {
  const out = process.argv[2] || '/tmp/shots2'; fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('file://' + path.resolve(__dirname, '..', 'index.html'));
  await page.waitForTimeout(400);
  const eps = (process.argv[3] || '1,2,3,4,5,6,7').split(',').map(Number);
  for (const n of eps) {
    await page.evaluate(n => { __dbg.go('ep', n); }, n);
    await page.waitForTimeout(700);
    for (let k = 0; k < 8; k++) {
      await page.waitForTimeout(1400);
      if (k === 2 || k === 6) await page.screenshot({ path: `${out}/ep${n}_${k}.png` });
      await page.keyboard.press('Space');
      await page.waitForTimeout(150); await page.keyboard.press('Space');
    }
  }
  console.log(errors.length ? errors.join('\n') : 'no errors');
  await browser.close();
})();
