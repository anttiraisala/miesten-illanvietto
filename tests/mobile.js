// Mobile landscape + portrait emulation screenshots: node tests/mobile.js outDir
const { chromium, devices } = require('playwright');
const path = require('path'), fs = require('fs');
(async () => {
  const out = process.argv[2] || '/tmp/mobile'; fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const errors = [];
  for (const [name, vp] of [['landscape', { width: 844, height: 390 }], ['portrait', { width: 390, height: 844 }]]) {
    const ctx = await browser.newContext({ viewport: vp, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('file://' + path.resolve(__dirname, '..', 'index.html'));
    await page.waitForTimeout(500);
    if (name === 'landscape') {
      await page.tap('#a'); await page.waitForTimeout(1500);
      await page.screenshot({ path: `${out}/${name}_card.png` });
      await page.evaluate(() => __dbg.go('ep', 2)); await page.waitForTimeout(1200);
      await page.screenshot({ path: `${out}/${name}_scene.png` });
    } else await page.screenshot({ path: `${out}/${name}.png` });
    await ctx.close();
  }
  console.log(errors.length ? errors.join('\n') : 'no errors');
  await browser.close();
})();
