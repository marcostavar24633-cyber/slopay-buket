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
  const homepageHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8')
  assert.ok(!/<link[^>]+rel=["']preconnect["'][^>]+href=["']https:\/\/mc\.yandex\.ru/i.test(homepageHtml), 'Yandex preconnect must not run before analytics consent')
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
      assert.ok((await page.locator('.hero img').first().getAttribute('alt'))?.trim(), 'hero image must have descriptive alternative text')
      const homepageSeo = await page.evaluate(() => ({
        canonical: document.querySelector('link[rel="canonical"]')?.href || '',
        description: document.querySelector('meta[name="description"]')?.content || '',
        schemas: [...document.querySelectorAll('script[type="application/ld+json"]')].map((node) => JSON.parse(node.textContent || 'null')),
      }))
      assert.equal(homepageSeo.canonical, 'https://xn--80acmogcvipsi.xn--p1ai/', 'homepage canonical URL is incorrect')
      assert.ok(homepageSeo.description.length >= 70, 'homepage meta description is missing or too short')
      assert.ok(homepageSeo.schemas.some((schema) => schema['@type'] === 'LocalBusiness' || (Array.isArray(schema['@type']) && schema['@type'].includes('LocalBusiness'))), 'homepage LocalBusiness JSON-LD is missing or invalid')
      const productList = homepageSeo.schemas.find((schema) => schema['@type'] === 'ItemList')
      assert.equal(productList?.itemListElement?.length, 6, 'homepage product structured data must include six featured products')
      assert.ok(productList.itemListElement.every((entry) => entry.item?.image?.startsWith('https://xn--80acmogcvipsi.xn--p1ai/tg/') && Number(entry.item?.offers?.price) > 0), 'featured product structured data has invalid image or price')
      const minOrderDate = await page.locator('#o-date').getAttribute('min')
      const ullyanovskToday = await page.evaluate(() => {
        const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
          timeZone: 'Europe/Ulyanovsk', year: 'numeric', month: '2-digit', day: '2-digit',
        }).formatToParts(new Date()).map((part) => [part.type, part.value]))
        return `${parts.year}-${parts.month}-${parts.day}`
      })
      assert.equal(minOrderDate, ullyanovskToday, 'minimum order date must use the business timezone')
      const categoryMismatches = await page.evaluate(() => (window.SB_DATA?.items || [])
        .filter((item) => item.img && item.cat && !item.img.includes('/' + item.cat + '/'))
        .map((item) => ({ id: item.id, category: item.cat, image: item.img })))
      assert.deepEqual(categoryMismatches, [], 'catalog categories do not match their image folders')
      // The snack item must have a registered category and open its quick-view without JS errors.
      await page.locator('#cat-tabs [data-cat="snack"]').click()
      await page.locator('#grid .card[data-id="sn-3"] .card__media').click()
      await page.locator('#quick').waitFor({ state: 'visible' })
      assert.equal((await page.locator('#qv-cat').innerText()).trim(), 'СНЕКИ И ЗАКУСКИ')
      await page.locator('#quick [data-close]').click()
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
        const rootChildren = [...document.body.children].map((el) => {
          const rect = el.getBoundingClientRect()
          const style = getComputedStyle(el)
          return { tag: el.tagName.toLowerCase(), id: el.id, className: typeof el.className === 'string' ? el.className : '', left: Math.round(rect.left * 10) / 10, right: Math.round(rect.right * 10) / 10, width: Math.round(rect.width * 10) / 10, scrollWidth: el.scrollWidth, clientWidth: el.clientWidth, overflowX: style.overflowX }
        })
        const pseudoOffenders = [...document.querySelectorAll('body *')].flatMap((el) => ['::before', '::after'].map((pseudo) => {
          const style = getComputedStyle(el, pseudo)
          if (style.content === 'none' || style.content === 'normal' || style.display === 'none') return null
          const rect = el.getBoundingClientRect()
          const left = parseFloat(style.left)
          const right = parseFloat(style.right)
          return { owner: el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (typeof el.className === 'string' && el.className ? '.' + el.className.trim().replace(/\\s+/g, '.') : ''), pseudo, position: style.position, left: Number.isFinite(left) ? Math.round(left * 10) / 10 : null, right: Number.isFinite(right) ? Math.round(right * 10) / 10 : null, ownerLeft: Math.round(rect.left * 10) / 10, ownerRight: Math.round(rect.right * 10) / 10, width: style.width, transform: style.transform }
        })).filter(Boolean)
        const scrollOverflow = [...document.querySelectorAll('#main, #main *')].map((el) => {
          const rect = el.getBoundingClientRect()
          const style = getComputedStyle(el)
          return {
            tag: el.tagName.toLowerCase(), id: el.id,
            className: typeof el.className === 'string' ? el.className : '',
            left: Math.round(rect.left * 10) / 10, right: Math.round(rect.right * 10) / 10,
            width: Math.round(rect.width * 10) / 10,
            scrollWidth: el.scrollWidth, clientWidth: el.clientWidth,
            overflowX: style.overflowX, position: style.position,
          }
        }).filter((el) => el.scrollWidth > el.clientWidth + 1)
        const mariaGlow = getComputedStyle(document.querySelector('.maria__photo'), '::before')
        return { amount: document.documentElement.scrollWidth - innerWidth, mariaGlow: { left: mariaGlow.left, right: mariaGlow.right }, rootMetrics, rootChildren, scrollOverflow: scrollOverflow.slice(0, 80), pseudoOffenders: pseudoOffenders.slice(-30), offenders: offenders.slice(-30) }
      })
      assert.equal(overflow.amount, 0, `horizontal overflow at ${viewport.width}px: ${overflow.amount}px; offenders: ${JSON.stringify(overflow)}`)

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

    // Cart order details persist locally and are included in the Telegram draft link.
    const orderContext = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
    const orderPage = await orderContext.newPage()
    await orderPage.addInitScript(() => {
      localStorage.setItem('sb-cart', JSON.stringify({ 'sn-3': 1 }))
    })
    orderPage.on('pageerror', (error) => errors.push(`cart: ${error.message}`))
    await orderPage.goto(url, { waitUntil: 'networkidle' })
    await orderPage.locator('[data-open="cart"]').click()
    await orderPage.locator('#cart').waitFor({ state: 'visible' })
    assert.ok((await orderPage.locator('#cart-list').innerText()).includes('Тачка'), 'saved cart item was not restored')
    await orderPage.locator('#o-date').fill('2099-12-31')
    await orderPage.locator('#o-time').fill('13:00–17:00')
    await orderPage.locator('#o-addr').fill('Ульяновск, тестовый адрес')
    await orderPage.locator('#o-note').fill('Тестовая открытка')
    await orderPage.locator('#o-anon').check()
    const savedOrder = await orderPage.evaluate(() => JSON.parse(localStorage.getItem('sb-order') || '{}'))
    assert.equal(savedOrder.date, '2099-12-31')
    assert.equal(savedOrder.addr, 'Ульяновск, тестовый адрес')
    assert.equal(savedOrder.note, 'Тестовая открытка')
    assert.equal(savedOrder.anon, true)
    const orderDraft = await orderPage.locator('#send-tg').getAttribute('href')
    assert.ok(orderDraft.startsWith('https://t.me/'), 'cart does not produce a Telegram draft')
    const orderText = new URL(orderDraft).searchParams.get('text') || ''
    assert.ok(orderText.includes('Тачка'), 'Telegram draft misses cart item')
    assert.ok(orderText.includes('Ульяновск, тестовый адрес'), 'Telegram draft misses delivery address')
    assert.ok(orderText.includes('Тестовая открытка'), 'Telegram draft misses card note')
    await orderContext.close()

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
    assert.ok(policy.includes('отдельного согласия на аналитику'), 'privacy policy does not describe analytics consent')
    assert.ok(policy.includes('только после нажатия «Разрешить аналитику»'), 'privacy policy does not describe analytics activation')
    await context.close()

    // Analytics must remain off until explicit consent, and persist either choice.
    for (const decision of ['reject', 'accept']) {
      let metricRequests = 0
      const consentContext = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
      const consentPage = await consentContext.newPage()
      await consentPage.addInitScript(() => {
        Object.defineProperty(navigator, 'webdriver', { configurable: true, get: () => false })
      })
      await consentPage.route('https://mc.yandex.ru/**', async (route) => {
        metricRequests += 1
        await route.fulfill({ status: 200, contentType: 'application/javascript', body: 'window.ym = window.ym || function () {};' })
      })
      await consentPage.goto(url, { waitUntil: 'networkidle' })
      const panel = consentPage.locator('.cookie-consent')
      await panel.waitFor({ state: 'visible' })
      assert.equal(await panel.getAttribute('role'), 'region', 'analytics consent must be a named region, not a modal dialog')
      assert.equal(await panel.evaluate((el) => el.previousElementSibling?.classList.contains('skip-link')), true, 'analytics consent must follow the skip link in keyboard navigation order')
      assert.ok((await panel.innerText()).includes('только с вашего разрешения'))
      await panel.locator(`button[data-choice="${decision}"]`).click()
      assert.equal(await consentPage.evaluate(() => localStorage.getItem('slopay-analytics-consent')), decision === 'accept' ? 'accepted' : 'rejected')
      if (decision === 'accept') {
        await consentPage.waitForFunction(() => window.__slopayAnalyticsStarted === true)
        assert.ok(metricRequests > 0, 'analytics was not loaded after consent')
      } else {
        await consentPage.waitForTimeout(150)
        assert.equal(metricRequests, 0, 'analytics loaded without consent')
      }
      await consentPage.reload({ waitUntil: 'networkidle' })
      if (decision === 'reject') {
        assert.equal(await consentPage.locator('.cookie-consent').count(), 0, 'rejected consent should persist')
        assert.equal(metricRequests, 0, 'analytics loaded after saved rejection')
      } else {
        await consentPage.waitForFunction(() => window.__slopayAnalyticsStarted === true)
      }
      await consentContext.close()
    }

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
