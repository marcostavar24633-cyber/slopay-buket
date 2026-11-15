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

    // Аналитика не должна загружаться до согласия; отказ сохраняется после перезагрузки.
    const analyticsRequests = []
    page.on('request', (request) => {
      if (request.url().includes('mc.yandex.ru')) analyticsRequests.push(request.url())
    })
    await page.locator('.cookie-consent').waitFor({ state: 'visible' })
    assert.equal(await page.locator('noscript img[src*="mc.yandex.ru"]').count(), 0, 'noscript не должен обходить согласие на аналитику')
    assert.equal(analyticsRequests.length, 0, 'Яндекс Метрика не должна загружаться до выбора посетителя')
    await page.locator('.cookie-consent button[data-choice="reject"]').click()
    assert.equal(await page.evaluate(() => localStorage.getItem('slopay-analytics-consent')), 'rejected')
    await page.reload({ waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(250)
    assert.equal(await page.locator('.cookie-consent').count(), 0, 'после отказа уведомление не должно показываться повторно')
    assert.equal(analyticsRequests.length, 0, 'после отказа запросы к Яндекс Метрике запрещены')

    // Согласие запускает счётчик, а не просто скрывает уведомление.
    const acceptedContext = await browser.newContext()
    const acceptedPage = await acceptedContext.newPage()
    // В production счётчик намеренно отключён для Playwright; здесь проверяем именно ветку согласия.
    await acceptedPage.addInitScript(() => Object.defineProperty(navigator, 'webdriver', { configurable: true, get: () => false }))
    const acceptedAnalyticsRequests = []
    acceptedPage.on('request', (request) => {
      if (request.url().includes('mc.yandex.ru/metrika/tag.js')) acceptedAnalyticsRequests.push(request.url())
    })
    await acceptedPage.goto(URL, { waitUntil: 'domcontentloaded' })
    await acceptedPage.locator('.cookie-consent button[data-choice="accept"]').click()
    await acceptedPage.waitForFunction(() => window.__slopayAnalyticsStarted === true)
    assert.equal(await acceptedPage.evaluate(() => localStorage.getItem('slopay-analytics-consent')), 'accepted')
    await acceptedPage.waitForFunction(() => document.querySelector('script[src*="mc.yandex.ru/metrika/tag.js"]') !== null)
    assert.ok(acceptedAnalyticsRequests.length > 0, 'после согласия должен загружаться счётчик')
    await acceptedContext.close()

    // Публичные внутренние страницы не должны обходить согласие отдельным счётчиком или noscript beacon.
    const publicPagesContext = await browser.newContext()
    for (const route of ['privacy/', 'oferta/', 'corporate/']) {
      const publicPage = await publicPagesContext.newPage()
      const pageAnalyticsRequests = []
      publicPage.on('request', (request) => {
        if (request.url().includes('mc.yandex.ru')) pageAnalyticsRequests.push(request.url())
      })
      await publicPage.goto(new globalThis.URL(route, URL).toString(), { waitUntil: 'domcontentloaded' })
      assert.equal(pageAnalyticsRequests.length, 0, route + ' не должна загружать Яндекс Метрику без согласия')
      assert.equal(await publicPage.locator('noscript img[src*="mc.yandex.ru"]').count(), 0, route + ' не должна содержать обходной noscript beacon')
      await publicPage.close()
    }
    await publicPagesContext.close()

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

    // Все поля ввода имеют программно определяемую подпись.
    const unlabeledFields = await page.locator('input, textarea, select').evaluateAll((fields) =>
      fields.filter((el) => !el.labels?.length && !el.getAttribute('aria-label') && !el.getAttribute('aria-labelledby'))
        .map((el) => ({ id: el.id, type: el.type || el.tagName.toLowerCase() }))
    )
    assert.deepEqual(unlabeledFields, [], 'поля без доступных подписей: ' + JSON.stringify(unlabeledFields))

    // Доступность вкладок каталога: стрелки, Home/End и связь с областью содержимого.
    const categoryTabs = page.locator('#cat-tabs [role="tab"]')
    const catalogPanel = page.locator('#grid[role="tabpanel"]')
    assert.ok(await catalogPanel.count(), 'у вкладок есть панель содержимого')
    assert.equal(await categoryTabs.first().getAttribute('tabindex'), '0')
    await categoryTabs.first().focus()
    assert.equal(await page.evaluate(() => document.activeElement?.id), await categoryTabs.first().getAttribute('id'), 'фокус установлен на первой вкладке')
    const keyHandled = await categoryTabs.first().evaluate((el) => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true })
      el.dispatchEvent(event)
      return event.defaultPrevented
    })
    const tabDebug = await categoryTabs.evaluateAll((els) => els.map((el) => ({ id: el.id, selected: el.getAttribute('aria-selected'), tabIndex: el.tabIndex })))
    assert.equal(keyHandled, true, 'обработчик должен перехватить ArrowRight')
    assert.equal(await categoryTabs.nth(1).getAttribute('aria-selected'), 'true', 'стрелка вправо выбирает следующую вкладку: ' + JSON.stringify(tabDebug))
    assert.equal(await categoryTabs.nth(1).getAttribute('tabindex'), '0')
    assert.equal(await catalogPanel.getAttribute('aria-labelledby'), await categoryTabs.nth(1).getAttribute('id'))
    await page.keyboard.press('End')
    assert.equal(await categoryTabs.last().getAttribute('aria-selected'), 'true', 'End выбирает последнюю вкладку')
    await page.locator('#grid .card').filter({ hasText: 'Тачка' }).waitFor({ state: 'visible' })
    assert.equal(await page.locator('#grid .card').filter({ hasText: 'Тачка' }).count(), 1, 'последняя вкладка «Снеки» должна показывать товар «Тачка»')
    await page.keyboard.press('Home')
    assert.equal(await categoryTabs.first().getAttribute('aria-selected'), 'true', 'Home возвращает первую вкладку')
    
    // Проверяем реальный путь заказа без отправки данных в мессенджер.
    const addToCart = page.locator('#hits-list .add-btn').first()
    await addToCart.waitFor({ state: 'visible' })
    await addToCart.click()
    await page.locator('button.cart-btn').click()
    await page.locator('#cart-list .cart-item').first().waitFor()
    const deliveryThreshold = await page.evaluate(() => {
      const { items, site } = window.SB_DATA
      const cart = JSON.parse(localStorage.getItem('sb-cart') || '{}')
      const total = Object.entries(cart).reduce((sum, [id, quantity]) => {
        const product = items.find((item) => item.id === id)
        return sum + (product?.price || 0) * quantity
      }, 0)
      return { threshold: Number(site.freeDeliveryFrom), expectedLeft: Number(site.freeDeliveryFrom) - total }
    })
    assert.ok(deliveryThreshold.threshold > 0, 'в данных магазина должен быть задан порог бесплатной доставки')
    const freeDeliveryText = await page.locator('#free-text').innerText()
    assert.equal(freeDeliveryText.replace(/\\D/g, ''), String(deliveryThreshold.expectedLeft), 'индикатор бесплатной доставки должен использовать порог из site.json')
    const expectedUlyanovskDate = await page.evaluate(() => {
      const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Ulyanovsk', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date()).map((part) => [part.type, part.value]))
      return `${parts.year}-${parts.month}-${parts.day}`
    })
    assert.equal(await page.locator('#o-date').getAttribute('min'), expectedUlyanovskDate, 'минимальная дата доставки должна соответствовать текущей дате Ульяновска, а не UTC')
    await page.locator('#o-date').fill(expectedUlyanovskDate)
    await page.locator('#o-time').fill('18:00')
    await page.locator('#o-addr').fill('Тестовый адрес, 1')
    await page.locator('#o-note').fill('Тестовая записка')
    await page.locator('#o-anon').check()
    assert.equal(await page.locator('#send-tg').evaluate((el) => el.tagName), 'BUTTON', 'заказ не должен хранить приватный текст в href DOM')
    assert.equal(await page.locator('#send-tg').getAttribute('href'), null, 'у кнопки заказа не должно быть href с параметрами заказа')
    assert.ok(await page.locator('#cart-total').innerText().then((v) => !/0 ₽/.test(v)), 'итог заказа должен обновиться')
    const cartPopupPromise = page.waitForEvent('popup')
    await page.locator('#send-tg').click()
    const cartPopup = await cartPopupPromise
    await cartPopup.waitForLoadState('domcontentloaded').catch(() => {})
    assert.ok(cartPopup.url().startsWith('https://t.me/'), 'кнопка корзины должна открыть Telegram: ' + cartPopup.url())
    const orderMessage = decodeURIComponent(cartPopup.url())
    assert.match(orderMessage, /Хочу заказать букет/i)
    assert.match(orderMessage, /Дата:/, 'в заказ должна попасть дата доставки')
    assert.match(orderMessage, /Время: 18:00/, 'в заказ должно попасть время доставки')
    assert.match(orderMessage, /Адрес: Тестовый адрес, 1/, 'в заказ должен попасть адрес')
    assert.match(orderMessage, /Записка: «Тестовая записка»/, 'в заказ должен попасть текст записки')
    assert.match(orderMessage, /Доставка анонимно/, 'в заказ должен попасть признак анонимной доставки')
    await cartPopup.close().catch(() => {})

    // If both Clipboard API and execCommand fail, preserve the full order in a manual-copy fallback.
    await page.evaluate(() => {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { writeText: () => Promise.reject(new Error('Clipboard denied')) },
      })
      document.execCommand = () => false
      window.__slopayPromptText = null
      window.prompt = (_message, value) => { window.__slopayPromptText = value; return null }
    })
    const maxPopupPromise = page.waitForEvent('popup')
    await page.locator('#send-max').click()
    const maxPopup = await maxPopupPromise
    assert.ok(maxPopup.url().startsWith('https://max.ru/'), 'кнопка корзины должна открыть MAX: ' + maxPopup.url())
    await page.waitForFunction(() => typeof window.__slopayPromptText === 'string')
    const fallbackOrder = await page.evaluate(() => window.__slopayPromptText)
    assert.match(fallbackOrder, /Хочу заказать букет/i, 'резервный текст должен содержать заказ')
    assert.match(fallbackOrder, /Адрес: Тестовый адрес, 1/, 'резервный текст должен сохранять адрес')
    assert.match(fallbackOrder, /Записка: «Тестовая записка»/, 'резервный текст должен сохранять записку')
    assert.match(fallbackOrder, /Доставка анонимно/, 'резервный текст должен сохранять признак анонимной доставки')
    await maxPopup.close().catch(() => {})

    // Мобильная корзина: панель и обе кнопки отправки остаются в пределах экрана.
    await page.setViewportSize({ width: 360, height: 800 })
    if (!(await page.locator('#cart').evaluate((el) => el.classList.contains('is-open')))) {
      await page.locator('button.cart-btn').click()
    }
    await page.waitForFunction(() => {
      const el = document.querySelector('#cart')
      return !!el && el.classList.contains('is-open') && el.getBoundingClientRect().right <= innerWidth + 1
    }, null, { timeout: 3000 })
    const cartBounds = await page.locator('#cart').evaluate((el) => {
      const r = el.getBoundingClientRect()
      return { left: r.left, right: r.right, width: r.width, viewport: innerWidth, height: r.height, viewportHeight: innerHeight }
    })
    assert.ok(cartBounds.left >= -1 && cartBounds.right <= cartBounds.viewport + 1, 'мобильная корзина выходит за экран: ' + JSON.stringify(cartBounds))
    assert.ok(cartBounds.height <= cartBounds.viewportHeight + 1, 'мобильная корзина выше экрана: ' + JSON.stringify(cartBounds))
    for (const selector of ['#send-tg', '#send-max']) {
      const bounds = await page.locator(selector).evaluate((el) => {
        const r = el.getBoundingClientRect()
        return { left: r.left, right: r.right, height: r.height, viewport: innerWidth }
      })
      assert.ok(bounds.left >= -1 && bounds.right <= bounds.viewport + 1 && bounds.height >= 44, 'кнопка заказа неудобна на телефоне: ' + selector + ' ' + JSON.stringify(bounds))
    }
    await page.locator('#cart button[data-close]').click()

    // Форма индивидуального заказа: проверяем ошибку телефона и корректную Telegram-ссылку.
    await page.locator('#cf-phone').fill('123')
    await page.locator('#custom-form button[type="submit"][data-send="tg"]').click()
    assert.match(await page.locator('.field__err').innerText(), /Проверьте номер/)
    await page.locator('#cf-name').fill('Тест')
    await page.locator('#cf-phone').fill('+79131234567')
    await page.locator('#cf-wish').fill('Тестовая заявка')
    const popupPromise = page.waitForEvent('popup')
    await page.locator('#custom-form button[type="submit"][data-send="tg"]').click()
    assert.match(await page.locator('#toast').innerText(), /нажмите «Отправить» в Telegram/, 'интерфейс не должен выдавать открытие мессенджера за отправленную заявку')
    const popup = await popupPromise
    await popup.waitForLoadState('domcontentloaded').catch(() => {})
    assert.ok(popup.url().startsWith('https://t.me/'), 'форма должна открыть Telegram: ' + popup.url())
    assert.ok(decodeURIComponent(popup.url()).includes('Тестовая заявка'), 'в ссылке должны быть пожелания')
    await popup.close().catch(() => {})

    // Отмена системного меню «Поделиться» не должна неожиданно открывать Telegram.
    await page.locator('#cf-photo').setInputFiles({ name: 'example.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jWioAAAAASUVORK5CYII=', 'base64') })
    await page.evaluate(() => {
      Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => true })
      Object.defineProperty(navigator, 'share', { configurable: true, value: () => Promise.reject(new DOMException('User cancelled', 'AbortError')) })
    })
    const pagesBeforeCancelledShare = page.context().pages().length
    await page.locator('#custom-form button[type="submit"][data-send="tg"]').click()
    await page.getByText('Отправка отменена').waitFor()
    assert.equal(page.context().pages().length, pagesBeforeCancelledShare, 'отмена системного меню не должна открывать Telegram автоматически')

    await page.setViewportSize({ width: 1280, height: 900 })

    // Диалог квиза: фокус входит внутрь, Escape закрывает окно и возвращает фокус инициатору.
    const quizOpener = page.getByRole('button', { name: /Подобрать за 30 секунд/ }).first()
    await quizOpener.focus()
    await quizOpener.click()
    await page.locator('#quiz.is-open').waitFor()
    await page.waitForFunction(() => {
      const dialog = document.querySelector('#quiz')
      return !!dialog && dialog.contains(document.activeElement)
    }, null, { timeout: 3000 })
    const quizFocusInside = await page.locator('#quiz').evaluate((el) => el.contains(document.activeElement))
    assert.equal(quizFocusInside, true, 'при открытии диалога фокус должен перейти внутрь')
    await page.keyboard.press('Escape')
    await page.locator('#quiz').waitFor({ state: 'hidden' })
    assert.equal(await page.evaluate(() => document.activeElement?.classList.contains('quiz-open')), true, 'после закрытия диалога фокус возвращается к кнопке открытия')

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
    // Persisted cart drafts can outlive catalog changes or contain malformed quantities.
    // Keep only current products with positive integer quantities and rewrite the browser draft.
    const staleCartContext = await browser.newContext()
    const staleCartPage = await staleCartContext.newPage()
    await staleCartPage.addInitScript(() => {
      localStorage.setItem('slopay-analytics-consent', 'rejected')
      localStorage.setItem('sb-cart', JSON.stringify({
        'yag-17': 2,
        'removed-product': 4,
        'k-36': 0,
        'm-1': '3',
        'sl-25': 1.5,
      }))
    })
    await staleCartPage.goto(URL, { waitUntil: 'domcontentloaded' })
    await staleCartPage.locator('#hits-list .add-btn').first().waitFor({ state: 'visible' })
    await staleCartPage.locator('button.cart-btn').click()
    await staleCartPage.locator('#cart-list .cart-item').waitFor()
    assert.equal(await staleCartPage.locator('#cart-count').innerText(), '2', 'счётчик должен учитывать только валидные позиции')
    assert.equal(await staleCartPage.locator('#cart-list .cart-item').count(), 1, 'устаревшие и некорректные позиции не должны отображаться')
    assert.deepEqual(
      await staleCartPage.evaluate(() => JSON.parse(localStorage.getItem('sb-cart'))),
      { 'yag-17': 2 },
      'локальная корзина должна быть очищена от удалённых товаров и некорректного количества'
    )
    await staleCartContext.close()

    // A saved delivery date may become stale while the visitor is away.
    const staleOrderContext = await browser.newContext()
    const staleOrderPage = await staleOrderContext.newPage()
    await staleOrderPage.addInitScript(() => {
      localStorage.setItem('slopay-analytics-consent', 'rejected')
      if (localStorage.getItem('__stale-order-fixture-seeded') !== 'yes') {
        localStorage.setItem('__stale-order-fixture-seeded', 'yes')
        localStorage.setItem('sb-order', JSON.stringify({
          date: '2000-01-01',
          time: '18:00',
          addr: 'Сохранённый адрес',
          note: 'Сохранённая записка',
          anon: true,
        }))
      }
    })
    await staleOrderPage.goto(URL, { waitUntil: 'domcontentloaded' })
    await staleOrderPage.waitForFunction(() => !!document.querySelector('#o-date')?.min)
    assert.equal(await staleOrderPage.locator('#o-date').inputValue(), '', 'прошедшая дата доставки должна сбрасываться')
    assert.equal(await staleOrderPage.locator('#o-addr').inputValue(), 'Сохранённый адрес', 'очистка даты не должна удалять остальные поля заказа')
    assert.equal(await staleOrderPage.locator('#o-anon').isChecked(), true, 'признак анонимной доставки должен сохраняться')
    assert.equal(await staleOrderPage.evaluate(() => JSON.parse(localStorage.getItem('sb-order')).date), '', 'устаревшая дата должна быть удалена из локального черновика')
    await staleOrderPage.evaluate(() => {
      const order = JSON.parse(localStorage.getItem('sb-order'))
      order.date = '2099-02-31'
      localStorage.setItem('sb-order', JSON.stringify(order))
    })
    await staleOrderPage.reload({ waitUntil: 'domcontentloaded' })
    await staleOrderPage.waitForFunction(() => !!document.querySelector('#o-date')?.min)
    assert.equal(await staleOrderPage.locator('#o-date').inputValue(), '', 'несуществующая календарная дата должна сбрасываться')
    await staleOrderContext.close()

    await context.close()
    console.log('CI smoke: главная, адаптивность, корзина, демо-админка и визуальный редактор — OK')
  } finally {
    await browser.close()
  }
})().catch((error) => {
  console.error(error)
  process.exit(1)
})
