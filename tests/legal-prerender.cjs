// Verify that legal pages contain their actual text in the delivered HTML, not only after JavaScript runs.
const fs = require('node:fs')
const path = require('node:path')
const root = path.resolve(process.argv[2] || 'dist')
const pages = [
  ['privacy/', 'Политика обработки персональных данных', 'Яндекс Метрика', 'локальном хранилище браузера', 'не отправляет содержимое корзины на собственный сервер'],
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
if (errors) process.exit(1)
console.log('Legal prerender tests passed.')
