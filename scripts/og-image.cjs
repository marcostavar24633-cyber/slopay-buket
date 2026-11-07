// Картинка для превью ссылок (ВК, Telegram, MAX, WhatsApp): public/og-image.jpg, 1200×630.
// Запуск: node scripts/og-image.cjs [путь к фото относительно public]
const { chromium } = require('playwright')
const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '..')
const photo = process.argv[2] || 'img/real/berry/hero-heart.webp'
const b64 = (p) => fs.readFileSync(path.join(root, p)).toString('base64')
const font = (pkg, file) => b64(`node_modules/@fontsource-variable/${pkg}/files/${file}`)

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Playfair;src:url(data:font/woff2;base64,${font('playfair-display', 'playfair-display-cyrillic-wght-normal.woff2')}) format('woff2');font-weight:400 900}
@font-face{font-family:Playfair;font-style:italic;src:url(data:font/woff2;base64,${font('playfair-display', 'playfair-display-cyrillic-wght-italic.woff2')}) format('woff2');font-weight:400 900}
@font-face{font-family:Manrope;src:url(data:font/woff2;base64,${font('manrope', 'manrope-cyrillic-wght-normal.woff2')}) format('woff2');font-weight:200 800;unicode-range:U+0400-04FF}
@font-face{font-family:Manrope;src:url(data:font/woff2;base64,${font('manrope', 'manrope-latin-wght-normal.woff2')}) format('woff2');font-weight:200 800;unicode-range:U+0000-03FF,U+2000-22FF}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;background:#0a0908;color:#f5ecd9;font-family:Manrope;display:flex;overflow:hidden}
.t{flex:1;padding:64px 56px;display:flex;flex-direction:column;justify-content:space-between;background:radial-gradient(circle at 0 0,rgba(212,175,55,.22),transparent 60%)}
.logo{font-family:Playfair;font-style:italic;font-weight:700;font-size:34px;display:flex;align-items:center;gap:14px}
.logo span{width:52px;height:52px;border-radius:16px;background:#d4af37;display:grid;place-items:center;font-size:30px;font-style:normal}
h1{font-family:Playfair;font-weight:600;font-size:60px;line-height:1.05;margin-top:28px}
h1 em{display:block;background:linear-gradient(100deg,#c99a2e,#ffe3a1 40%,#e8b04a);-webkit-background-clip:text;color:transparent}
.m{font-size:24px;color:rgba(245,236,217,.75);font-weight:600}
.m b{color:#f3d98a}
.p{width:470px;height:630px;background:url(data:image/webp;base64,${b64('public/' + photo)}) center/cover;box-shadow:inset 40px 0 60px -20px #0a0908}
</style></head><body>
<div class="t"><div><div class="logo"><span>🍓</span>Слопай букет</div>
<h1>Съедобные букеты<em>в Ульяновске</em></h1></div>
<div class="m">Ягоды · мясо · раки · сухофрукты<br><b>от 2 490 ₽ · ★ 5,0 на Авито</b></div></div>
<div class="p"></div></body></html>`

;(async () => {
  const b = await chromium.launch()
  const p = await b.newPage({ viewport: { width: 1200, height: 630 } })
  await p.setContent(html, { waitUntil: 'load' })
  await p.evaluate(() => document.fonts.ready)
  await p.screenshot({ path: path.join(root, 'public/og-image.jpg'), type: 'jpeg', quality: 86 })
  await b.close()
  console.log('public/og-image.jpg')
})()
