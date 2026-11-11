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
        availability: 'https://schema.org/InStock',
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
      const categoryDefs = [{"key":"berry","slug":"yagodnye-bukety","title":"Ягодные букеты в Ульяновске — заказать с доставкой","h1":"Ягодные букеты с доставкой в Ульяновске","desc":"Ягодный букет — яркий и вкусный подарок, который сочетает красоту цветочной композиции и свежесть фруктов и ягод. В мастерской «Слопай букет» можно выбрать готовую работу из каталога или обсудить индивидуальный вариант к нужной дате. В композициях используются ягоды и фрукты, а оформление подбирается так, чтобы подарок выглядел празднично и аккуратно. В каталоге представлены букеты и корзины с клубникой, ягодные композиции с цветами, а также варианты с дополнительными сладостями. Такой подарок подойдёт для дня рождения, свидания, годовщины, благодарности или просто приятного сюрприза без особого повода. Выберите понравившуюся работу, посмотрите описание и актуальную стоимость, а затем свяжитесь с мастерской для уточнения наличия и даты. Состав и внешний вид сезонных композиций могут зависеть от доступности свежих ингредиентов. Доставка осуществляется по Ульяновску; условия и возможность доставки к определённому времени лучше согласовать при оформлении заказа. Если хочется изменить цвет упаковки, добавить открытку или собрать композицию под конкретный бюджет, напишите нам — обсудим доступные варианты."},{"key":"meat","slug":"myasnye-bukety","title":"Мясные букеты в Ульяновске — заказать с доставкой","h1":"Мясные букеты и мужские наборы в Ульяновске","desc":"Мясной букет — оригинальный съедобный подарок для тех, кто любит сытные закуски и необычную подачу. В «Слопай букет» собраны композиции с колбасами, сырами, мясными деликатесами, томатами, орехами и другими закусками — точный состав каждой работы указан в её карточке. Такой подарок можно выбрать на день рождения, 23 Февраля, юбилей, корпоративный праздник или дружескую встречу. Вместо привычного букета получатель увидит эффектную композицию, которую можно разделить за праздничным столом. В каталоге есть лаконичные варианты и более крупные наборы на подносе или в декоративной упаковке. Выберите подходящий вариант по составу и стоимости, а затем уточните у мастерской наличие на нужную дату. По запросу можно обсудить индивидуальную комплектацию и оформление, если необходимые продукты доступны. Мы работаем в Ульяновске и помогаем согласовать удобный способ получения заказа. Обратите внимание: состав, вес и оформление конкретной композиции могут отличаться, поэтому перед заказом ориентируйтесь на описание выбранного товара и подтвердите детали в переписке. Напишите нам, чтобы уточнить сроки изготовления и условия доставки."},{"key":"sea","slug":"bukety-iz-rakov","title":"Букеты из раков в Ульяновске — заказать с доставкой","h1":"Букеты из раков в Ульяновске","desc":"Букет из раков — необычный гастрономический подарок для любителей морепродуктов и ярких впечатлений. В каталоге «Слопай букет» представлены композиции с раками, лимоном, зеленью и другими дополнениями; в отдельных вариантах могут встречаться креветки и закуски. Состав каждой модели указан в карточке товара, поэтому можно заранее оценить, какой вариант подойдёт получателю и формату праздника. Такой букет выбирают на день рождения, мужской праздник, юбилей, встречу друзей или в качестве оригинального сюрприза. Композиция оформляется как подарок и одновременно становится частью праздничного стола. Выберите понравившийся вариант и свяжитесь с мастерской, чтобы уточнить наличие, свежесть ингредиентов и возможность изготовления к нужному времени. Количество раков и дополнительные продукты зависят от конкретной модели и согласованного заказа — не ориентируйтесь только на фотографию, уточните детали перед оплатой. «Слопай букет» работает в Ульяновске; доставку и удобное время получения согласуем индивидуально. Если хотите изменить состав или добавить тематическое оформление, напишите нам: обсудим, какие изменения можно выполнить с учётом доступности продуктов и сроков подготовки."},{"key":"dried","slug":"suhofrukty","title":"Букеты из сухофруктов и орехов в Ульяновске","h1":"Букеты из сухофруктов и орехов","desc":"Букеты и подарочные коробки из сухофруктов и орехов — красивый вариант для тех, кто ценит необычные съедобные подарки. В мастерской «Слопай букет» есть композиции с сухофруктами, орехами, сушёными цитрусами и сладкими дополнениями. В зависимости от модели набор может быть оформлен в коробке, корзине или в виде букета. Такой подарок подойдёт для семейного праздника, дня рождения, поздравления коллеги, благодарности учителю или небольшого знака внимания. В карточках каталога указаны названия, состав и стоимость представленных работ: сравните варианты и выберите подходящий по наполнению и бюджету. Если нужен особенный подарок, можно обсудить индивидуальное оформление и пожелания к составу. Перед заказом уточните доступность конкретных ингредиентов, размер композиции и дату изготовления — некоторые продукты и декоративные элементы могут быть сезонными. Доставка доступна по Ульяновску, подробности и время лучше согласовать заранее. Напишите в мастерскую, чтобы получить консультацию и подтвердить заказ. Мы поможем подобрать композицию под повод и расскажем, какие варианты доступны на нужную дату."},{"key":"sweet","slug":"sladkie-boksy","title":"Сладкие боксы и подарочные наборы в Ульяновске","h1":"Сладкие боксы и подарочные наборы","desc":"Сладкий бокс — универсальный подарок, который легко подобрать для ребёнка, близкого человека, коллеги или учителя. В каталоге «Слопай букет» собраны подарочные композиции с конфетами, шоколадом, печеньем, пряниками, безе и другими сладостями. Наполнение зависит от конкретной модели: в карточке товара можно посмотреть описание и стоимость, чтобы выбрать подходящий вариант. Сладкие наборы дарят на день рождения, Новый год, 1 сентября, День учителя, семейные праздники и просто без повода. Разные формы коробок и оформление помогают сделать подарок тематическим и запоминающимся. Выберите готовую композицию или напишите нам, если хотите обсудить индивидуальный набор под определённый бюджет, возраст получателя или событие. Возможность замены сладостей и декоративных элементов зависит от наличия продуктов и сроков подготовки. Перед оформлением заказа уточните актуальность цены, состав и дату изготовления. Мастерская находится в Ульяновске; условия доставки и удобное время получения согласуем при обращении. Свяжитесь с нами в мессенджере — поможем подобрать сладкий подарок и ответим на вопросы по выбранной модели."}]
      const products = (JSON.parse(fs.readFileSync(path.resolve(__dirname, 'content/products.json'), 'utf8')).items as any[]).filter((p) => p.show !== false)
      const nav = categoryDefs.map((c: any) => `<a href="${base}${c.slug}/">${c.key === 'berry' ? 'Ягодные' : c.key === 'meat' ? 'Мясные' : c.key === 'sea' ? 'Из раков' : c.key === 'dried' ? 'Сухофрукты' : 'Сладкие боксы'}</a>`).join(' · ')
      const escapeHtml = (v: unknown) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
      for (const c of categoryDefs) {
        const group = products.filter((p: any) => p.cat === c.key)
        const cards = group.map((p: any) => `<article class="product"><img src="${base}${String(p.image).replace(/^\\//, '')}" alt="${escapeHtml(p.name)}" loading="lazy"><div class="pad"><h2>${escapeHtml(p.name)}</h2><p>${escapeHtml(p.desc)}</p><strong>${Number(p.price).toLocaleString('ru-RU')} ₽</strong></div></article>`).join('')
        const page = `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(c.title)}</title><meta name="description" content="${escapeHtml(c.desc.slice(0, 155))}"><link rel="canonical" href="${SITE_URL}/${c.slug}/"><meta property="og:title" content="${escapeHtml(c.title)}"><meta property="og:description" content="${escapeHtml(c.desc.slice(0, 155))}"><meta property="og:type" content="website"><style>*{box-sizing:border-box}body{margin:0;background:#100e0b;color:#f8f0df;font:16px/1.65 Arial,sans-serif}a{color:#e8c96f}.wrap{max-width:1160px;margin:auto;padding:24px}.top{display:flex;gap:14px;flex-wrap:wrap;padding:12px 0;border-bottom:1px solid #51452b}.top a{text-decoration:none}.crumb{color:#c9bfae;font-size:14px;margin:28px 0 8px}h1{font-size:clamp(30px,5vw,52px);line-height:1.1;margin:10px 0 22px;color:#f4d98b}.intro{max-width:850px;color:#e3d9c7}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:18px;margin:32px 0}.product{background:#211d17;border:1px solid #55472b;border-radius:16px;overflow:hidden}.product img{width:100%;height:260px;object-fit:cover;display:block}.pad{padding:16px}.pad h2{font-size:19px;margin:0 0 8px}.pad p{color:#cfc4b2;min-height:60px}.pad strong{font-size:20px;color:#f4d98b}.cta{display:inline-block;padding:13px 20px;border-radius:30px;background:#d4af37;color:#17130b;text-decoration:none;font-weight:bold;margin:12px 0 36px}.foot{border-top:1px solid #51452b;padding:20px 0;color:#bfb4a2}</style></head><body><div class="wrap"><nav class="top"><a href="${base}">Слопай букет</a><span>${nav}</span></nav><p class="crumb"><a href="${base}">Главная</a> / ${escapeHtml(c.h1)}</p><h1>${escapeHtml(c.h1)}</h1><div class="intro"><p>${escapeHtml(c.desc)}</p></div><h2>Работы категории</h2><div class="grid">${cards || '<p>Скоро добавим работы этой категории. Напишите нам, чтобы уточнить варианты.</p>'}</div><a class="cta" href="https://max.ru/u/f9LHodD0cOIE-osl7ttL5eRn4vgUkh_e5h3PmiZSsO1SgIH36TnP4Afv9sI" rel="noopener">Уточнить наличие и заказать</a><footer class="foot">«Слопай букет» · Ульяновск · <a href="tel:+79631282556">+7 (963) 128-25-56</a> · <a href="${base}">На главную</a></footer></div></body></html>`
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
