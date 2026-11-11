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
      // оферта и политика закрыты от индексации (noindex) — в карту сайта не включаем
      const urls = [`${SITE_URL}/`, `${SITE_URL}/corporate/`]
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
