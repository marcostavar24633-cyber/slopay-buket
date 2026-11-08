// Готовит JPG-копии фото букетов public/tg/<id>.jpg — по ссылке на них Telegram и MAX показывают фото в чате
// (WebP мессенджеры показывают плохо). Запускайте после добавления фото в src/lib/products.ts: npm run tg-photos
import { build } from 'esbuild'
import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const tmp = path.join(root, 'node_modules/.cache/bot-catalog.mjs')
await build({
  stdin: {
    contents: `export { ITEMS } from '@/lib/products'`,
    resolveDir: root,
  },
  bundle: true, format: 'esm', platform: 'node', outfile: tmp, logLevel: 'warning',
  alias: { '@': path.join(root, 'src') },
})
const { ITEMS } = await import(pathToFileURL(tmp).href + '?' + Date.now())

const out = path.join(root, 'public/tg')
fs.mkdirSync(out, { recursive: true })
const keep = new Set(ITEMS.map((i) => `${i.id}.jpg`))
for (const f of fs.readdirSync(out)) if (!keep.has(f)) fs.unlinkSync(path.join(out, f))
let made = 0
for (const i of ITEMS) {
  const dst = path.join(out, `${i.id}.jpg`)
  if (fs.existsSync(dst)) continue
  await sharp(path.join(root, 'public', i.src)).resize(640, 640, { fit: 'inside' }).jpeg({ quality: 74, mozjpeg: true }).toFile(dst)
  made++
}
console.log(`[tg-photos] ${ITEMS.length} букетов, новых фото: ${made}`)
