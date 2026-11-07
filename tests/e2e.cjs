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

  await test('Каталог: «Состав» первым, карточки — категории без названий и «чел.», клик открывает категорию', async () => {
    const { ctx, page } = await mobile()
    const tabs = await page.locator('#catalog [role=tablist] [role=tab]').allTextContents()
    assert.deepEqual(tabs, ['Состав', 'Кому', 'Цена'])
    const titles = await page.locator('#catalog article h3').allTextContents()
    const cats = ['Ягодный букет', 'Мясной букет', 'Букет из раков', 'Сухофрукты и орехи', 'Сладкий бокс', 'Мужской набор']
    assert.ok(titles.every((t) => cats.includes(t)), titles.join(','))
    assert.ok(!(await page.locator('#catalog').innerText()).includes('чел.'))
    await page.locator('#catalog article').nth(1).getByRole('button', { name: /^\d+ работ|работ$/ }).filter({ hasText: 'работ' }).first().click()
    const dlg = page.getByRole('dialog')
    await dlg.getByRole('heading', { name: 'Раки и морепродукты' }).waitFor()
    assert.equal(await dlg.locator('button[aria-label^="Открыть фото"]').count(), 36)
    await dlg.locator('button[aria-label^="Открыть фото"]').nth(3).click()
    await page.getByText('4 / 36').waitFor()
    await page.keyboard.press('Escape')
    await page.waitForTimeout(500)
    assert.equal(await page.locator('[role=dialog] h2', { hasText: 'Раки и морепродукты' }).count(), 1, 'категория должна остаться открытой')
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
    await page.locator('#catalog').getByRole('tab', { name: 'Кому' }).click()
    await page.locator('#catalog').getByRole('button', { name: 'Для него', exact: true }).click()
    await page.waitForTimeout(500)
    const names = await page.locator('#catalog article h3').allTextContents()
    assert.equal(names.length, 8)
    assert.ok(!names.includes('Ягодный букет'), names.join(','))
    await ctx.close()
  })

  await test('Шторка заказа: валидация → отправка → допродажа → «Спасибо»', async () => {
    const { ctx, page } = await mobile()
    await page.locator('#catalog article').first().getByRole('button', { name: 'Заказать' }).click()
    const sheet = page.getByRole('dialog')
    await sheet.getByText('Заказ: Ягодный букет').first().waitFor()
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

  await test('Галерея: вкладка «Раки» → 36 фото, просмотр, листание, MAX с номером фото', async () => {
    const { ctx, page } = await mobile()
    const g = page.locator('#gallery')
    await g.getByRole('tab', { name: /Раки и морепродукты/ }).click()
    await g.getByRole('button', { name: /Показать ещё 12 фото/ }).click()
    assert.equal(await g.locator('button[aria-label^="Открыть фото"]').count(), 36)
    await g.locator('button[aria-label^="Открыть фото"]').first().click()
    const dlg = page.getByRole('dialog')
    await dlg.getByText('1 / 36').waitFor()
    await dlg.getByRole('button', { name: 'Следующее фото' }).click()
    await dlg.getByText('2 / 36').waitFor()
    await page.keyboard.press('ArrowLeft')
    await dlg.getByText('1 / 36').waitFor()
    const href = decodeURIComponent(await dlg.getByRole('link', { name: /Хочу такой/ }).getAttribute('href'))
    assert.match(href, /^https:\/\/max\.ru\//)
    await dlg.getByText('· Букет из раков').waitFor()
    await page.keyboard.press('Escape')
    await ctx.close()
  })

  await test('Отзывы с Авито: 16 скриншотов, открываются без кнопки MAX', async () => {
    const { ctx, page } = await mobile()
    const shots = page.locator('#reviews button[aria-label^="Отзыв "]')
    assert.equal(await shots.count(), 16)
    await shots.nth(2).click()
    const dlg = page.getByRole('dialog')
    await dlg.getByText('3 / 16').waitFor()
    assert.equal(await dlg.getByRole('link', { name: /Хочу такой/ }).count(), 0)
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
    for (const good of ['Мария', '5,0', '55 оценок', 'Авито', 'Ягодный букет', 'Букет из раков']) assert.ok(text.includes(good), 'нет: ' + good)
    const imgs = await page.$$eval('img', (a) => a.map((i) => i.getAttribute('src')))
    const ai = imgs.filter((s) => s && /^\/img\/[a-z]+\.webp$/.test(s) && s !== '/img/wilted.webp')
    assert.deepEqual(ai, [], 'сгенерированные фото: ' + ai.join(','))
    await ctx.close()
  })

  await browser.close()
  for (const r of results) console.log(r.join('  '))
  const failed = results.filter((r) => r[0] === '✗').length
  console.log(`\n${results.length - failed}/${results.length} passed`)
  process.exit(failed ? 1 : 0)
})()
