// Пререндер: после сборки открывает сайт в браузере и вписывает готовую разметку в dist/index.html.
// Поисковики видят весь текст сразу, а первый экран появляется до загрузки скриптов.
// Запуск: node scripts/prerender.cjs [папка сборки=dist] [base=/]
// Нужен Playwright с Chromium; если его нет — шаг пропускается, сайт работает как обычно.
const http = require('node:http')
const fs = require('node:fs')
const path = require('node:path')

const dist = path.resolve(process.argv[2] || 'dist')
const base = (process.argv[3] || '/').replace(/\/?$/, '/')

let chromium
try {
  ;({ chromium } = require('playwright'))
} catch {
  console.warn('[prerender] Playwright не найден — пропускаю пререндер')
  process.exit(0)
}

const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.json': 'application/json', '.pdf': 'application/pdf' }
const server = http.createServer((req, res) => {
  let url = decodeURIComponent(req.url.split('?')[0])
  if (!url.startsWith(base)) return res.writeHead(404).end()
  let file = path.join(dist, url.slice(base.length))
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html')
  if (!fs.existsSync(file)) return res.writeHead(404).end()
  res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' })
  fs.createReadStream(file).pipe(res)
})

server.listen(0, async () => {
  const port = server.address().port
  const browser = await chromium.launch()
  try {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
    await ctx.addInitScript(() => {
      try {
        sessionStorage.setItem('exit_shown', '1')
        localStorage.setItem('slopay-cookie-ok', '1')
      } catch {}
    })
    for (const [sub, waitFor] of [['', '#faq'], ['corporate/', '#corporate']]) {
    if (!fs.existsSync(path.join(dist, sub, 'index.html'))) continue
    const page = await ctx.newPage()
    await page.goto(`http://localhost:${port}${base}${sub}`, { waitUntil: 'networkidle' })
    await page.waitForSelector(waitFor, { timeout: 20000 })
    await page.waitForTimeout(500)
    const html = await page.evaluate(() => {
      const root = document.getElementById('root')
      // декоративный фон (видео, иконки) и всплывающие окна в разметку не нужны
      root.querySelectorAll(':scope > div.fixed.inset-0, [role="region"]').forEach((e) => e.remove())
      // элементы, которые ждут появления на экране (opacity: 0), делаем видимыми
      root.querySelectorAll('[style]').forEach((e) => {
        if (e.style.opacity === '0') {
          e.style.opacity = ''
          e.style.filter = ''
          e.style.transform = ''
        }
      })
      // все картинки, кроме первого экрана, — ленивые: не мешают главному фото загрузиться первым
      root.querySelectorAll('img').forEach((img) => {
        if (!img.closest('#top')) img.setAttribute('loading', 'lazy')
        img.setAttribute('decoding', 'async')
      })
      return root.innerHTML
    })
    const file = path.join(dist, sub, 'index.html')
    const src = fs.readFileSync(file, 'utf8')
    if (!src.includes('<div id="root"></div>')) throw new Error('не нашёл <div id="root"></div>')
    fs.writeFileSync(file, src.replace('<div id="root"></div>', `<div id="root" data-prerendered="">${html}</div>`))
    console.log(`[prerender] ${path.relative(process.cwd(), file)}: +${Math.round(html.length / 1024)} КБ разметки`)
    await page.close()
    }
  } finally {
    await browser.close()
    server.close()
  }
})
