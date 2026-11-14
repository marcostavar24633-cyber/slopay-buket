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
