// Рендер презентации: PNG каждого слайда (1920×1080) и общий PDF.
// Запуск из корня репозитория: node kwork/deck/render.cjs
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const DIR = __dirname;
const OUT = path.join(DIR, '..', 'out');
(async () => {
  fs.mkdirSync(path.join(OUT, 'slides'), { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  await page.goto('file://' + path.join(DIR, 'index.html'), { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const n = await page.locator('.slide').count();
  for (let i = 0; i < n; i++) {
    const el = page.locator('.slide').nth(i);
    await el.screenshot({ path: path.join(OUT, 'slides', `slide-${String(i + 1).padStart(2, '0')}.png`) });
  }
  await page.pdf({ path: path.join(OUT, 'slopai-buket-case.pdf'), width: '1920px', height: '1080px', printBackground: true, preferCSSPageSize: true });
  await browser.close();
  console.log(`${n} слайдов → ${OUT}`);
})();
