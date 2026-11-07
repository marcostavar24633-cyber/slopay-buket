// Генерирует public/corporate-catalog.pdf из HTML (заглушка — замените реальным каталогом)
const { chromium } = require('playwright')
const path = require('node:path')
const img = (n) => 'data:image/webp;base64,' + require('node:fs').readFileSync(path.resolve(__dirname, '../public/img/real/' + n.replace('/', '/thumbs/') + '.webp')).toString('base64')
const items = [
  ['Сладкий бокс сотруднику', 'от 1 490 ₽', 'sweet/sl-22', 'Печенье, мармелад, безе, конфеты — именная открытка, лента с логотипом'],
  ['Ягодное сердце партнёру', 'от 2 990 ₽', 'berry/yag-1', 'Клубника, голубика, макаронс в коробке-сердце, топпер с логотипом'],
  ['Мужской букет руководителю', 'от 4 490 ₽', 'meat/k-1', 'Колбасы, сыр, багеты, черри — на 3–5 человек'],
  ['Раковый сет на коллектив', 'от 9 900 ₽', 'sea/m-20', 'Раки, креветки, лимон, зелень — фуршет на 8–12 человек'],
]
const html = `<html><head><meta charset="utf-8"><style>
body{font-family:Georgia,serif;color:#2a1a14;margin:0;padding:40px;background:#fbf6ef}
h1{font-size:34px;margin:0}.s{font-family:Arial;color:#7d6c61;font-size:13px}
.g{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:24px}.c{background:#fff;border-radius:16px;overflow:hidden}
.c img{width:100%;height:190px;object-fit:cover}.c div{padding:14px;font-family:Arial;font-size:13px}.p{color:#e08f1a;font-weight:bold;font-size:18px}
.f{margin-top:24px;font-family:Arial;font-size:13px;background:#2a1a14;color:#fbf6ef;padding:16px;border-radius:14px}</style></head><body>
<h1>🍓 Слопай букет — корпоративные подарки</h1><p class="s">Ульяновск · брендирование · адресная доставка · договор, счёт, закрывающие</p>
<div class="g">${items.map(([t, p, i, d]) => `<div class="c"><img src="${img(i)}"><div><b>${t}</b><div class="p">${p}</div>${d}</div></div>`).join('')}</div>
<div class="f">Скидка за объём: от 10 шт. — −5%, от 30 шт. — −10%. Новогодние заказы — до 15 декабря.<br>+7 (8422) 50-70-90 · WhatsApp / Telegram · заказ по договору и счёту</div></body></html>`
;(async () => {
  const b = await chromium.launch()
  const p = await b.newPage()
  await p.setContent(html, { waitUntil: 'load' })
  await p.pdf({ path: path.resolve(__dirname, '../public/corporate-catalog.pdf'), format: 'A4', printBackground: true })
  await b.close()
  console.log('pdf ok')
})()
