// Integrity checks for the legacy storefront catalog and its generated runtime data.
const fs = require('node:fs')
const path = require('node:path')
const assert = require('node:assert/strict')

const root = path.resolve(__dirname, '..')
const source = JSON.parse(fs.readFileSync(path.join(root, 'content/products.json'), 'utf8')).items
const generatedText = fs.readFileSync(path.join(root, 'redesign/js/data.js'), 'utf8')
const match = generatedText.match(/window\\.SB_DATA = (\\{[\\s\\S]*\\});\\s*$/)
assert.ok(match, 'generated storefront data must expose a JSON payload')
const generated = JSON.parse(match[1]).items
const app = fs.readFileSync(path.join(root, 'redesign/js/app.js'), 'utf8')

const ids = source.map((item) => item.id)
assert.equal(new Set(ids).size, ids.length, 'product IDs must be unique')
assert.ok(source.every((item) => item.id && item.name && item.cat && Number.isInteger(item.price) && item.price > 0),
  'every product must have an ID, name, category and positive integer price')

const visible = source.filter((item) => item.show !== false && item.image)
assert.deepEqual(generated.map((item) => item.id), visible.map((item) => item.id),
  'generated storefront items must match visible source products in order')

for (const item of generated) {
  assert.ok(fs.existsSync(path.join(root, 'public', item.img)), `missing product image: ${item.id} -> ${item.img}`)
  assert.ok(fs.existsSync(path.join(root, 'public', item.thumb)), `missing product thumbnail: ${item.id} -> ${item.thumb}`)
  const sourceItem = source.find((candidate) => candidate.id === item.id)
  assert.equal(item.price, sourceItem.price, `price mismatch for ${item.id}`)
  assert.equal(item.cat, sourceItem.cat, `category mismatch for ${item.id}`)
}

assert.match(app, /\\['snack', 'Снеки и закуски'\\]/, 'quiz must offer the snack category as a taste preference')
assert.doesNotMatch(app, /availability:\\s*['"]https:\\/\\/schema\\.org\\/InStock['"]/,
  'product schema must not claim live stock when inventory is not tracked')

console.log(`Catalog integrity passed: ${source.length} source products, ${generated.length} visible products.`)
