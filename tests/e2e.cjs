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
    await ctx.addInitScript(() => { try { sessionStorage.setItem('exit_shown', '1'); localStorage.setItem('slopay-cookie-ok', '1') } catch {} })
    const page = await ctx.newPage()
    if (time) await page.clock.setFixedTime(new Date(time))
    await page.goto(URL, { waitUntil: 'networkidle' })
    return { ctx, page }
  }

  await test('Без временных рамок: нет «до 17:00», «от 2 часов», таймеров', async () => {
    const { ctx, page } = await mobile('2026-11-09T06:00:00Z')
    const text = await page.evaluate(() => document.body.innerText)
    for (const bad of ['17:00', 'от 2 часов', 'через 2 часа', 'доставим сегодня', 'роддом', 'не больше 6 часов', ' мин<', 'Чек с датой', 'реальные люди', 'логотип', 'Нужны документы', 'игристое', 'в руках человека', 'шоколад', 'WhatsApp']) assert.ok(!text.includes(bad), 'найдено: ' + bad)
    for (const good of ['1–2 дня', 'Карбышева, 37', '5 декабря', '−15%', 'предоплат', 'Новому городу']) assert.ok(text.toLowerCase().includes(good.toLowerCase()), 'нет: ' + good)
    await ctx.close()
  })

  await test('Липкая панель MAX/Позвонить видна на мобильном', async () => {
    const { ctx, page } = await mobile()
    const wa = page.getByRole('link', { name: 'Написать в MAX' })
    assert.ok(await wa.isVisible())
    assert.match(await wa.getAttribute('href'), /^https:\/\/max\.ru\//)
    assert.equal(await page.locator('a[href="https://t.me/+79631282556"]').count() > 0, true)
    assert.equal(await page.locator('a[href="tel:+79631282556"]').count() > 0, true)
    assert.ok(await page.getByRole('link', { name: 'Позвонить' }).last().isVisible())
    await ctx.close()
  })

  await test('Каталог: 6 категорий без карточек; клик → все фото категории с составом и ценой', async () => {
    const { ctx, page } = await mobile()
    const c = page.locator('#catalog')
    assert.equal(await c.getByRole('tab').count(), 5)
    assert.equal(await c.locator('article').count(), 0)
    const txt = await c.innerText()
    for (const bad of ['S\nM', 'чел.', 'Размер']) assert.ok(!txt.includes(bad), 'найдено: ' + bad)
    await c.getByRole('tab', { name: /Раки и морепродукты/ }).click()
    assert.equal(await c.locator('article').count(), 12)
    await c.getByRole('button', { name: 'Показать ещё 18' }).click()
    assert.equal(await c.locator('article').count(), 30)
    const cards = await c.locator('article').allInnerTexts()
    assert.ok(cards.every((t) => /от \d[\d\s ]*₽/.test(t) && t.includes('примерная цена') && t.split('\n').length >= 4), cards[0])
    assert.equal(await c.locator('article [role=radiogroup]').count(), 0)
    const names = await c.locator('article h3').allTextContents()
    assert.equal(names.length, 30)
    assert.equal(new Set(names).size, 30, 'названия должны быть разными')
    await c.locator('article').nth(2).getByRole('button', { name: /Открыть фото/ }).click()
    const dlg = page.getByRole('dialog')
    await dlg.getByText('3 / 30').waitFor()
    await dlg.getByText(/от \d/).first().waitFor()
    await page.keyboard.press('Escape')
    await ctx.close()
  })

  await test('Хит продаж: 10 работ, по 2 из каждой категории, с составом и ценой', async () => {
    const { ctx, page } = await mobile()
    const h = page.locator('#hits')
    await h.getByText('Хит продаж').first().waitFor()
    const cards = await h.locator('article').allInnerTexts()
    assert.equal(cards.length, 10)
    const cats = {}
    for (const t of cards) { const k = t.split('\n').map((l) => l.trim()).find((l) => l && l !== 'Хит'); cats[k] = (cats[k] || 0) + 1; assert.ok(/от \d/.test(t)) }
    assert.equal(Object.keys(cats).length, 5, JSON.stringify(cats))
    assert.ok(Object.values(cats).every((n) => n === 2), JSON.stringify(cats))
    await ctx.close()
  })

  await test('Гарантия свежести: скидка, 2 часа, без замены', async () => {
    const { ctx, page } = await mobile()
    const text = await page.evaluate(() => document.body.innerText)
    assert.ok(text.includes('в течение 2 часов после вручения') && text.includes('сделаем скидку'))
    assert.ok(!text.includes('мы подтвердим'))
    for (const bad of ['пересоберём', 'привезём замену', 'вернём деньги']) assert.ok(!text.includes(bad), 'найдено: ' + bad)
    await ctx.close()
  })

  await test('Шторка заказа: валидация → отправка → допродажа → «Спасибо»', async () => {
    const { ctx, page } = await mobile()
    await page.locator('#hits article').first().getByRole('button', { name: 'Заказать' }).click()
    const sheet = page.getByRole('dialog')
    await sheet.getByText('Заказ: «Клубничное сердце»').first().waitFor()
    await sheet.getByText('примерно').waitFor()
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
    await sheet.getByRole('button', { name: /^Добавить: / }).first().click()
    await sheet.getByRole('button', { name: /Добавить за .* и завершить/ }).click()
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
    await page.getByText('Мастер Мария уже смотрит вашу заявку').waitFor()
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
    await f.getByRole('radio', { name: '10–20' }).click()
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
    const small = await page.$$eval('main button, main a[href^="https://max.ru"]', (els) =>
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

  await test('Нет раздела «Наши работы» и числа 55 в оценках', async () => {
    const { ctx, page } = await mobile()
    assert.equal(await page.locator('#gallery').count(), 0)
    const text = await page.evaluate(() => document.body.innerText)
    assert.ok(!/55 оцен|по 55/.test(text), 'найдено 55')
    assert.ok(!text.includes('Наши работы'))
    await ctx.close()
  })

  await test('Отзывы с Авито: 16 скриншотов, открываются без кнопки MAX', async () => {
    const { ctx, page } = await mobile()
    const shots = page.locator('#reviews button[aria-label^="Отзыв "]')
    assert.equal(await shots.count(), 16)
    await shots.nth(2).click()
    const dlg = page.getByRole('dialog')
    await dlg.getByText('3 / 16').waitFor()
    assert.equal(await dlg.getByRole('link', { name: 'Спросить в MAX' }).count(), 0)
    await ctx.close()
  })

  await test('Все реальные фото доступны (миниатюры и полные)', async () => {
    const ctx = await browser.newContext()
    const page = await ctx.newPage()
    await page.goto(URL)
    const bad = await page.evaluate(async () => {
      const mod = await import('/src/lib/gallery.ts').catch(() => null)
      return mod ? 'dev-only' : null
    })
    void bad
    const fs = require('node:fs')
    const src = fs.readFileSync(require('node:path').resolve(__dirname, '../src/lib/gallery.ts'), 'utf8')
    const urls = [...src.matchAll(/'(\/img\/real\/[^']+\.webp)'/g)].map((m) => m[1])
    assert.ok(urls.length >= 350, 'urls ' + urls.length)
    const failed = []
    for (const u of urls) {
      const r = await page.request.get(URL.replace(/\/$/, '') + u)
      if (!r.ok()) failed.push(u)
    }
    assert.deepEqual(failed, [])
    await ctx.close()
  })

  await test('Реальные данные: Мария, 5,0 по 55 оценкам на Авито, без выдуманных цифр', async () => {
    const { ctx, page } = await mobile()
    const text = await page.evaluate(() => document.body.innerText)
    for (const bad of ['Анна', 'Савельев', '300+', '4,9', '186', 'отзывов на Яндекс', 'Клубничный поцелуй', 'ВолгаТехСтрой']) assert.ok(!text.includes(bad), 'найдено: ' + bad)
    for (const good of ['Мария', '5,0', 'Авито', 'Ягодный букет', 'Букет из раков']) assert.ok(text.includes(good), 'нет: ' + good)
    const imgs = await page.$$eval('img', (a) => a.map((i) => i.getAttribute('src')))
    const ai = imgs.filter((s) => s && /^\/img\/[a-z]+\.webp$/.test(s) && s !== '/img/wilted.webp')
    assert.deepEqual(ai, [], 'сгенерированные фото: ' + ai.join(','))
    await ctx.close()
  })

  await test('Фильтры «Кому» и «Цена» работают и без выбора категории', async () => {
    const { ctx, page } = await mobile()
    const c = page.locator('#catalog')
    await c.getByRole('radio', { name: 'Маме' }).click()
    await c.getByRole('radio', { name: 'до 3 000 ₽' }).click()
    const n = await c.locator('article').count()
    assert.ok(n > 0, 'пусто')
    const prices = await c.locator('article').allInnerTexts()
    assert.ok(prices.every((t) => { const m = t.match(/от ([\d\s ]+) ₽/); return m && Number(m[1].replace(/\D/g, '')) < 3000 }), 'цена выше 3000')
    await c.getByRole('button', { name: 'Сбросить фильтры' }).click()
    assert.equal(await c.locator('article').count(), 0)
    await ctx.close()
  })

  await test('Фото с алкоголем скрыты из каталога и хитов', async () => {
    const { ctx, page } = await mobile()
    const c = page.locator('#catalog')
    for (const name of ['Мясные букеты', 'Раки и морепродукты']) {
      await c.getByRole('tab', { name: new RegExp(name) }).click()
      const more = c.getByRole('button', { name: /Показать ещё/ })
      if (await more.count()) await more.click()
    }
    const srcs = await page.$$eval('img', (a) => a.map((i) => i.getAttribute('src') || ''))
    for (const bad of ['/k-21.', '/k-2.', '/m-26.', '/m-36.', '/sn-7.', '/k-46.']) assert.ok(!srcs.some((s) => s.includes(bad)), 'найдено ' + bad)
    await ctx.close()
  })

  await test('Политика, оферта, robots.txt, sitemap.xml, превью ссылок', async () => {
    const ctx = await browser.newContext()
    const page = await ctx.newPage()
    for (const [u, t] of [['privacy/', 'Политика обработки персональных данных'], ['oferta/', 'Публичная оферта']]) {
      await page.goto(URL + u, { waitUntil: 'networkidle' })
      await page.getByRole('heading', { level: 1, name: t }).waitFor()
      assert.ok((await page.content()).includes('ИНН'))
    }
    for (const f of ['robots.txt', 'sitemap.xml', 'og-image.jpg', 'favicon-64.png', 'apple-touch-icon.png', 'logo-256.webp']) assert.ok((await page.request.get(URL + f)).ok(), f)
    await page.goto(URL, { waitUntil: 'domcontentloaded' })
    assert.match(await page.locator('meta[property="og:image"]').getAttribute('content'), /^https:\/\/.+\/og-image\.jpg$/)
    await ctx.close()
  })

  await test('Уведомление о cookie: показывается и запоминается', async () => {
    const ctx = await browser.newContext({ ...devices['iPhone 13'] })
    const page = await ctx.newPage()
    await page.goto(URL, { waitUntil: 'networkidle' })
    const n = page.getByRole('region', { name: 'Уведомление о cookie' })
    await n.waitFor()
    await n.getByRole('button', { name: 'Понятно' }).click()
    await page.reload({ waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)
    assert.equal(await n.count(), 0)
    await ctx.close()
  })

  await test('Нет выдуманного: Instagram, «23 слота», «в течение часа»', async () => {
    const { ctx, page } = await mobile()
    const html = await page.content()
    const text = await page.evaluate(() => document.body.innerText)
    assert.ok(!/instagram/i.test(html))
    for (const bad of ['23 слота', 'осталось 23', 'в течение часа']) assert.ok(!text.includes(bad), bad)
    await ctx.close()
  })

  await test('Дубликаты фото не показываются', async () => {
    const { ctx, page } = await mobile()
    const c = page.locator('#catalog')
    const seen = []
    for (const i of [0, 1, 2, 3, 4]) {
      await c.getByRole('tab').nth(i).click()
      const more = c.getByRole('button', { name: /Показать ещё/ })
      if (await more.count()) await more.click()
      seen.push(...(await c.locator('article img').evaluateAll((a) => a.map((x) => x.getAttribute('src')))))
    }
    for (const bad of ['/k-12.', '/m-28.', '/suh-4.', '/sl-14.', '/sl-23.']) assert.ok(!seen.some((s) => s.includes(bad)), bad)
    assert.equal(new Set(seen).size, seen.length, 'повтор в каталоге')
    await ctx.close()
  })

  await browser.close()
  for (const r of results) console.log(r.join('  '))
  const failed = results.filter((r) => r[0] === '✗').length
  console.log(`\n${results.length - failed}/${results.length} passed`)
  process.exit(failed ? 1 : 0)
})()
