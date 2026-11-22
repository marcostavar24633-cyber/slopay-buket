// Генерирует public/corporate-catalog.pdf из актуальных карточек каталога.
const { chromium } = require('playwright')
const path = require('node:path')
const fs = require('node:fs')
const products = new Map(require('../content/products.json').items.map((item) => [item.id, item]))
const rub = new Intl.NumberFormat('ru-RU')
const escape = (value) => String(value).replace(/[&<>]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[char])
function photo(image) {
  const original = path.join(__dirname, '../public', image)
  const thumbnail = path.join(path.dirname(original), 'thumbs', path.basename(original))
  return 'data:image/webp;base64,' + fs.readFileSync(fs.existsSync(thumbnail) ? thumbnail : original).toString('base64')
}
const items = [
  ['Сладкая коробочка', 'sl-22'],
  ['Ягодная коробочка', 'yag-1'],
  ['Коробочка с сухофруктами', 'suh-5'],
  ['Сладкая коробочка с джемом', 'sl-7'],
].map(([title, id]) => ({ title, ...products.get(id) }))
if (items.some((item) => !item.image || item.show === false || !item.price)) {
  throw new Error('У каждой корпоративной коробочки должны быть фото и цена')
}
const html = `<html><head><meta charset="utf-8"><style>
body{font-family:Georgia,serif;color:#2a1a14;margin:0;padding:30px;background:#fbf6ef}
h1{font-size:34px;margin:0}.s{font-family:Arial;color:#7d6c61;font-size:13px}
.g{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:24px}.c{background:#fff;border-radius:16px;overflow:hidden}
.c img{width:100%;height:180px;object-fit:contain;display:block;background:#f2ebe3}.c div{padding:14px;font-family:Arial;font-size:13px}.c .p{margin:6px 0;padding:0;color:#98540f;font-weight:bold;font-size:18px}
.f{margin-top:24px;font-family:Arial;font-size:13px;background:#2a1a14;color:#fbf6ef;padding:16px;border-radius:14px}</style></head><body>
<h1>🍓 Слопай букет — корпоративные подарки</h1><p class="s">Ульяновск · небольшие подарки в коробочках · доставка в офис</p>
<div class="g">${items.map(({ title, price, image, desc }) => `<div class="c"><img src="${photo(image)}"><div><b>${escape(title)}</b><div class="p">от ${rub.format(price)} ₽</div>${escape(desc)}</div></div>`).join('')}</div>
<div class="f">Скидка за объём: от 10 шт. — −10%, от 20 шт. — −15%. Предоплата 30%. Новогодние заказы — до 5 декабря.<br>+7 (963) 128-25-56 · MAX / Telegram</div></body></html>`
;(async () => {
  const b = await chromium.launch()
  const p = await b.newPage()
  await p.setContent(html, { waitUntil: 'load' })
  await p.pdf({ path: path.resolve(__dirname, '../public/corporate-catalog.pdf'), format: 'A4', printBackground: true })
  await b.close()
  console.log('pdf ok')
})()
