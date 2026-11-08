// Готовит каталог для Telegram-бота: api/_catalog.json (названия, состав, цены) и public/tg/<id>.jpg (фото в JPG —
// Telegram плохо принимает WebP). Запускайте после правок в src/lib/products.ts: npm run bot-catalog
import { build } from 'esbuild'
import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const tmp = path.join(root, 'node_modules/.cache/bot-catalog.mjs')
await build({
  stdin: {
    contents: `export { ITEMS, HITS } from '@/lib/products'; export { GALLERY_CATS } from '@/lib/gallery'; export { SITE } from '@/lib/config'`,
    resolveDir: root,
  },
  bundle: true, format: 'esm', platform: 'node', outfile: tmp, logLevel: 'warning',
  alias: { '@': path.join(root, 'src') },
})
const { ITEMS, HITS, GALLERY_CATS, SITE } = await import(pathToFileURL(tmp).href + '?' + Date.now())

const cats = GALLERY_CATS.filter((c) => c.key !== 'all')
  .map((c) => ({ key: c.key, label: c.label, items: ITEMS.filter((i) => i.cat === c.key).map((i) => i.id) }))
  .filter((c) => c.items.length)
const items = Object.fromEntries(ITEMS.map((i) => [i.id, { cat: i.cat, name: i.name, desc: i.desc, price: i.price }]))
const site = { phone: SITE.phoneDisplay, address: `${SITE.city}, ${SITE.address}`, hours: SITE.hours, maxUrl: SITE.maxUrl, freeDeliveryFrom: SITE.freeDeliveryFrom }
fs.writeFileSync(path.join(root, 'api/_catalog.json'), JSON.stringify({ cats, items, hits: HITS.map((i) => i.id), site }, null, 1) + '\n')

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
console.log(`[bot-catalog] ${cats.length} категорий, ${ITEMS.length} букетов, новых фото: ${made}`)
