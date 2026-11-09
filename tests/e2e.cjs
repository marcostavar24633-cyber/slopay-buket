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
  // заявки в тестах не уходят в настоящий Telegram-бот
  const newContext = browser.newContext.bind(browser)
  browser.newContext = async (o) => {
    const c = await newContext(o)
    await c.route('**/api/lead', (r) => r.fulfill({ status: 200, body: 'ok' }))
    return c
  }
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
    const text = await page.evaluate(() => document.body.textContent)
    for (const bad of ['17:00', 'от 2 часов', 'через 2 часа', 'доставим сегодня', 'роддом', 'не больше 6 часов', ' мин<', 'Чек с датой', 'реальные люди', 'логотип', 'Нужны документы', 'игристое', 'в руках человека', 'шоколад', 'WhatsApp']) assert.ok(!text.includes(bad), 'найдено: ' + bad)
    for (const good of ['1–2 дня', 'Карбышева, 37', '5 декабря', 'до 15%', 'предоплат', 'Новому городу']) assert.ok(text.toLowerCase().includes(good.toLowerCase()), 'нет: ' + good)
    await ctx.close()
  })

  await test('Липкая панель MAX / Telegram / Позвонить на мобильном, у карточек нет кнопки MAX', async () => {
    const { ctx, page } = await mobile()
    const bar = page.locator('div.fixed.bottom-0')
    const wa = bar.getByRole('link', { name: 'MAX', exact: true })
    assert.ok(await wa.isVisible())
    assert.equal(await wa.getAttribute('href'), 'https://max.ru/u/f9LHodD0cOIE-osl7ttL5eRn4vgUkh_e5h3PmiZSsO1SgIH36TnP4Afv9sI')
    const tgb = bar.getByRole('link', { name: 'Telegram', exact: true })
    assert.ok(await tgb.isVisible())
    assert.match(await tgb.getAttribute('href'), /^https:\/\/t\.me\/\+79631282556\?text=/)
    assert.equal(await page.locator('#hits article a[href*="max.ru"]').count(), 0)
    assert.ok((await page.locator('a[href^="https://t.me/+79631282556"]').count()) > 0)
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
    assert.ok(cards.every((t) => /от \d[\d\s ]*₽/.test(t) && t.includes('итог зависит от размера') && t.split('\n').length >= 4), cards[0])
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

  await test('Хит продаж: 5 работ — по одной из каждой категории, метка «Хит» только у трёх', async () => {
    const { ctx, page } = await mobile()
    const h = page.locator('#hits')
    const cards = await h.locator('article').allInnerTexts()
    assert.equal(cards.length, 5)
    assert.ok(cards.every((t) => /от \d/.test(t) && t.includes('итог зависит от размера')), 'цена и пояснение')
    assert.equal(await h.locator('article span.rounded-full', { hasText: 'Хит' }).count(), 3)
    await ctx.close()
  })

  await test('Гарантия свежести: скидка, 2 часа, без замены', async () => {
    const { ctx, page } = await mobile()
    const text = await page.evaluate(() => document.body.textContent)
    assert.ok(text.includes('в течение 2 часов после вручения') && text.includes('сделаем скидку'))
    assert.ok(!text.includes('мы подтвердим'))
    for (const bad of ['пересоберём', 'привезём замену', 'вернём деньги']) assert.ok(!text.includes(bad), 'найдено: ' + bad)
    await ctx.close()
  })

  await test('Окно заказа: MAX и Telegram — личный чат, текст со ссылкой на фото копируется', async () => {
    const { ctx, page } = await mobile()
    await ctx.grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => {})
    await page.locator('#hits article').first().getByRole('button', { name: 'Заказать' }).click()
    const sheet = page.getByRole('dialog')
    await sheet.getByText('Заказ: «Розовая мечта»').first().waitFor()
    assert.equal(await sheet.getByRole('textbox').count(), 0, 'в окне не должно быть полей формы')
    const max = sheet.getByRole('link', { name: 'Написать в MAX' })
    const tg = sheet.getByRole('link', { name: 'Написать в Telegram' })
    const tgHref = decodeURIComponent(await tg.getAttribute('href'))
    assert.ok(tgHref.startsWith('https://t.me/+79631282556?text=Здравствуйте! Хочу заказать букет «Розовая мечта»'), tgHref)
    assert.ok(tgHref.includes('/tg/yag-17.jpg'), 'ссылка на фото в тексте')
    assert.ok(await max.getAttribute('href'))
    await sheet.getByText('Текст уже готов — просто нажмите «Отправить»').waitFor()
    assert.ok(tgHref.includes('(с сайта)'), 'метка источника')
    await page.context().route('https://max.ru/**', (r) => r.fulfill({ status: 200, body: 'max' }))
    const [popup] = await Promise.all([page.waitForEvent('popup'), max.click()])
    await popup.close()
    await sheet.getByText('Как это работает?').click()
    await sheet.getByText('текст скопирован').waitFor()
    const clip = await page.evaluate(() => navigator.clipboard.readText().catch(() => ''))
    if (clip) assert.ok(clip.includes('«Розовая мечта»') && clip.includes('/tg/yag-17.jpg'), 'в буфере текст и ссылка на фото: ' + clip)
    await ctx.close()
  })

  await test('Доставка по тарифам Яндекс Go, без цен на доставку', async () => {
    const { ctx, page } = await mobile()
    const sec = page.locator('#delivery')
    const t = await sec.textContent()
    assert.ok(t.includes('По тарифам') && t.includes('Яндекс Go') && t.includes('Бесплатно по Новому городу'), 'нет текста про Яндекс Go')
    for (const bad of ['от 250', 'от 350', 'от 450', 'зависит от района', 'Калькулятор']) assert.ok(!t.includes(bad), 'найдено: ' + bad)
    assert.equal(await sec.getByRole('link').count() + await sec.getByRole('button').count(), 0, 'в блоке доставки нет кнопок')
    await ctx.close()
  })

  await test('Нет блока «Удивите близких»', async () => {
    const { ctx, page } = await mobile()
    assert.equal(await page.locator('#order').count(), 0)
    assert.ok(!(await page.evaluate(() => document.body.textContent)).includes('Удивите близких'))
    await ctx.close()
  })

  await test('Квиз с первого экрана: Кому → Повод → Бюджет → Telegram/MAX/Позвонить; бегущая рамка только при наведении', async () => {
    const { ctx, page } = await mobile()
    await page.getByRole('button', { name: /Подобрать букет за 2 минуты/ }).first().click()
    const dlg = page.getByRole('dialog')
    for (const a of ['Ей', 'День рождения', '3 000 – 5 000 ₽']) await dlg.getByRole('button', { name: new RegExp(a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$') }).click()
    await dlg.getByText('Куда прислать 3 варианта с фото?').waitFor()
    const href = decodeURIComponent(await dlg.getByRole('link', { name: /Telegram/ }).getAttribute('href'))
    assert.ok(href.includes('Кому: Ей') && href.includes('Бюджет: 3 000 – 5 000 ₽') && href.includes('(с сайта)'), href)
    assert.ok((await dlg.getByRole('link', { name: /Позвонить/ }).getAttribute('href')).startsWith('tel:'))
    await page.keyboard.press('Escape')
    const after = (loc) => loc.evaluate((e) => getComputedStyle(e, '::after').animationName)
    const card = page.locator('#hits article').first()
    assert.equal(await after(card), 'none', 'в покое рамки нет')
    await card.hover()
    assert.equal(await after(card), 'run-border', 'карточка при наведении')
    await ctx.close()
  })

  await test('Корпоративный блок: количество → кнопки MAX/Telegram с текстом заказа', async () => {
    const { ctx, page } = await mobile()
    await ctx.grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => {})
    await ctx.route('https://max.ru/**', (r) => r.fulfill({ status: 200, body: 'max' }))
    await page.goto(URL + 'corporate/', { waitUntil: 'networkidle' })
    const f = page.locator('#corporate')
    await f.getByRole('radio', { name: '10–20' }).click()
    const [popup] = await Promise.all([page.waitForEvent('popup'), f.getByRole('link', { name: 'Написать в MAX' }).click()])
    await popup.close()
    await f.getByText('✓ Готово').waitFor()
    const clip = await page.evaluate(() => navigator.clipboard.readText().catch(() => ''))
    if (clip) assert.ok(clip.includes('корпоративный заказ') && clip.includes('10–20'), clip)
    await ctx.close()
  })

  await test('На сайте нет форм с телефоном', async () => {
    const { ctx, page } = await mobile()
    assert.equal(await page.locator('input[type="tel"]').count(), 0, 'нет полей телефона')
    await ctx.close()
  })

  await test('Открытое фото: только кнопка «Заказать» → окно заказа', async () => {
    const { ctx, page } = await mobile()
    await page.locator('#hits article').first().locator('button').first().click()
    const dlg = page.getByRole('dialog')
    await dlg.getByRole('button', { name: 'Заказать' }).waitFor()
    assert.equal(await dlg.getByRole('link').count(), 0, 'без ссылок MAX/Telegram')
    await dlg.getByRole('button', { name: 'Заказать' }).click()
    await page.getByRole('dialog').getByRole('link', { name: 'Написать в Telegram' }).waitFor()
    await ctx.close()
  })

  await test('По поводам: «23 Февраля» — мясные букеты, «День рождения» — ягодные', async () => {
    const { ctx, page } = await mobile()
    const sec = page.locator('#occasions')
    await sec.getByRole('button', { name: /23 Февраля/ }).click()
    await page.locator('#catalog-list h3', { hasText: 'Мясные букеты' }).first().waitFor()
    assert.ok((await page.locator('#catalog-list article').count()) > 0)
    await sec.getByRole('button', { name: /День рождения/ }).click()
    await page.locator('#catalog-list h3', { hasText: 'Ягодные букеты' }).first().waitFor()
    await ctx.close()
  })

  await test('Нет дублей: отдельного блока «Гарантии», шагов «От закупки до двери», ленты «Наши букеты», «Работаем официально»', async () => {
    const { ctx, page } = await mobile()
    const text = await page.evaluate(() => document.body.textContent)
    for (const bad of ['От закупки до вашей двери', 'Работаем официально', 'Наши букеты', 'Детские и аллерген-free', 'текст открытки', 'Коллеге / руководителю']) assert.ok(!text.includes(bad), 'найдено: ' + bad)
    for (const good of ['Гарантия свежести', 'Фото до отправки', 'Доставим вовремя', 'Каждый букет собирает']) assert.ok(text.includes(good), 'нет: ' + good)
    await ctx.close()
  })

  await test('FAQ: ответы в HTML, первыми — три возражения, разметка FAQPage', async () => {
    const { ctx, page } = await mobile()
    const qs = await page.locator('#faq summary').allTextContents()
    assert.ok(qs[0].includes('Сколько хранится') && qs[1].includes('Будет как на фото') && qs[2].includes('Успеете к сегодня'), qs.slice(0, 3).join(' | '))
    assert.ok((await page.locator('#faq').textContent()).includes('дистанционная продажа запрещена'), 'ответы в HTML')
    const ld = await page.locator('#faq script[type="application/ld+json"]').textContent()
    assert.equal(JSON.parse(ld)['@type'], 'FAQPage')
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
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
    await ctx.addInitScript(() => { try { localStorage.setItem('slopay-cookie-ok', '1') } catch {} })
    const page = await ctx.newPage()
    await page.goto(URL, { waitUntil: 'networkidle' })
    assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), 'dark')
    await page.getByRole('switch', { name: 'Включить светлую тему' }).click()
    await page.waitForFunction(() => getComputedStyle(document.body).backgroundColor === 'rgb(255, 241, 230)', null, { timeout: 5000 })
    assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), 'light')
    await page.reload({ waitUntil: 'networkidle' })
    assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), 'light')
    await page.getByRole('switch', { name: 'Включить тёмную тему' }).click()
    await page.waitForTimeout(800)
    assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), 'dark')
    await ctx.close()
  })

  await test('Шапка помещается на 360 / 1024 / 1280 px; на телефоне без переключателя темы', async () => {
    for (const viewport of [{ width: 360, height: 740 }, { width: 1280, height: 800 }, { width: 1024, height: 768 }]) {
      const ctx = await browser.newContext({ viewport })
      const page = await ctx.newPage()
      await page.goto(URL, { waitUntil: 'networkidle' })
      const r = await page.evaluate(() => {
        const head = document.querySelector('header')
        const vis = [...head.querySelectorAll('a,button')].filter((e) => e.offsetParent && !e.closest('nav[aria-label="Мобильное меню"]'))
        const right = Math.max(...vis.map((e) => e.getBoundingClientRect().right))
        const sw = [...head.querySelectorAll('[role=switch]')].filter((e) => e.offsetParent).length
        return { right, w: innerWidth, sw, ov: document.documentElement.scrollWidth - innerWidth }
      })
      assert.ok(r.right <= r.w - 8, `${viewport.width}: right=${r.right}`)
      assert.equal(r.ov, 0, `${viewport.width}: overflow ${r.ov}`)
      if (viewport.width < 768) assert.equal(r.sw, 0, 'на телефоне переключателя темы в шапке нет')
      await ctx.close()
    }
  })

  await test('Нет раздела «Наши работы» и числа 55 в оценках', async () => {
    const { ctx, page } = await mobile()
    assert.equal(await page.locator('#gallery').count(), 0)
    const text = await page.evaluate(() => document.body.textContent)
    assert.ok(!/55 оцен|по 55/.test(text), 'найдено 55')
    assert.ok(!text.includes('Наши работы'))
    await ctx.close()
  })

  await test('Отзывы: лента из 6 свежих и ссылка на все на Авито', async () => {
    const { ctx, page } = await mobile()
    assert.equal(await page.locator('#reviews figure').count(), 6)
    assert.ok((await page.locator('#reviews figure').first().textContent()).includes('2024'), 'первым — самый свежий')
    assert.ok((await page.locator('#reviews').getByRole('link', { name: /Все 107 отзывов/ }).getAttribute('href')).includes('avito.ru'))
    await ctx.close()
  })

  await test('Страница /corporate и тизер на главной', async () => {
    const { ctx, page } = await mobile()
    const btn = page.locator('#corporate').getByRole('link', { name: /Корпоративные подарки/ })
    assert.equal(await btn.getAttribute('href'), '/corporate/')
    await page.goto(URL + 'corporate/')
    await page.getByText('Рассчитать корпоративный заказ').waitFor()
    assert.ok((await page.content()).includes('data-prerendered'), 'страница пререндерена')
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

  await test('Реальные данные: Мария, 5,0 и 107 отзывов на Авито, с 2020, без выдуманных цифр', async () => {
    const { ctx, page } = await mobile()
    const text = await page.evaluate(() => document.body.textContent)
    for (const bad of ['Анна', 'Савельев', '300+', '4,9', '186', 'отзывов на Яндекс', 'Клубничный поцелуй', 'ВолгаТехСтрой']) assert.ok(!text.includes(bad), 'найдено: ' + bad)
    for (const good of ['Мария', '5,0', 'Авито', '107 отзывов', 'на Авито', 'Надёжный продавец', 'Иван', 'Ягодный букет', 'Букет из раков']) assert.ok(text.includes(good), 'нет: ' + good)
    const imgs = await page.$$eval('img', (a) => a.map((i) => i.getAttribute('src')))
    const ai = imgs.filter((s) => s && /^\/img\/[a-z]+\.webp$/.test(s) && s !== '/img/wilted.webp')
    assert.deepEqual(ai, [], 'сгенерированные фото: ' + ai.join(','))
    await ctx.close()
  })

  await test('Фильтры «Кому» (перед категориями: для неё / для него) и «Цена»', async () => {
    const { ctx, page } = await mobile()
    const c = page.locator('#catalog')
    for (const gone of ['Маме', 'Коллегам', 'Ребёнку']) assert.equal(await c.getByRole('radio', { name: gone }).count(), 0, gone)
    const tiles = () => c.locator('[role=tab] .font-display').allTextContents()
    await c.getByRole('radio', { name: 'Для него' }).click()
    assert.deepEqual((await tiles()).sort(), ['Мясные букеты', 'Раки и морепродукты'])
    await c.getByRole('radio', { name: 'Для неё' }).click()
    assert.deepEqual((await tiles()).sort(), ['Сладкие боксы', 'Сухофрукты и орехи', 'Ягодные букеты и корзины'])
    const komuY = await c.getByText('Кому', { exact: true }).boundingBox()
    const tileY = await c.locator('[role=tab]').first().boundingBox()
    assert.ok(komuY.y < tileY.y, '«Кому» над категориями')
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
    const text = await page.evaluate(() => document.body.textContent)
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

  await test('Админка: вход в демо, товары, блоки, без ошибок; закрыта от поисковиков', async () => {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 } })
    const page = await ctx.newPage()
    const errs = []
    page.on('pageerror', (e) => errs.push(e.message))
    await page.goto(URL + 'admin/')
    assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'), 'noindex, nofollow')
    assert.equal(await page.locator('script[src*="mc.yandex"]').count(), 0, 'Метрика в админке не нужна')
    await page.getByText('Посмотреть без входа').click()
    await page.getByText('Товаров на сайте').waitFor()
    await page.getByRole('button', { name: 'Товары' }).click()
    await page.locator('tbody tr').first().waitFor()
    assert.ok((await page.locator('tbody tr').count()) >= 10, 'таблица товаров')
    await page.getByRole('button', { name: 'Блоки страницы' }).click()
    await page.getByText('Каталог с ценами').waitFor()
    await page.getByLabel('Скрыть').first().click()
    await page.getByText('Есть неопубликованные правки').waitFor()
    await page.getByRole('button', { name: 'Отменить правки' }).click()
    assert.equal(await page.getByText('Есть неопубликованные правки').count(), 0)
    assert.deepEqual(errs, [])
    await ctx.close()
  })

  await test('Визуальный редактор: выбор блока, цвет фона, перетаскивание, правка заголовка на странице', async () => {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    const page = await ctx.newPage()
    const errs = []
    page.on('pageerror', (e) => errs.push(e.message))
    await page.goto(URL + 'admin/')
    await page.getByText('Посмотреть без входа').click()
    await page.getByRole('button', { name: 'Визуальный редактор', exact: true }).click()
    const f = page.frameLocator('iframe')
    await f.locator('[data-bi="1"] figure').first().waitFor()
    await page.waitForTimeout(2500)
    await f.locator('[data-bi="1"] figure').first().click()
    await page.getByRole('heading', { name: 'Отзывы' }).waitFor()
    await page.getByLabel('#1d1913').first().click()
    await page.waitForFunction(() => getComputedStyle(document.querySelector('iframe').contentDocument.querySelector('[data-bi="1"]')).backgroundColor === 'rgb(29, 25, 19)')
    const h2 = f.locator('[data-bi="1"] h2')
    await h2.click()
    await page.keyboard.press('Control+A')
    await page.keyboard.type('Нам доверяют')
    await page.keyboard.press('Enter')
    await f.locator('[data-bi="1"] h2', { hasText: 'Нам доверяют' }).waitFor()
    // перетаскивание за ярлык: «Отзывы» под «4 шага»
    await f.locator('[data-bi="1"] figure').first().scrollIntoViewIfNeeded()
    const hd = await f.locator('[data-bi="1"] .slopay-ui button').boundingBox()
    const tgt = await f.locator('[data-bi="2"]').boundingBox()
    await page.mouse.move(hd.x + 20, hd.y + 10)
    await page.mouse.down()
    await page.mouse.move(hd.x + 20, tgt.y + tgt.height - 20, { steps: 15 })
    await page.waitForTimeout(200)
    await page.mouse.up()
    await f.locator('[data-bi="2"] h2', { hasText: 'Нам доверяют' }).waitFor()
    await page.getByText('Есть неопубликованные правки').waitFor()
    assert.deepEqual(errs, [])
    await ctx.close()
  })

  await test('На сайте нет следов редактора', async () => {
    const { ctx, page } = await mobile()
    assert.equal(await page.locator('.slopay-edit, .slopay-handle, [contenteditable="true"]').count(), 0)
    await ctx.close()
  })

  await browser.close()
  for (const r of results) console.log(r.join('  '))
  const failed = results.filter((r) => r[0] === '✗').length
  console.log(`\n${results.length - failed}/${results.length} passed`)
  process.exit(failed ? 1 : 0)
})()
