const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { DatabaseSync } = require('node:sqlite')

async function main() {
  const { orders } = await import('../order-api.js')
  const sqlite = new DatabaseSync(':memory:')
  sqlite.exec(fs.readFileSync(path.join(__dirname, '../migrations/0001_orders.sql'), 'utf8'))
  const d1 = { prepare: (sql) => ({ bind: (...args) => ({
    all: async () => ({ results: sqlite.prepare(sql).all(...args) }),
    run: async () => ({ meta: sqlite.prepare(sql).run(...args) }),
  }) }) }
  const origin = 'https://shop.test'
  const route = '/api/admin/orders'
  const valid = { customer: 'Проверка', phone: '', status: 'new', channel: 'telegram', fulfillment: 'pickup', due_date: '2026-12-01', address: 'Лишний адрес', amount: 2500, notes: '' }
  let owner = false
  global.fetch = async (url) => Response.json(url.endsWith('/user') ? { login: owner ? 'marcostavar24633-cyber' : 'another-user' } : { permissions: { push: true } })
  const invoke = (method, suffix = '', body, authenticated = true, requestOrigin = origin) => orders(new Request(origin + route + suffix, {
    method,
    headers: { Origin: requestOrigin, ...(authenticated ? { Authorization: 'Bearer test_token_that_is_not_real' } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  }), d1)
  assert.equal((await invoke('GET', '', undefined, false)).status, 401)
  assert.equal((await invoke('GET')).status, 401)
  owner = true
  assert.equal((await invoke('POST', '', valid, true, 'https://elsewhere.test')).status, 403)
  assert.equal((await invoke('POST', '', { ...valid, due_date: '2026-02-31' })).status, 400)
  const created = await invoke('POST', '', valid)
  assert.equal(created.status, 201)
  const { id } = await created.json()
  const result = await invoke('GET')
  assert.equal(result.headers.get('cache-control'), 'private, no-store')
  const [saved] = (await result.json()).items
  assert.equal(Object.hasOwn(saved, 'address'), false)
  assert.equal(Object.hasOwn(saved, 'customer'), false)
  assert.equal(saved.version, 1)
  assert.equal((await invoke('PATCH', `/${id}`, { ...valid, status: 'ready', version: 1 })).status, 200)
  assert.equal((await invoke('PATCH', `/${id}`, { ...valid, version: 1 })).status, 409)
  assert.equal((await invoke('DELETE', `/${id}`)).status, 405)
  sqlite.close()
  console.log('Orders: authenticated writes, input checks, no caching, version conflict, private records.')
}

main().catch((error) => { console.error(error); process.exitCode = 1 })
