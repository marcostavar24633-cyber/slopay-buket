// Скриншоты каждой секции: node tests/sections.cjs <outDir> [m|d|both]
const { chromium, devices } = require('playwright')
const [out, which = 'both'] = process.argv.slice(2)
;(async () => {
  const b = await chromium.launch()
  const cfgs = [
    ['m', { ...devices['iPhone 13'], deviceScaleFactor: 1 }],
    ['d', { viewport: { width: 1440, height: 900 } }],
  ].filter(([n]) => which === 'both' || which === n)
  for (const [name, opts] of cfgs) {
    const ctx = await b.newContext({ ...opts, timezoneId: 'Europe/Samara' })
    await ctx.addInitScript(() => {
      try { sessionStorage.setItem('exit_shown', '1') } catch {}
    })
    const p = await ctx.newPage()
    await p.goto('http://localhost:4173/', { waitUntil: 'networkidle' })
    const h = await p.evaluate(() => document.body.scrollHeight)
    for (let y = 0; y < h; y += 400) {
      await p.evaluate((y) => window.scrollTo(0, y), y)
      await p.waitForTimeout(60)
    }
    await p.waitForTimeout(900)
    const els = await p.$$('main > section, footer')
    let i = 0
    for (const el of els) await el.screenshot({ path: `${out}/${name}-${String(i++).padStart(2, '0')}.png` })
    await ctx.close()
  }
  await b.close()
})()
