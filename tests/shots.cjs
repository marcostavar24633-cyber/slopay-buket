const { chromium, devices } = require('playwright')
const out = process.argv[2]
;(async () => {
  const b = await chromium.launch()
  const errors = []
  for (const [name, opts] of [
    ['mobile', { ...devices['iPhone 13'], deviceScaleFactor: 1 }],
    ['desktop', { viewport: { width: 1440, height: 900 } }],
  ]) {
    const ctx = await b.newContext({ ...opts, timezoneId: 'Europe/Samara' })
    const p = await ctx.newPage()
    p.on('pageerror', (e) => errors.push(name + ': ' + e.message))
    p.on('console', (m) => m.type() === 'error' && errors.push(name + ' console: ' + m.text()))
    await p.goto('http://localhost:4173/', { waitUntil: 'networkidle' })
    await p.waitForTimeout(800)
    await p.screenshot({ path: `${out}/${name}-fold.png` })
    // прокрутка, чтобы сработали анимации появления
    const h = await p.evaluate(() => document.body.scrollHeight)
    for (let y = 0; y < h; y += 500) { await p.evaluate((y) => window.scrollTo(0, y), y); await p.waitForTimeout(60) }
    await p.waitForTimeout(600)
    await p.evaluate(() => window.scrollTo(0, 0))
    await p.screenshot({ path: `${out}/${name}-full.png`, fullPage: true })
    const overflow = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    console.log(name, 'height', h, 'h-overflow', overflow)
    await ctx.close()
  }
  console.log('errors:', errors.length ? errors : 'none')
  await b.close()
})()
