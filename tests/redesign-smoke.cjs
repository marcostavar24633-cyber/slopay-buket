// Browser smoke tests for the published redesign output.
const assert = require('node:assert/strict')
const fs = require('node:fs')
const http = require('node:http')
const path = require('node:path')
const { chromium } = require('playwright')

const root = path.resolve(process.argv[2] || 'dist')
const mime = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json',
  '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.mp4': 'video/mp4',
  '.pdf': 'application/pdf',
}

function serve() {
  return http.createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
    let file = pathname === '/' ? path.join(root, 'index.html') : path.resolve(root, '.' + pathname)
    if (!file.startsWith(root + path.sep) && file !== path.join(root, 'index.html')) {
      res.writeHead(403).end('Forbidden')
      return
    }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html')
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
      res.writeHead(404).end('Not found')
      return
    }
    res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' })
    fs.createReadStream(file).pipe(res)
  })
}

;(async () => {
  assert.ok(fs.existsSync(path.join(root, 'index.html')), 'dist/index.html missing')
  assert.ok(fs.existsSync(path.join(root, 'privacy', 'index.html')), 'dist/privacy/index.html missing')
  const server = serve()
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const url = `http://127.0.0.1:${server.address().port}/`
  const browser = await chromium.launch({ headless: true })
  const errors = []
  try {
    for (const viewport of [{ width: 390, height: 844 }, { width: 1280, height: 800 }]) {
      const context = await browser.newContext({ viewport, reducedMotion: 'reduce' })
      const page = await context.newPage()
      page.on('pageerror', (error) => errors.push(`${viewport.width}px: ${error.message}`))
      await page.addInitScript(() => {
        window.__openedHref = ''
        const original = window.open.bind(window)
        window.open = (href) => { window.__openedHref = String(href); return { closed: false, close() {} } }
        void original
      })
      await page.goto(url, { waitUntil: 'networkidle' })
      await page.locator('#catalog').waitFor({ state: 'attached' })
      await page.locator('#custom-form').waitFor({ state: 'attached' })
      const overflow = await page.evaluate(() => {
        const rootMetrics = {
          htmlScrollWidth: document.documentElement.scrollWidth,
          bodyScrollWidth: document.body.scrollWidth,
          htmlClientWidth: document.documentElement.clientWidth,
          bodyClientWidth: document.body.clientWidth,
          scrollX: window.scrollX,
        }
        const offenders = [...document.querySelectorAll('body *')].map((el) => {
          const rect = el.getBoundingClientRect()
          const style = getComputedStyle(el)
          return {
            tag: el.tagName.toLowerCase(),
            id: el.id,
            className: typeof el.className === 'string' ? el.className : '',
            left: Math.round(rect.left * 10) / 10,
            right: Math.round(rect.right * 10) / 10,
            width: Math.round(rect.width * 10) / 10,
            position: style.position,
            overflowX: style.overflowX,
            clippedBy: (() => {
              let parent = el.parentElement
              while (parent && parent !== document.body) {
                const p = getComputedStyle(parent)
                if (/(hidden|clip|auto|scroll)/.test(p.overflowX)) return parent.tagName.toLowerCase() + (parent.id ? '#' + parent.id : '') + (typeof parent.className === 'string' && parent.className ? '.' + parent.className.trim().replace(/\\s+/g, '.') : '')
                parent = parent.parentElement
              }
              return getComputedStyle(document.body).overflowX
            })(),
          }
        }).filter((el) => el.width > 0 && (el.left < -1 || el.right > innerWidth + 1))
        return { amount: document.documentElement.scrollWidth - innerWidth, rootMetrics, offenders: offenders.slice(-20) }
      })
      assert.equal(overflow.amount, 0, `horizontal overflow at ${viewport.width}px: ${overflow.amount}px; offenders: ${JSON.stringify({ root: overflow.rootMetrics, offenders: overflow.offenders })}`)

      const form = page.locator('#custom-form')
      assert.equal(await form.locator('#cf-name').count(), 1)
      assert.equal(await form.locator('#cf-phone').count(), 1)
      assert.equal(await form.locator('#cf-photo').count(), 1)
      assert.ok((await form.innerText()).includes('Текст заявки передаётся только после вашего подтверждения'))
      assert.ok((await form.locator('a[href*="privacy"]').getAttribute('href')).includes('privacy'))

      if (viewport.width < 768) {
        await form.locator('#cf-name').fill('Тест')
        await form.locator('#cf-phone').fill('+7 999 000-00-00')
        await form.locator('button[data-send="tg"]').click()
        const opened = await page.evaluate(() => window.__openedHref)
        assert.ok(opened.startsWith('https://t.me/'), 'Telegram form submit did not open a Telegram draft')
        assert.ok(decodeURIComponent(opened).includes('Тест'), 'form message does not include entered name')
      }
      await context.close()
    }

    // Desktop custom cursor must follow pointer coordinates without tween lag.
    const cursorContext = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      reducedMotion: 'no-preference',
      hasTouch: false,
    })
    const cursorPage = await cursorContext.newPage()
    await cursorPage.goto(url, { waitUntil: 'networkidle' })
    await cursorPage.mouse.move(640, 400)
    await cursorPage.waitForTimeout(50)
    const cursorCenter = await cursorPage.locator('#cursor').evaluate((el) => {
      const rect = el.getBoundingClientRect()
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
    })
    assert.ok(Math.abs(cursorCenter.x - 640) <= 1.5, `custom cursor X lag/offset: expected 640, got ${cursorCenter.x}`)
    assert.ok(Math.abs(cursorCenter.y - 400) <= 1.5, `custom cursor Y lag/offset: expected 400, got ${cursorCenter.y}`)
    await cursorContext.close()

    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
    const page = await context.newPage()
    await page.goto(url + 'privacy/', { waitUntil: 'networkidle' })
    const policy = await page.locator('main').innerText()
    assert.ok(policy.includes('форма индивидуального заказа'), 'privacy policy does not describe the order form')
    assert.ok(policy.includes('локальном хранилище браузера'), 'privacy policy does not describe browser storage')
    assert.ok(policy.includes('фотографии'), 'privacy policy does not describe user-selected photos')
    await context.close()

    assert.deepEqual(errors, [], 'browser JavaScript errors')
    console.log('Redesign browser smoke tests passed (mobile, desktop, custom order form, privacy page).')
  } finally {
    await browser.close()
    await new Promise((resolve) => server.close(resolve))
  }
})().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
