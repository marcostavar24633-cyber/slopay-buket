import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'
import path from 'node:path'

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

/** Подставляет абсолютный адрес в мета-теги и кладёт в сборку robots.txt и sitemap.xml. */
function seo(): Plugin {
  let base = '/'
  return {
    name: 'slopay-seo',
    transformIndexHtml: (html, ctx) => {
      let out = html.replaceAll('%SITE_URL%', SITE_URL)
      // ранняя загрузка шрифтов (PRELOAD_FONTS=1). По замерам на мобильном 4G она отнимает канал у главного фото, поэтому выключена
      const fonts = Object.keys(ctx.bundle ?? {}).filter((f) => /(manrope-cyrillic-wght-normal|playfair-display-cyrillic-wght-(normal|italic))-.*\.woff2$/.test(f))
      if (fonts.length && process.env.PRELOAD_FONTS) out = out.replace('</head>', fonts.map((f) => `  <link rel="preload" as="font" type="font/woff2" crossorigin href="${base}${f}" />\n`).join('') + '  </head>')
      return out
    },
    configResolved: (c) => void (base = c.base),
    generateBundle() {
      const today = new Date().toISOString().slice(0, 10)
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `User-agent: *\nAllow: /\n\nHost: ${SITE_URL}\nSitemap: ${SITE_URL}/sitemap.xml\n` })
      const urls = [`${SITE_URL}/`, `${SITE_URL}/corporate/`, `${SITE_URL}/oferta/`, `${SITE_URL}/privacy/`]
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
          .map((u, i) => `  <url><loc>${u}</loc><lastmod>${today}</lastmod><priority>${i ? '0.3' : '1.0'}</priority></url>`)
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
      },
      output: {
        // библиотеки отдельно: кэшируются браузером между обновлениями сайта
        manualChunks: { react: ['react', 'react-dom'], motion: ['motion/react'] },
      },
    },
  },
})
