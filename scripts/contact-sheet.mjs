// Контактный лист: сетка миниатюр с номерами. node scripts/contact-sheet.mjs <папка> <out.jpg>
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const [dir, out, colsArg = '6'] = process.argv.slice(2)
const cols = Number(colsArg)
const T = 220
const files = fs.readdirSync(dir).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort()
const rows = Math.ceil(files.length / cols)
const tiles = await Promise.all(
  files.map(async (f, i) => {
    const img = await sharp(path.join(dir, f), { failOn: 'none' }).rotate().resize(T, T, { fit: 'cover' }).toBuffer()
    const label = Buffer.from(
      `<svg width="${T}" height="26"><rect width="${T}" height="26" fill="black" opacity=".7"/><text x="6" y="18" font-size="14" font-family="sans-serif" fill="white">${i + 1}. ${f.slice(0, 24)}</text></svg>`,
    )
    return {
      input: await sharp(img).composite([{ input: label, top: T - 26, left: 0 }]).toBuffer(),
      left: (i % cols) * (T + 4),
      top: Math.floor(i / cols) * (T + 4),
    }
  }),
)
await sharp({ create: { width: cols * (T + 4), height: rows * (T + 4), channels: 3, background: '#222' } })
  .composite(tiles)
  .jpeg({ quality: 70 })
  .toFile(out)
console.log(out, files.length)
