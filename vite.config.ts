import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'

/**
 * Адрес сайта: переменная окружения SITE_URL (её задаёт сборка для GitHub Pages),
 * иначе — SITE.url из src/lib/config.ts.
 */
const SITE_URL = (
  process.env.SITE_URL ||
  (fs.readFileSync(path.resolve(__dirname, 'src/lib/config.ts'), 'utf8').match(/url:\s*'([^']+)'/)?.[1] ?? 'https://example.ru')
).replace(/\/$/, '')

/** Папки и файлы из public/, на которые код ссылается от корня: '/img/…', '/video/…' и т. п. */
const PUBLIC_ROOTS = 'img|video|logo-256\\.webp|favicon-64\\.png|apple-touch-icon\\.png|og-image\\.jpg|corporate-catalog\\.pdf|privacy/|oferta/|corporate/'

/**
 * Сайт может жить не в корне домена (GitHub Pages: /slopay-buket/).
 * Плагин дописывает base к путям '/img/…' в коде и в HTML, чтобы ничего не переписывать руками.
 */
function basePaths(): Plugin {
  let base = '/'
  // после кавычки/скобки или после «, » внутри srcset
  const re = new RegExp(`(["'\`(]|, )/(?=(${PUBLIC_ROOTS}))`, 'g')
  const fix = (code: string) => (base === '/' ? code : code.replace(re, `$1${base}`))
  return {
    name: 'slopay-base-paths',
    configResolved: (c) => void (base = c.base),
    transform: (code, id) => (/\/src\/.+\.(tsx?|jsx?)$/.test(id) ? { code: fix(code), map: null } : null),
    transformIndexHtml: { order: 'post', handler: (html) => fix(html).replace(/href:"\/"|href="\/"/g, (m) => m.replace('/', base)) },
  }
}

/** Разметка Schema.org для главной — из данных админки: контакты, рейтинг, цены, хиты. Всегда совпадает с тем, что на странице. */
function ldJson() {
  const read = (f: string) => JSON.parse(fs.readFileSync(path.resolve(__dirname, 'content', f), 'utf8'))
  const site = read('site.json')
  const items = (read('products.json').items as { id: string; name: string; desc: string; price: number; image: string; show?: boolean; hit?: boolean; hitOrder?: number }[]).filter((p) => p.show !== false)
  const prices = items.map((p) => Number(p.price)).filter(Boolean)
  const digits = String(site.phone).replace(/\D/g, '').replace(/^8/, '7')
  const hours = /(\d{1,2}):(\d{2})\D+(\d{1,2}):(\d{2})/.exec(site.hours)
  const hits = items.filter((p) => p.hit).sort((a, b) => (a.hitOrder ?? 99) - (b.hitOrder ?? 99))
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Florist',
    '@id': `${SITE_URL}/#org`,
    name: site.brand,
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}/logo-256.webp`,
    image: `${SITE_URL}/og-image.jpg`,
    description: `Съедобные букеты с доставкой в городе ${site.city}`,
    telephone: `+${digits}`,
    ...(site.email ? { email: site.email } : {}),
    priceRange: prices.length ? `${Math.min(...prices)}–${Math.max(...prices)} ₽` : undefined,
    currenciesAccepted: 'RUB',
    address: { '@type': 'PostalAddress', streetAddress: String(site.address).split(',').slice(0, 2).join(',').trim(), addressLocality: site.city, addressCountry: 'RU' },
    areaServed: { '@type': 'City', name: site.city },
    ...(hours ? { openingHoursSpecification: { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: `${hours[1].padStart(2, '0')}:${hours[2]}`, closes: `${hours[3]}:${hours[4]}` } } : {}),
    sameAs: [site.reviewsUrl, site.vk].filter(Boolean),
    aggregateRating: { '@type': 'AggregateRating', ratingValue: String(site.rating).replace(',', '.'), bestRating: '5', ratingCount: String(site.reviewsCount) },
    ...(site.ownerName ? { founder: { '@type': 'Person', name: site.ownerName }, ...(site.inn ? { taxID: site.inn } : {}) } : {}),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Хиты продаж',
      itemListElement: hits.map((p) => ({
        '@type': 'Offer',
        price: String(p.price),
        priceCurrency: 'RUB',
        url: `${SITE_URL}/#hits`,
        itemOffered: { '@type': 'Product', name: p.name, description: p.desc, image: SITE_URL + p.image },
      })),
    },
  }).replace(/</g, '\\u003c')
}

/** Дата последнего изменения сайта (последний коммит) — для sitemap.xml; не меняется от ежедневной пересборки. */
function lastChange() {
  try {
    return execSync('git log -1 --format=%cs', { cwd: __dirname }).toString().trim() || new Date().toISOString().slice(0, 10)
  } catch {
    return new Date().toISOString().slice(0, 10)
  }
}

/** Подставляет абсолютный адрес в мета-теги и кладёт в сборку robots.txt и sitemap.xml. */
function seo(): Plugin {
  let base = '/'
  return {
    name: 'slopay-seo',
    transformIndexHtml: (html, ctx) => {
      let out = html.replaceAll('%SITE_URL%', SITE_URL).replace('%LD_JSON%', () => ldJson())
      // название и описание главной — из админки (content/site.json)
      if (ctx.path === '/index.html') {
        const site = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'content/site.json'), 'utf8'))
        const esc = (t: string) => String(t).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
        if (site.seoTitle) out = out.replace(/<title>[^<]*<\/title>/, `<title>${esc(site.seoTitle)}</title>`)
        if (site.seoDescription) out = out.replace(/(<meta name="description" content=")[^"]*(")/, `$1${esc(site.seoDescription)}$2`)
        if (site.brand) out = out.replace(/(<meta property="og:site_name" content=")[^"]*(")/, `$1${esc(site.brand)}$2`)
      }
      // ранняя загрузка шрифтов (PRELOAD_FONTS=1). По замерам на мобильном 4G она отнимает канал у главного фото, поэтому выключена
      const fonts = Object.keys(ctx.bundle ?? {}).filter((f) => /(manrope-cyrillic-wght-normal|playfair-display-cyrillic-wght-(normal|italic))-.*\.woff2$/.test(f))
      if (fonts.length && process.env.PRELOAD_FONTS) out = out.replace('</head>', fonts.map((f) => `  <link rel="preload" as="font" type="font/woff2" crossorigin href="${base}${f}" />\n`).join('') + '  </head>')
      return out
    },
    configResolved: (c) => void (base = c.base),
    generateBundle() {
      const today = lastChange()
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `User-agent: *\nAllow: /\n# служебные параметры: режим правки и вариант заголовка — не отдельные страницы\nClean-param: edit&h /\n\nSitemap: ${SITE_URL}/sitemap.xml\n` })
      // Категорийные SEO-страницы формируются из реального каталога content/products.json.
      const categoryDefs = [{"key":"berry","slug":"yagodnye-bukety","title":"Ягодные букеты в Ульяновске — заказать с доставкой","h1":"Ягодные букеты с доставкой в Ульяновске","desc":"Ягодный букет — яркий и вкусный подарок, который сочетает красоту цветочной композиции и свежесть фруктов и ягод. В мастерской «Слопай букет» можно выбрать готовую работу из каталога или обсудить индивидуальный вариант к нужной дате. В композициях используются ягоды и фрукты, а оформление подбирается так, чтобы подарок выглядел празднично и аккуратно. В каталоге представлены букеты и корзины с клубникой, ягодные композиции с цветами, а также варианты с дополнительными сладостями. Такой подарок подойдёт для дня рождения, свидания, годовщины, благодарности или просто приятного сюрприза без особого повода. Выберите понравившуюся работу, посмотрите описание и актуальную стоимость, а затем свяжитесь с мастерской для уточнения наличия и даты. Состав и внешний вид сезонных композиций могут зависеть от доступности свежих ингредиентов. Доставка осуществляется по Ульяновску; условия и возможность доставки к определённому времени лучше согласовать при оформлении заказа. Если хочется изменить цвет упаковки, добавить открытку или собрать композицию под конкретный бюджет, напишите нам — обсудим доступные варианты. При выборе подарка учитывайте, что ягоды — свежий продукт, поэтому дату и детали заказа лучше согласовать заранее.","shortDesc":"Ягодные букеты с клубникой, ягодами и цветами. Выберите композицию и уточните наличие и доставку."},{"key":"meat","slug":"myasnye-bukety","title":"Мясные букеты в Ульяновске — заказать с доставкой","h1":"Мясные букеты и мужские наборы в Ульяновске","desc":"Мясной букет — оригинальный съедобный подарок для тех, кто любит сытные закуски и необычную подачу. В «Слопай букет» собраны композиции с колбасами, сырами, мясными деликатесами, томатами, орехами и другими закусками — точный состав каждой работы указан в её карточке. Такой подарок можно выбрать на день рождения, 23 Февраля, юбилей, корпоративный праздник или дружескую встречу. Вместо привычного букета получатель увидит эффектную композицию, которую можно разделить за праздничным столом. В каталоге есть лаконичные варианты и более крупные наборы на подносе или в декоративной упаковке. Выберите подходящий вариант по составу и стоимости, а затем уточните у мастерской наличие на нужную дату. По запросу можно обсудить индивидуальную комплектацию и оформление, если необходимые продукты доступны. Мы работаем в Ульяновске и помогаем согласовать удобный способ получения заказа. Обратите внимание: состав, вес и оформление конкретной композиции могут отличаться, поэтому перед заказом ориентируйтесь на описание выбранного товара и подтвердите детали в переписке. Напишите нам, чтобы уточнить сроки изготовления и условия доставки. Для сохранения аккуратного вида съедобного подарка рекомендуем заранее обсудить дату вручения и условия перевозки.","shortDesc":"Сытные букеты с колбасами, сырами и закусками. Состав каждого набора указан в карточке товара."},{"key":"sea","slug":"bukety-iz-rakov","title":"Букеты из раков в Ульяновске — заказать с доставкой","h1":"Букеты из раков в Ульяновске","desc":"Букет из раков — необычный гастрономический подарок для любителей морепродуктов и ярких впечатлений. В каталоге «Слопай букет» представлены композиции с раками, лимоном, зеленью и другими дополнениями; в отдельных вариантах могут встречаться креветки и закуски. Состав каждой модели указан в карточке товара, поэтому можно заранее оценить, какой вариант подойдёт получателю и формату праздника. Такой букет выбирают на день рождения, мужской праздник, юбилей, встречу друзей или в качестве оригинального сюрприза. Композиция оформляется как подарок и одновременно становится частью праздничного стола. Выберите понравившийся вариант и свяжитесь с мастерской, чтобы уточнить наличие, свежесть ингредиентов и возможность изготовления к нужному времени. Количество раков и дополнительные продукты зависят от конкретной модели и согласованного заказа — не ориентируйтесь только на фотографию, уточните детали перед оплатой. «Слопай букет» работает в Ульяновске; доставку и удобное время получения согласуем индивидуально. Если хотите изменить состав или добавить тематическое оформление, напишите нам: обсудим, какие изменения можно выполнить с учётом доступности продуктов и сроков подготовки. Для такого подарка особенно важно согласовать время получения: уточните у мастерской, когда композицию лучше забрать или доставить.","shortDesc":"Подарочные композиции с раками и дополнениями. Уточните состав, наличие и удобное время доставки."},{"key":"dried","slug":"suhofrukty","title":"Букеты из сухофруктов и орехов в Ульяновске","h1":"Букеты из сухофруктов и орехов","desc":"Букеты и подарочные коробки из сухофруктов и орехов — красивый вариант для тех, кто ценит необычные съедобные подарки. В мастерской «Слопай букет» есть композиции с сухофруктами, орехами, сушёными цитрусами и сладкими дополнениями. В зависимости от модели набор может быть оформлен в коробке, корзине или в виде букета. Такой подарок подойдёт для семейного праздника, дня рождения, поздравления коллеги, благодарности учителю или небольшого знака внимания. В карточках каталога указаны названия, состав и стоимость представленных работ: сравните варианты и выберите подходящий по наполнению и бюджету. Если нужен особенный подарок, можно обсудить индивидуальное оформление и пожелания к составу. Перед заказом уточните доступность конкретных ингредиентов, размер композиции и дату изготовления — некоторые продукты и декоративные элементы могут быть сезонными. Доставка доступна по Ульяновску, подробности и время лучше согласовать заранее. Напишите в мастерскую, чтобы получить консультацию и подтвердить заказ. Мы поможем подобрать композицию под повод и расскажем, какие варианты доступны на нужную дату. Чтобы подарок соответствовал ожиданиям, заранее уточните состав, упаковку и возможные сезонные замены ингредиентов.","shortDesc":"Подарочные наборы из сухофруктов и орехов. Сравните состав и стоимость, уточните наличие."},{"key":"sweet","slug":"sladkie-boksy","title":"Сладкие боксы и подарочные наборы в Ульяновске","h1":"Сладкие боксы и подарочные наборы","desc":"Сладкий бокс — универсальный подарок, который легко подобрать для ребёнка, близкого человека, коллеги или учителя. В каталоге «Слопай букет» собраны подарочные композиции с конфетами, шоколадом, печеньем, пряниками, безе и другими сладостями. Наполнение зависит от конкретной модели: в карточке товара можно посмотреть описание и стоимость, чтобы выбрать подходящий вариант. Сладкие наборы дарят на день рождения, Новый год, 1 сентября, День учителя, семейные праздники и просто без повода. Разные формы коробок и оформление помогают сделать подарок тематическим и запоминающимся. Выберите готовую композицию или напишите нам, если хотите обсудить индивидуальный набор под определённый бюджет, возраст получателя или событие. Возможность замены сладостей и декоративных элементов зависит от наличия продуктов и сроков подготовки. Перед оформлением заказа уточните актуальность цены, состав и дату изготовления. Мастерская находится в Ульяновске; условия доставки и удобное время получения согласуем при обращении. Свяжитесь с нами в мессенджере — поможем подобрать сладкий подарок и ответим на вопросы по выбранной модели. Если набор предназначен для конкретного праздника, сообщите дату и пожелания заранее — так проще согласовать подходящее оформление.","shortDesc":"Сладкие боксы с конфетами, шоколадом и другими сладостями. Выберите набор и уточните состав."}]
      const products = (JSON.parse(fs.readFileSync(path.resolve(__dirname, 'content/products.json'), 'utf8')).items as any[]).filter((p) => p.show !== false)
      const siteData = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'content/site.json'), 'utf8'))
      const nav = categoryDefs.map((c: any) => {
        const label = c.key === 'berry' ? 'Ягодные' : c.key === 'meat' ? 'Мясные' : c.key === 'sea' ? 'Из раков' : c.key === 'dried' ? 'Сухофрукты' : 'Сладкие боксы'
        return `<a href="${base}${c.slug}/">${label}</a>`
      }).join('')
      const escapeHtml = (v: unknown) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
      for (const c of categoryDefs) {
        const group = products.filter((p: any) => p.cat === c.key)
        const cards = group.map((p: any) => {
          const image = `${base}${String(p.image).replace(/^\//, '')}`
          return `<article class="product">
            <a class="photo" href="${escapeHtml(image)}" aria-label="Посмотреть фото: ${escapeHtml(p.name)}"><img src="${escapeHtml(image)}" alt="${escapeHtml(p.name)} — ${escapeHtml(p.desc)}" loading="lazy" decoding="async" width="640" height="640"></a>
            <div class="pad"><p class="eyebrow">Работа мастерской</p><h2>${escapeHtml(p.name)}</h2><p class="desc">${escapeHtml(p.desc)}</p>
              <div class="buy"><strong>${Number(p.price).toLocaleString('ru-RU')} ₽</strong><a class="order" href="${escapeHtml(siteData.maxUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Уточнить наличие: ${escapeHtml(p.name)}">Уточнить наличие</a></div>
            </div>
          </article>`
        }).join('')
        const ld = JSON.stringify({ '@context': 'https://schema.org', '@type': 'CollectionPage', name: c.title, description: c.desc, url: `${SITE_URL}/${c.slug}/`, breadcrumb: { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Главная', item: `${SITE_URL}/` }, { '@type': 'ListItem', position: 2, name: c.h1, item: `${SITE_URL}/${c.slug}/` }] }, mainEntity: { '@type': 'ItemList', itemListElement: group.map((p: any, i: number) => ({ '@type': 'ListItem', position: i + 1, item: { '@type': 'Product', name: p.name, description: p.desc, image: `${SITE_URL}${p.image}`, offers: { '@type': 'Offer', priceCurrency: 'RUB', price: Number(p.price) } } })) } }).replace(/</g, '\\u003c')
        const introSentences = c.shortDesc.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [c.shortDesc]
        const introHtml = Array.from({ length: Math.ceil(introSentences.length / 3) }, (_, i) =>
          `<p>${escapeHtml(introSentences.slice(i * 3, i * 3 + 3).join(' ').trim())}</p>`
        ).join('')
        const description = escapeHtml(c.desc.slice(0, 155))
        const page = `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#0a0908"><title>${escapeHtml(c.title)}</title><meta name="description" content="${description}"><link rel="canonical" href="${SITE_URL}/${c.slug}/"><meta property="og:title" content="${escapeHtml(c.title)}"><meta property="og:description" content="${description}"><meta property="og:type" content="website"><meta property="og:locale" content="ru_RU"><meta property="og:url" content="${SITE_URL}/${c.slug}/"><meta property="og:image" content="${SITE_URL}/og-image.jpg"><meta property="og:image:alt" content="Съедобные букеты мастерской «Слопай букет»"><meta name="twitter:card" content="summary_large_image"><script type="application/ld+json">${ld}</script><style>
          :root{color-scheme:dark;--ink:#f4ecdc;--muted:#cbbfa8;--gold:#d4af37;--gold-light:#ebcb6e;--cream:#0a0908;--paper:#17140f;--line:rgb(212 175 55 / .2);--panel:#12100c}
          *{box-sizing:border-box}html{scroll-behavior:smooth;scroll-padding-top:84px}body{margin:0;background:radial-gradient(ellipse at 75% 0%,rgb(212 175 55 / .09),transparent 36%),var(--cream);color:var(--ink);font:16px/1.65 Manrope,Arial,sans-serif}
          a{color:inherit}.wrap{max-width:1240px;margin:auto;padding:0 32px}.top{position:sticky;top:0;z-index:40;display:flex;align-items:center;justify-content:space-between;gap:18px;padding:14px 0;border-bottom:1px solid var(--line);background:rgb(10 9 8 / .92);backdrop-filter:blur(18px)}.brand{font-family:Georgia,serif;font-weight:800;font-size:22px;font-style:italic;text-decoration:none;white-space:nowrap;letter-spacing:-.03em}.nav{display:flex;gap:7px 16px;flex-wrap:wrap}.nav a{font-size:13px;font-weight:700;color:var(--muted);text-decoration:none;transition:color .2s}.nav a:hover,.crumb a:hover{color:var(--gold-light)}
          .crumb{color:var(--muted);font-size:12px;margin:24px 0 12px}.crumb a{color:var(--muted)}.hero{position:relative;overflow:hidden;padding:22px 0 34px;border-bottom:1px solid var(--line)}.hero:after{content:"";position:absolute;z-index:-1;right:-100px;top:-160px;width:440px;height:440px;border-radius:50%;background:rgb(212 175 55 / .12);filter:blur(100px)}.kicker{color:var(--gold-light);font-size:11px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;margin:0 0 10px}h1{max-width:850px;font-family:Georgia,serif;font-size:clamp(34px,5.2vw,58px);font-weight:600;line-height:1.06;letter-spacing:-.035em;margin:0 0 14px}.intro{max-width:660px;color:var(--muted);font-size:15px;line-height:1.7}.intro p{margin:0}.hero-actions{display:flex;gap:12px;flex-wrap:wrap;margin:20px 0 0}.cta,.order{display:inline-flex;align-items:center;justify-content:center;border-radius:999px;background:linear-gradient(135deg,#f7e2a1 0%,#d4af37 48%,#b38a24 100%);color:#0a0908;text-decoration:none;font-weight:900;transition:filter .2s,transform .2s,box-shadow .2s;box-shadow:0 8px 26px rgb(212 175 55 / .16)}.cta{padding:13px 23px}.cta:hover,.order:hover{filter:brightness(1.1);transform:translateY(-2px);box-shadow:0 12px 30px rgb(212 175 55 / .24)}.phone{align-self:center;color:var(--ink);font-weight:800;text-decoration:none}
          .catalog-head{display:flex;align-items:end;justify-content:space-between;gap:16px;margin:34px 0 18px}.catalog-head h2{font:600 clamp(25px,3vw,36px)/1.2 Georgia,serif;margin:0;letter-spacing:-.02em}.catalog-head p{color:var(--muted);font-size:13px;margin:0}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px;margin:20px 0 42px}.product{display:flex;flex-direction:column;overflow:hidden;border:1px solid var(--line);border-radius:24px;background:linear-gradient(160deg,#1d1913,#100e0b);box-shadow:0 14px 40px rgb(0 0 0 / .35);min-width:0;transition:transform .25s,border-color .25s,box-shadow .25s}.product:hover{transform:translateY(-4px);border-color:rgb(212 175 55 / .48);box-shadow:0 22px 50px rgb(0 0 0 / .45)}.photo{display:block;overflow:hidden;background:#17140f;aspect-ratio:1}.photo img{display:block;width:100%;height:100%;object-fit:cover;transition:transform .5s}.product:hover .photo img{transform:scale(1.04)}.pad{display:flex;flex:1;flex-direction:column;padding:19px}.eyebrow{margin:0 0 6px;color:var(--gold-light);font-size:10px;font-weight:900;letter-spacing:.14em;text-transform:uppercase}.pad h2{font:600 22px/1.2 Georgia,serif;margin:0 0 9px}.desc{color:var(--muted);font-size:13px;line-height:1.6;margin:0 0 18px}.buy{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:auto}.buy strong{font-size:21px;white-space:nowrap;color:var(--ink)}.order{padding:11px 15px;font-size:12px;white-space:nowrap}
          .empty{padding:26px;border:1px dashed var(--line);border-radius:18px;color:var(--muted)}.bottom-cta{display:flex;align-items:center;justify-content:space-between;gap:24px;padding:30px;border:1px solid rgb(212 175 55 / .3);border-radius:26px;background:radial-gradient(ellipse at 90% 0%,rgb(212 175 55 / .15),transparent 48%),linear-gradient(135deg,#201a10,#100e0b);color:var(--ink);margin:8px 0 48px;box-shadow:0 18px 50px rgb(0 0 0 / .28)}.bottom-cta h2{font:600 28px/1.2 Georgia,serif;margin:0 0 6px}.bottom-cta p{color:var(--muted);margin:0;font-size:14px}.bottom-cta .cta{flex-shrink:0}.foot{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;border-top:1px solid var(--line);padding:22px 0 34px;color:var(--muted);font-size:13px}.foot a{color:var(--ink);font-weight:700}
          @media(max-width:850px){.grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.top{align-items:flex-start;flex-direction:column}.nav{gap:6px 14px}.catalog-head{align-items:flex-start;flex-direction:column}}
          @media(max-width:560px){.wrap{padding:0 16px}.top{padding:12px 0;gap:8px}.brand{font-size:19px}.nav{gap:6px 12px}.nav a{font-size:11px}.crumb{margin-top:18px}.hero{padding:14px 0 26px}.kicker{font-size:10px}h1{font-size:34px;line-height:1.08;margin-bottom:10px}.intro{font-size:14px;line-height:1.6}.hero-actions{gap:9px;margin-top:16px}.cta{padding:12px 18px;font-size:13px}.grid{grid-template-columns:minmax(0,1fr);gap:14px;margin-top:16px}.product{border-radius:20px}.photo{aspect-ratio:1.12}.pad{padding:16px}.pad h2{font-size:20px}.desc{font-size:13px;line-height:1.5;margin-bottom:14px}.buy{align-items:center;flex-direction:row;gap:10px}.buy strong{font-size:20px}.order{width:auto;padding:11px 14px;font-size:12px}.catalog-head{margin-top:26px}.bottom-cta{align-items:flex-start;flex-direction:column;padding:22px;margin-bottom:30px;border-radius:22px}.bottom-cta h2{font-size:24px}}
          @media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}*,*::before,*::after{transition:none!important}}
        </style></head><body><div class="wrap"><header class="top"><a class="brand" href="${base}">Слопай букет <span style="color:var(--gold)">·</span></a><nav class="nav" aria-label="Категории">${nav}<a href="${base}corporate/">Компаниям</a></nav></header>
        <main><p class="crumb"><a href="${base}">Главная</a> / ${escapeHtml(c.h1)}</p><section class="hero"><p class="kicker">Съедобные подарки · Ульяновск</p><h1>${escapeHtml(c.h1)}</h1><div class="hero-actions"><a class="cta" href="${escapeHtml(siteData.maxUrl)}" target="_blank" rel="noopener noreferrer">Подобрать и заказать</a><a class="phone" href="tel:${String(siteData.phone).replace(/[^+\d]/g, '')}">${escapeHtml(siteData.phone)}</a></div><div class="intro">${introHtml}</div></section>
        <section aria-labelledby="catalog-title"><div class="catalog-head"><h2 id="catalog-title">Работы категории</h2><p>${group.length} ${group.length === 1 ? 'вариант' : group.length > 1 && group.length < 5 ? 'варианта' : 'вариантов'} · цены указаны в рублях</p></div><div class="grid">${cards || '<p class="empty">Скоро добавим работы этой категории. Напишите нам, чтобы уточнить доступные варианты.</p>'}</div></section>
        <section class="bottom-cta"><div><h2>Поможем выбрать подарок</h2><p>Расскажите, кому и к какой дате нужен букет — обсудим подходящие варианты.</p></div><a class="cta" href="${escapeHtml(siteData.maxUrl)}" target="_blank" rel="noopener noreferrer">Написать в MAX</a></section></main>
        <footer class="foot"><span>© «Слопай букет» · Ульяновск</span><span><a href="tel:${String(siteData.phone).replace(/[^+\d]/g, '')}">${escapeHtml(siteData.phone)}</a> · <a href="${base}">На главную</a></span></footer></div></body></html>`
        this.emitFile({ type: 'asset', fileName: `${c.slug}/index.html`, source: page })
      }
      // оферта и политика закрыты от индексации (noindex) — в карту сайта не включаем
      const urls = [`${SITE_URL}/`, `${SITE_URL}/corporate/`, ...categoryDefs.map((c: any) => `${SITE_URL}/${c.slug}/`)]
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
          .map((u, i) => `  <url><loc>${u}</loc><lastmod>${today}</lastmod><priority>${i ? '0.8' : '1.0'}</priority></url>`)
          .join('\n')}\n</urlset>\n`,
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), seo(), basePaths()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        privacy: path.resolve(__dirname, 'privacy/index.html'),
        oferta: path.resolve(__dirname, 'oferta/index.html'),
        corporate: path.resolve(__dirname, 'corporate/index.html'),
        admin: path.resolve(__dirname, 'admin/index.html'),
      },
      output: {
        // библиотеки отдельно: кэшируются браузером между обновлениями сайта
        manualChunks: { react: ['react', 'react-dom'], motion: ['motion/react'] },
      },
    },
  },
})
