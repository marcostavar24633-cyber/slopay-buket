// SEO smoke tests for the five public category landing pages.
// Run after `vite build`: node tests/seo-pages.cjs [dist-directory]
const fs = require('node:fs')
const path = require('node:path')
const root = path.resolve(process.argv[2] || 'dist')
const repo = path.resolve(__dirname, '..')
const products = JSON.parse(fs.readFileSync(path.join(repo, 'content/products.json'), 'utf8')).items
const categories = [
  ['berry', 'yagodnye-bukety'],
  ['meat', 'myasnye-bukety'],
  ['sea', 'bukety-iz-rakov'],
  ['dried', 'suhofrukty'],
  ['sweet', 'sladkie-boksy'],
]
let errors = 0
const fail = (message) => { errors++; console.error('✗ ' + message) }
const pass = (message) => console.log('✓ ' + message)

for (const [key, slug] of categories) {
  const file = path.join(root, slug, 'index.html')
  if (!fs.existsSync(file)) {
    fail(slug + ': страница не создана')
    continue
  }
  const html = fs.readFileSync(file, 'utf8')
  const visible = products.filter((p) => p.cat === key && p.show !== false)
  const cards = (html.match(/<article class="product">/g) || []).length
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1]
  const h1 = html.match(/<h1>([^<]+)<\/h1>/)?.[1]
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1]
  const description = html.match(/<meta name="description" content="([^"]+)"/)?.[1]
  const jsonLd = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1]

  if (!title) fail(slug + ': отсутствует title')
  if (!h1) fail(slug + ': отсутствует H1')
  if (!canonical || !canonical.endsWith('/' + slug + '/')) fail(slug + ': некорректный canonical')
  if (!description || description.length < 70) fail(slug + ': отсутствует или слишком короткий meta description')
  if (!jsonLd) fail(slug + ': отсутствует JSON-LD')
  else {
    try {
      const data = JSON.parse(jsonLd)
      if (data['@type'] !== 'CollectionPage') fail(slug + ': неверный тип JSON-LD')
    } catch {
      fail(slug + ': JSON-LD не является корректным JSON')
    }
  }
  if (visible.length === 0) fail(slug + ': в исходных данных нет видимых товаров')
  if (cards !== visible.length) fail(slug + ': карточек ' + cards + ', видимых товаров в JSON ' + visible.length)
  for (const item of visible) {
    if (!item.image || !fs.existsSync(path.join(repo, 'public', item.image.replace(/^\//, '')))) {
      fail(slug + ': отсутствует фото для товара ' + item.id)
    }
    if (!Number.isFinite(Number(item.price)) || Number(item.price) <= 0) {
      fail(slug + ': некорректная цена у товара ' + item.id)
    }
  }
  if (html.includes('Скоро добавим работы этой категории')) fail(slug + ': вместо каталога показана заглушка')
  if (!errors) pass(slug + ': SEO, JSON-LD и ' + cards + ' карточек')
}

const sitemapFile = path.join(root, 'sitemap.xml')
const robotsFile = path.join(root, 'robots.txt')
if (!fs.existsSync(sitemapFile)) fail('sitemap.xml не создан')
else {
  const sitemap = fs.readFileSync(sitemapFile, 'utf8')
  for (const [, slug] of categories) if (!sitemap.includes('/' + slug + '/')) fail('sitemap.xml: нет ' + slug)
  if (!sitemap.includes('<urlset')) fail('sitemap.xml: некорректная структура')
  if (!errors) pass('sitemap.xml содержит все пять категорий')
}
if (!fs.existsSync(robotsFile)) fail('robots.txt не создан')
else if (!fs.readFileSync(robotsFile, 'utf8').includes('sitemap.xml')) fail('robots.txt не ссылается на sitemap.xml')
else if (!errors) pass('robots.txt ссылается на sitemap.xml')

if (errors) process.exit(1)
console.log('SEO smoke tests passed.')
