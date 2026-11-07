// E2E-проверки конверсионных сценариев. Запуск: npm run preview, затем node tests/e2e.cjs
const { chromium, devices } = require('playwright')
const assert = require('node:assert/strict')
const URL = process.env.URL || 'http://localhost:4173/'

const results = []
async function test(name, fn) {
  try {
    await fn()
    results.push(['✓', name])
  } catch (e) {
    results.push(['✗', name, e.message.split('\n')[0]])
  }
}

;(async () => {
  const browser = await chromium.launch()
  const mobile = async (time) => {
    const ctx = await browser.newContext({ ...devices['iPhone 13'], deviceScaleFactor: 1 })
    await ctx.addInitScript(() => { try { sessionStorage.setItem('exit_shown', '1') } catch {} })
    const page = await ctx.newPage()
    if (time) await page.clock.setFixedTime(new Date(time))
    await page.goto(URL, { waitUntil: 'networkidle' })
    return { ctx, page }
  }

  await test('Утро (10:00 Ульяновск): статус «на сегодня до 17:00»', async () => {
    const { ctx, page } = await mobile('2026-11-09T06:00:00Z')
    await page.locator('p:visible', { hasText: 'Успеем доставить сегодня, если закажете до 17:00' }).first().waitFor()
    await ctx.close()
  })

  await test('Вечер (19:00 Ульяновск): статус «на завтра»', async () => {
    const { ctx, page } = await mobile('2026-11-09T15:00:00Z')
    await page.locator('p:visible', { hasText: 'Сегодня уже не успеем' }).first().waitFor()
    await ctx.close()
  })

  await test('Липкая панель WhatsApp/Позвонить видна на мобильном', async () => {
    const { ctx, page } = await mobile()
    const wa = page.getByRole('link', { name: 'Написать в WhatsApp' })
    assert.ok(await wa.isVisible())
    assert.match(await wa.getAttribute('href'), /^https:\/\/wa\.me\/79278007090\?text=/)
    assert.ok(await page.getByRole('link', { name: 'Позвонить' }).last().isVisible())
    await ctx.close()
  })

  await test('Карточка: WA-ссылка содержит название букета', async () => {
    const { ctx, page } = await mobile()
    const href = await page.getByRole('link', { name: 'Спросить про «Мужской разговор» в WhatsApp' }).getAttribute('href')
    assert.ok(decodeURIComponent(href).includes('Хочу букет «Мужской разговор»'))
    await ctx.close()
  })

  await test('Переключатель S/M/L меняет цену', async () => {
    const { ctx, page } = await mobile()
    const card = page.locator('#catalog article').first()
    await card.getByRole('radio', { name: 'L' }).click()
    await card.getByText('5 490 ₽').waitFor()
    await ctx.close()
  })

  await test('Фильтр «Для него» показывает только мужские букеты', async () => {
    const { ctx, page } = await mobile()
    await page.locator('#catalog').getByRole('button', { name: 'Для него', exact: true }).click()
    await page.waitForTimeout(500)
    const names = await page.locator('#catalog article h3').allTextContents()
    assert.deepEqual(names.sort(), ['Мужской разговор', 'Новогоднее чудо', 'Сырный сомелье', 'Футбольный вечер'].sort())
    await ctx.close()
  })

  await test('Шторка заказа: валидация → отправка → допродажа → «Спасибо»', async () => {
    const { ctx, page } = await mobile()
    await page.locator('#catalog article').first().getByRole('button', { name: 'Заказать' }).click()
    const sheet = page.getByRole('dialog')
    await sheet.getByText('Клубничный поцелуй').first().waitFor()
    await sheet.getByRole('button', { name: 'Оформить заказ' }).click()
    await sheet.getByRole('alert').filter({ hasText: 'Как к вам обращаться' }).waitFor()
    await sheet.getByLabel('Имя').fill('Ольга')
    await sheet.getByLabel('Телефон').fill('89271234567')
    assert.equal(await sheet.getByLabel('Телефон').inputValue(), '+7 (927) 123-45-67')
    await sheet.getByRole('radio', { name: 'Завтра' }).click()
    await sheet.getByText('Добавить открытку с моим текстом').click()
    await sheet.locator('textarea').fill('С днём рождения!')
    await sheet.getByRole('button', { name: 'Оформить заказ' }).click()
    await sheet.getByText('Добавить к заказу?').waitFor()
    await sheet.getByRole('button', { name: 'Добавить: Связка из 5 шаров' }).click()
    await sheet.getByRole('button', { name: /Добавить за 790 ₽ и завершить/ }).click()
    await page.getByText('Спасибо, Ольга!').waitFor()
    await ctx.close()
  })

  await test('Квиз в поп-апе с первого экрана: 4 вопроса → телефон → «Спасибо»', async () => {
    const { ctx, page } = await mobile()
    await page.locator('button:visible', { hasText: 'Подобрать за 1 минуту' }).first().click()
    const dlg = page.getByRole('dialog')
    for (const a of ['Мужчине', 'День рождения', 'Мясо и сыр', '3 000 – 5 000 ₽']) await dlg.getByRole('button', { name: a }).click()
    await dlg.getByText('Готово! Куда прислать подборку?').waitFor()
    await dlg.getByText('+ открытка с вашим текстом в подарок').waitFor()
    await dlg.getByLabel('Телефон').fill('9271112233')
    await dlg.getByRole('button', { name: 'Получить 3 варианта' }).click()
    await page.getByText('Мастер Анна уже смотрит вашу заявку').waitFor()
    await ctx.close()
  })

  await test('Квиз: «Команде» уводит в корпоративный блок', async () => {
    const { ctx, page } = await mobile()
    await page.locator('#quiz').getByRole('button', { name: /Команде/ }).click()
    await page.waitForTimeout(1500)
    const top = await page.locator('#corporate').evaluate((el) => el.getBoundingClientRect().top)
    assert.ok(Math.abs(top) < 200, 'corporate top=' + top)
    await ctx.close()
  })

  await test('Корпоративная форма отправляется', async () => {
    const { ctx, page } = await mobile()
    const f = page.locator('#corporate form')
    await f.getByLabel('Имя').fill('Ирина')
    await f.getByLabel('Телефон').fill('9270000000')
    await f.getByRole('radio', { name: '10–30' }).click()
    await f.getByRole('button', { name: 'Получить коммерческое предложение' }).click()
    await page.getByText('Спасибо, Ирина!').waitFor()
    await ctx.close()
  })

  await test('Финальная форма + мини-форма доставки', async () => {
    const { ctx, page } = await mobile()
    const f = page.locator('#order form')
    await f.getByLabel('Имя').fill('Пётр')
    await f.getByLabel('Телефон').fill('9275554433')
    await f.getByRole('button', { name: 'Подобрать букет' }).click()
    await page.getByText('Спасибо, Пётр!').waitFor()
    await ctx.close()
  })

  await test('FAQ: аккордеон раскрывается', async () => {
    const { ctx, page } = await mobile()
    await page.getByRole('button', { name: 'Можно добавить алкоголь?' }).click()
    await page.getByText('Дистанционная продажа алкоголя').waitFor()
    await ctx.close()
  })

  await test('Нет горизонтального скролла и ошибок JS (мобильный и десктоп)', async () => {
    for (const opts of [{ ...devices['iPhone SE'] }, { viewport: { width: 1280, height: 800 } }]) {
      const ctx = await browser.newContext(opts)
      const page = await ctx.newPage()
      const errs = []
      page.on('pageerror', (e) => errs.push(e.message))
      await page.goto(URL, { waitUntil: 'networkidle' })
      const ov = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
      assert.equal(ov, 0, 'overflow ' + ov)
      assert.deepEqual(errs, [])
      await ctx.close()
    }
  })

  await test('Кнопки CTA на мобильном не ниже 44 px', async () => {
    const { ctx, page } = await mobile()
    const small = await page.$$eval('main button, main a[href^="https://wa.me"]', (els) =>
      els.filter((e) => e.offsetParent && e.getBoundingClientRect().height < 40 && e.textContent.trim().length > 8).map((e) => e.textContent.trim().slice(0, 40)),
    )
    assert.deepEqual(small, [])
    await ctx.close()
  })

  await test('Переключатель темы: тёмная по умолчанию → светлая, запоминается после перезагрузки', async () => {
    const { ctx, page } = await mobile()
    assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), 'dark')
    await page.getByRole('switch', { name: 'Включить светлую тему' }).click()
    await page.waitForTimeout(800)
    assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), 'light')
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
    assert.equal(bg, 'rgb(255, 241, 230)')
    await page.reload({ waitUntil: 'networkidle' })
    assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), 'light')
    await page.getByRole('switch', { name: 'Включить тёмную тему' }).click()
    await page.waitForTimeout(800)
    assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), 'dark')
    await ctx.close()
  })

  await test('Шапка с переключателем помещается на 360 px и 1280 px', async () => {
    for (const viewport of [{ width: 360, height: 740 }, { width: 1280, height: 800 }, { width: 1024, height: 768 }]) {
      const ctx = await browser.newContext({ viewport })
      const page = await ctx.newPage()
      await page.goto(URL, { waitUntil: 'networkidle' })
      const r = await page.evaluate(() => {
        const sw = [...document.querySelectorAll('[role=switch]')].find((e) => e.offsetParent)
        const b = sw.getBoundingClientRect()
        return { right: b.right, top: b.top, w: innerWidth, ov: document.documentElement.scrollWidth - innerWidth }
      })
      assert.ok(r.right <= r.w - 8 && r.right >= r.w - 80, `${viewport.width}: switch right=${r.right}`)
      assert.equal(r.ov, 0, `${viewport.width}: overflow ${r.ov}`)
      await ctx.close()
    }
  })

  await browser.close()
  for (const r of results) console.log(r.join('  '))
  const failed = results.filter((r) => r[0] === '✗').length
  console.log(`\n${results.length - failed}/${results.length} passed`)
  process.exit(failed ? 1 : 0)
})()
