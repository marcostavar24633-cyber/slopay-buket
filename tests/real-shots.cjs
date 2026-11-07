// Скриншоты ключевых экранов: node tests/real-shots.cjs <outDir> [scale] [light]
const { chromium, devices } = require('playwright')
const [out, scale = '1', theme = 'dark'] = process.argv.slice(2)
;(async () => {
  const b = await chromium.launch()
  const init = (t) => {
    try {
      sessionStorage.setItem('exit_shown', '1')
      if (t === 'light') localStorage.setItem('slopay-theme', 'light')
    } catch {}
  }
  const d = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: Number(scale) })
  await d.addInitScript(init, theme)
  const p = await d.newPage()
  await p.clock.setFixedTime(new Date('2026-11-09T07:30:00Z'))
  await p.goto('http://localhost:4173/', { waitUntil: 'networkidle' })
  await p.waitForTimeout(1200)
  await p.screenshot({ path: `${out}/r-hero.png` })
  const shot = async (sel, name, block = 'start') => {
    await p.evaluate(([s, bl]) => document.querySelector(s).scrollIntoView({ block: bl }), [sel, block])
    await p.waitForTimeout(1300)
    await p.screenshot({ path: `${out}/${name}.png` })
  }
  await shot('#catalog article', 'r-catalog', 'center')
  await shot('#reviews .grid.gap-5', 'r-reviews', 'center')
  await shot('#process h2 + div, #process .grid.items-center', 'r-maria', 'center')
  await shot('#corporate figure', 'r-corp', 'center')
  const m = await b.newContext({ ...devices['iPhone 13'], deviceScaleFactor: Number(scale) })
  await m.addInitScript(init, theme)
  const mp = await m.newPage()
  await mp.clock.setFixedTime(new Date('2026-11-09T07:30:00Z'))
  await mp.goto('http://localhost:4173/', { waitUntil: 'networkidle' })
  await mp.waitForTimeout(1200)
  await mp.screenshot({ path: `${out}/r-mobile.png` })
  await mp.evaluate(() => document.querySelector('#catalog article').scrollIntoView({ block: 'center' }))
  await mp.waitForTimeout(1200)
  await mp.screenshot({ path: `${out}/r-mobile-card.png` })
  await b.close()
})()
