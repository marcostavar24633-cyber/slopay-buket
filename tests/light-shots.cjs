// Скриншоты светлой темы: node tests/light-shots.cjs <outDir> [scale]
const { chromium, devices } = require('playwright')
const [out, scale = '1'] = process.argv.slice(2)
;(async () => {
  const b = await chromium.launch()
  const init = () => {
    try {
      localStorage.setItem('slopay-theme', 'light')
      sessionStorage.setItem('exit_shown', '1')
    } catch {}
  }
  const d = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: Number(scale) })
  await d.addInitScript(init)
  const p = await d.newPage()
  await p.clock.setFixedTime(new Date('2026-11-09T07:30:00Z'))
  await p.goto('http://localhost:4173/', { waitUntil: 'networkidle' })
  await p.waitForTimeout(1200)
  await p.screenshot({ path: `${out}/light-desktop.png` })
  for (const id of ['catalog', 'corporate', 'reviews', 'delivery', 'order']) {
    await p.evaluate((id) => document.getElementById(id).scrollIntoView(), id)
    await p.waitForTimeout(900)
    await p.screenshot({ path: `${out}/light-${id}.png` })
  }
  await p.evaluate(() => scrollTo(0, document.body.scrollHeight))
  await p.waitForTimeout(800)
  await p.screenshot({ path: `${out}/light-footer.png` })
  const m = await b.newContext({ ...devices['iPhone 13'], deviceScaleFactor: Number(scale) })
  await m.addInitScript(init)
  const mp = await m.newPage()
  await mp.clock.setFixedTime(new Date('2026-11-09T07:30:00Z'))
  await mp.goto('http://localhost:4173/', { waitUntil: 'networkidle' })
  await mp.waitForTimeout(1200)
  await mp.screenshot({ path: `${out}/light-mobile.png` })
  await b.close()
})()
