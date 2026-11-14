// Быстрые CI smoke-тесты для актуальной статической главной и React-превью редактора.
const { chromium } = require('playwright')
const assert = require('node:assert/strict')
const URL = process.env.URL || 'http://localhost:4173/'

;(async () => {
  const browser = await chromium.launch()
  try {
    const errors = []
    const context = await browser.newContext({ viewport: { width: 1280, height: 860 } })
    const page = await context.newPage()
    page.on('pageerror', (error) => errors.push(error.message))

    await page.goto(URL, { waitUntil: 'domcontentloaded' })
    assert.match(await page.title(), /Слопай букет/i)
    assert.ok(await page.locator('h1').count(), 'главная содержит H1')

    for (const width of [360, 768, 1280]) {
      await page.setViewportSize({ width, height: 900 })
      await page.waitForTimeout(150)
      const dimensions = await page.evaluate(() => ({
        width: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        bodyWidth: document.body.scrollWidth,
        offenders: [...document.querySelectorAll('body *')].map((el) => {
          const r = el.getBoundingClientRect()
          let clipped = false
          for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
            const o = getComputedStyle(p).overflowX
            const pr = p.getBoundingClientRect()
            if (['hidden', 'clip', 'auto', 'scroll'].includes(o) && (r.right > pr.right + 1 || r.left < pr.left - 1)) { clipped = true; break }
          }
          return { tag: el.tagName.toLowerCase(), cls: typeof el.className === 'string' ? el.className.slice(0, 90) : '', left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width), clipped }
        }).filter((r) => r.width > 0 && !r.clipped && (r.right > innerWidth + 1 || r.left < -1)).sort((a, b) => b.right - a.right).slice(0, 12),
        bodyChildren: [...document.body.children].map((el) => { const r = el.getBoundingClientRect(); return { tag: el.tagName.toLowerCase(), cls: typeof el.className === 'string' ? el.className.slice(0, 70) : '', left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width), scrollWidth: el.scrollWidth, clientWidth: el.clientWidth } }),
        rootPseudo: ['::before', '::after'].map(p => ({ selector: 'html' + p, content: getComputedStyle(document.documentElement, p).content, width: getComputedStyle(document.documentElement, p).width, position: getComputedStyle(document.documentElement, p).position, transform: getComputedStyle(document.documentElement, p).transform })),
        bodyPseudo: ['::before', '::after'].map(p => ({ selector: 'body' + p, content: getComputedStyle(document.body, p).content, width: getComputedStyle(document.body, p).width, position: getComputedStyle(document.body, p).position, transform: getComputedStyle(document.body, p).transform })),
        wideScrollers: [...document.querySelectorAll('body *')].filter(el => el.scrollWidth > el.clientWidth + 1).map(el => ({ tag: el.tagName.toLowerCase(), cls: typeof el.className === 'string' ? el.className.slice(0, 70) : '', scrollWidth: el.scrollWidth, clientWidth: el.clientWidth, overflowX: getComputedStyle(el).overflowX })).slice(0, 25),
        mainChildren: [...document.querySelector('main').children].map(el => { const r = el.getBoundingClientRect(); return { tag: el.tagName.toLowerCase(), cls: typeof el.className === 'string' ? el.className.slice(0, 90) : '', left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width), scrollWidth: el.scrollWidth, clientWidth: el.clientWidth, overflowX: getComputedStyle(el).overflowX } }),
        mainWideDescendants: [...document.querySelectorAll('main *')].filter(el => { const r = el.getBoundingClientRect(); return r.width > 0 && (r.right > innerWidth + 1 || r.left < -1 || el.scrollWidth > el.clientWidth + 8) }).map(el => { const r = el.getBoundingClientRect(); return { tag: el.tagName.toLowerCase(), cls: typeof el.className === 'string' ? el.className.slice(0, 90) : '', left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width), scrollWidth: el.scrollWidth, clientWidth: el.clientWidth, overflowX: getComputedStyle(el).overflowX } }).slice(0, 30),
      }))
      assert.ok(dimensions.scrollWidth <= dimensions.width, 'горизонтальный overflow: ' + JSON.stringify(dimensions))
    }

    await page.goto(URL + 'admin/')
    assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'), 'noindex, nofollow')
    await page.getByRole('button', { name: /Посмотреть без входа/ }).click()
    await page.getByText('Товаров на сайте').waitFor()
    await page.getByRole('button', { name: 'Визуальный редактор', exact: true }).click()

    const frame = page.locator('iframe')
    await frame.waitFor({ state: 'visible' })
    await page.waitForFunction(() => {
      const f = document.querySelector('iframe')
      return !!f && f.src.includes('editor-preview.html?edit=1') && !!f.contentDocument?.querySelector('[data-bi]')
    }, null, { timeout: 20000 })

    await page.getByRole('group', { name: 'Размер экрана' }).getByRole('button').nth(1).click()
    await page.setViewportSize({ width: 360, height: 800 })
    const dims = await frame.evaluate((f) => ({
      frameWidth: f.getBoundingClientRect().width,
      containerWidth: f.parentElement.getBoundingClientRect().width,
      inspectorHeight: document.querySelector('aside.inspector')?.getBoundingClientRect().height ?? 0,
    }))
    assert.ok(dims.frameWidth <= dims.containerWidth, 'iframe шире контейнера: ' + JSON.stringify(dims))
    assert.ok(dims.inspectorHeight <= 800 * 0.4 + 2, 'панель свойств выше 40% экрана: ' + JSON.stringify(dims))
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), 'админка не должна иметь горизонтальный скролл')
    assert.deepEqual(errors, [], 'ошибки JavaScript')
    await context.close()
    console.log('CI smoke: главная, адаптивность, демо-админка и визуальный редактор — OK')
  } finally {
    await browser.close()
  }
})().catch((error) => {
  console.error(error)
  process.exit(1)
})
