// Проверка шапки: логотип не налезает на меню, элементы не пересекаются. node tests/header-overlap.cjs
const { chromium } = require('playwright')
const widths = [1024, 1180, 1280, 1366, 1440, 1536, 1600, 1680, 1920, 2560]
;(async () => {
  const b = await chromium.launch()
  let bad = 0
  for (const width of widths) {
    const p = await b.newPage({ viewport: { width, height: 900 } })
    await p.goto(process.env.URL || 'http://localhost:4173/', { waitUntil: 'networkidle' })
    const r = await p.evaluate(() => {
      const header = document.querySelector('header')
      const logoText = header.querySelector('a[href="#top"] > span:last-child')
      const items = [logoText, ...header.querySelectorAll('nav a, a[href^="tel"], a[href^="https://wa.me"], a[href^="https://t.me"], button')].filter(
        (e) => e && e.offsetParent && getComputedStyle(e).visibility !== 'hidden',
      )
      // фактическая ширина текста логотипа (scrollWidth ловит вылезающий текст)
      const rect = (e) => {
        const r = e.getBoundingClientRect()
        return { l: r.left, r: r.left + Math.max(r.width, e.scrollWidth), t: r.top, b: r.bottom, n: (e.textContent || e.getAttribute('aria-label') || '').trim().slice(0, 18) }
      }
      const rs = items.map(rect)
      const hits = []
      for (let i = 0; i < rs.length; i++)
        for (let j = i + 1; j < rs.length; j++) {
          const a = rs[i], c = rs[j]
          if (a.l < c.r - 1 && c.l < a.r - 1 && a.t < c.b - 1 && c.t < a.b - 1) hits.push(`${a.n} ✕ ${c.n}`)
        }
      return { hits, ov: document.documentElement.scrollWidth - innerWidth }
    })
    const ok = !r.hits.length && !r.ov
    if (!ok) bad++
    console.log(`${ok ? '✓' : '✗'} ${width}px`, r.hits.slice(0, 3).join('; '), r.ov ? `overflow ${r.ov}` : '')
    await p.close()
  }
  await b.close()
  process.exit(bad ? 1 : 0)
})()
