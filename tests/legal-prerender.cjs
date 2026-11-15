// Verify that legal pages contain their actual text in the delivered HTML, not only after JavaScript runs.
const fs = require('node:fs')
const path = require('node:path')
const root = path.resolve(process.argv[2] || 'dist')
const pages = [
  ['privacy/', 'Политика обработки персональных данных', 'Яндекс Метрика', 'локальном хранилище браузера', 'не отправляет содержимое корзины на собственный сервер', 'Вебвизора', 'ym-disable-keys', 'при выборе MAX текст копируется в буфер обмена', 'системном окне для ручного копирования'],
  ['oferta/', 'Публичная оферта', 'Оформление и оплата'],
]
let errors = 0
for (const [route, heading, content, ...requiredPhrases] of pages) {
  const file = path.join(root, route, 'index.html')
  if (!fs.existsSync(file)) {
    console.error('✗ ' + route + ': index.html отсутствует')
    errors++
    continue
  }
  const html = fs.readFileSync(file, 'utf8')
  if (!html.includes('data-prerendered')) {
    console.error('✗ ' + route + ': HTML не помечен как пререндеренный')
    errors++
  } else if (!html.includes('<h1') || !html.includes(heading) || !html.includes(content) || requiredPhrases.some((phrase) => !html.includes(phrase))) {
    console.error('✗ ' + route + ': в исходном HTML нет заголовка, текста документа или обязательных разъяснений')
    errors++
  } else {
    console.log('✓ ' + route + ': содержимое доступно в исходном HTML')
  }
}
// The redesigned storefront enables Webvisor after analytics consent. Every free-text/order field must be masked.
const redesignHtml = fs.readFileSync(path.join(__dirname, '..', 'redesign', 'index.html'), 'utf8')
// Order content must never be embedded in a page href; it is built only on the click handler.
const orderButton = redesignHtml.match(/<button\b[^>]*\bid="send-tg"[^>]*>/)
if (!orderButton || /\bhref=/.test(orderButton[0])) {
  console.error('✗ Конфиденциальность: отправка заказа должна быть кнопкой без href')
  errors++
}

const sensitiveFieldIds = ['cf-name', 'cf-phone', 'cf-wish', 'cf-photo', 'o-date', 'o-time', 'o-addr', 'o-note']
for (const id of sensitiveFieldIds) {
  const field = redesignHtml.match(new RegExp(`<(?:input|textarea)\\b[^>]*\\bid="${id}"[^>]*>`))
  if (!field || !/class="[^"]*\bym-disable-keys\b[^"]*"/.test(field[0])) {
    console.error('✗ Webvisor: поле ' + id + ' не защищено классом ym-disable-keys')
    errors++
  }
}
if (errors) process.exit(1)
console.log('Legal prerender tests passed.')
