#!/usr/bin/env node
/**
 * Импорт фото из любой папки в проект: пережимает в WebP, поворачивает по EXIF,
 * уменьшает до 1200 px по длинной стороне, переводит русские имена в латиницу.
 *
 *   npm run photos -- "C:\Users\Имя\Desktop\Букеты"
 *   npm run photos -- ./мои-фото --out public/img/real --width 1400
 *
 * Результат: public/img/real/*.webp + manifest.json со списком путей.
 * Поддерживаются JPG, PNG, WebP, AVIF, TIFF. HEIC с iPhone — сначала экспортируйте в JPG.
 */
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const args = process.argv.slice(2)
const src = args.find((a) => !a.startsWith('--'))
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? args[i + 1] : def
}
const out = path.resolve(opt('out', 'public/img/real'))
const maxSide = Number(opt('width', 1200))
const quality = Number(opt('quality', 80))

if (!src || !fs.existsSync(src)) {
  console.error('Укажите папку с фото:  npm run photos -- "путь/к/папке"')
  process.exit(1)
}

const RU = 'а:a,б:b,в:v,г:g,д:d,е:e,ё:e,ж:zh,з:z,и:i,й:y,к:k,л:l,м:m,н:n,о:o,п:p,р:r,с:s,т:t,у:u,ф:f,х:h,ц:ts,ч:ch,ш:sh,щ:sch,ъ:,ы:y,ь:,э:e,ю:yu,я:ya'
const MAP = Object.fromEntries(RU.split(',').map((p) => p.split(':')))
const slug = (name) =>
  name
    .toLowerCase()
    .split('')
    .map((c) => MAP[c] ?? c)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'photo'

const EXT = /\.(jpe?g|png|webp|avif|tiff?)$/i
const files = []
const walk = (dir) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p)
    else if (EXT.test(e.name)) files.push(p)
    else if (/\.heic$/i.test(e.name)) console.warn(`  пропущен HEIC (экспортируйте в JPG): ${e.name}`)
  }
}
walk(src)
if (!files.length) {
  console.error('В папке нет фото (JPG/PNG/WebP).')
  process.exit(1)
}

fs.mkdirSync(out, { recursive: true })
const used = new Set()
const manifest = []
let before = 0
let after = 0

for (const file of files.sort()) {
  let name = slug(path.basename(file).replace(EXT, ''))
  while (used.has(name)) name += '-2'
  used.add(name)
  const dest = path.join(out, `${name}.webp`)
  try {
    const info = await sharp(file, { failOn: 'none' })
      .rotate()
      .resize({ width: maxSide, height: maxSide, fit: 'inside', withoutEnlargement: true })
      .webp({ quality })
      .toFile(dest)
    before += fs.statSync(file).size
    after += info.size
    const web = '/' + path.relative(path.resolve('public'), dest).split(path.sep).join('/')
    manifest.push({ src: web, original: path.basename(file), width: info.width, height: info.height })
    console.log(`  ✓ ${path.basename(file)} → ${web} (${Math.round(info.size / 1024)} КБ)`)
  } catch (e) {
    console.warn(`  ✗ ${path.basename(file)}: ${e.message}`)
  }
}

fs.writeFileSync(path.join(out, 'manifest.json'), JSON.stringify(manifest, null, 2))
console.log(`\nГотово: ${manifest.length} фото, ${(before / 1048576).toFixed(1)} МБ → ${(after / 1048576).toFixed(1)} МБ`)
console.log(`Папка: ${out}\nСписок путей: ${path.join(out, 'manifest.json')}`)
