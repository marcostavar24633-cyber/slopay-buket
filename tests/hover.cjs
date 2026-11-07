// Проверка второго фото в карточке: в покое и при наведении. node tests/hover.cjs <outDir>
const { chromium } = require('playwright')
const out = process.argv[2]
;(async () => {
  const b = await chromium.launch()
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
  await p.goto('http://localhost:4173/', { waitUntil: 'networkidle' })
  await p.evaluate(() => document.querySelector('#catalog article').scrollIntoView({ block: 'center' }))
  await p.waitForTimeout(1200)
  await p.screenshot({ path: out + '/cat-rest.png' })
  const cards = await p.$$('#catalog article')
  await cards[3].hover()
  await p.waitForTimeout(700)
  await p.screenshot({ path: out + '/cat-hover.png' })
  await b.close()
})()
