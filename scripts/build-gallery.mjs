// Собирает src/lib/gallery.ts из scripts/manifests/*.json (их создаёт npm run photos).
// Порядок категорий и подписи — в CATS ниже. Запуск: npm run gallery
import fs from 'node:fs'

const CATS = [
  ['berry', 'Ягодные букеты и корзины', 'Ягодный букет'],
  ['meat', 'Мясные букеты', 'Мясной букет'],
  ['sea', 'Раки и морепродукты', 'Букет из раков'],
  ['dried', 'Сухофрукты и орехи', 'Сухофрукты и орехи'],
  ['sweet', 'Сладкие боксы', 'Сладкий бокс'],
  ['snack', 'Мужские наборы', 'Мужской набор'],
]
const nat = (a, b) => a.localeCompare(b, 'ru', { numeric: true })
const load = (k) => JSON.parse(fs.readFileSync(`scripts/manifests/${k}.json`, 'utf8')).sort((a, b) => nat(a.src, b.src))
const items = Object.fromEntries(CATS.map(([k]) => [k, load(k)]))

const lines = [
  '// Сгенерировано scripts/build-gallery.mjs — реальные работы мастерской. Не править вручную.',
  `export type GalleryCat = ${CATS.map(([k]) => `'${k}'`).join(' | ')}`,
  '',
  'export interface GalleryPhoto { cat: GalleryCat; src: string; thumb: string; w: number; h: number }',
  '',
  "export const GALLERY_CATS: { key: GalleryCat | 'all'; label: string }[] = [",
  "  { key: 'all', label: 'Все работы' },",
  ...CATS.map(([k, l]) => `  { key: '${k}', label: '${l}' },`),
  ']',
  '',
  'export const CAT_LABEL: Record<GalleryCat, string> = {',
  ...CATS.map(([k, , s]) => `  ${k}: '${s}',`),
  '}',
  '',
  '/** Категории чередуются, чтобы вкладка «Все работы» выглядела разнообразно. */',
  'export const GALLERY: GalleryPhoto[] = [',
]
const max = Math.max(...Object.values(items).map((v) => v.length))
for (let i = 0; i < max; i++)
  for (const [k] of CATS) {
    const x = items[k][i]
    if (x) lines.push(`  { cat: '${k}', src: '${x.src}', thumb: '${x.src.replace(`/real/${k}/`, `/real/${k}/thumbs/`)}', w: ${x.width}, h: ${x.height} },`)
  }
lines.push(']', '', '/** Скриншоты реальных отзывов с Авито (без дублей и обрезанных). */', 'export const REVIEW_SHOTS: { src: string; w: number; h: number }[] = [')
for (const x of load('reviews')) lines.push(`  { src: '${x.src}', w: ${x.width}, h: ${x.height} },`)
lines.push(']', '')
fs.writeFileSync('src/lib/gallery.ts', lines.join('\n'))
console.log('gallery.ts:', Object.values(items).reduce((s, v) => s + v.length, 0), 'фото')
