const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')

const source = fs.readFileSync(path.join(__dirname, '../src/admin/github.ts'), 'utf8')
const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText

async function main() {
  const { publishFiles } = await import('data:text/javascript;base64,' + Buffer.from(compiled).toString('base64'))
  const files = [
    { path: 'content/site.json', data: { brand: 'Мастерская' }, sha: 'old-site' },
    { path: 'content/faq.json', data: { items: [] }, sha: 'old-faq' },
  ]
  const calls = []
  let conflict = true
  let blob = 0
  global.fetch = async (input, init) => {
    const url = new URL(input)
    const route = url.pathname.replace(/^\/repos\/[^/]+\/[^/]+/, '')
    const method = init?.method ?? 'GET'
    const body = init?.body ? JSON.parse(init.body) : null
    calls.push({ route, method, body })
    let data
    if (route === '/git/ref/heads/main') data = { object: { sha: 'head' } }
    else if (route.startsWith('/contents/')) {
      assert.equal(url.searchParams.get('ref'), 'head')
      data = { sha: route.endsWith('site.json') ? (conflict ? 'changed' : 'old-site') : 'old-faq', content: 'e30=' }
    } else if (route === '/git/commits/head') data = { tree: { sha: 'original-tree' } }
    else if (route === '/git/blobs') data = { sha: `blob-${++blob}` }
    else if (route === '/git/trees') data = { sha: 'new-tree' }
    else if (route === '/git/commits') data = { sha: 'new-commit' }
    else if (route === '/git/refs/heads/main') data = { object: { sha: 'new-commit' } }
    else throw new Error(`Unexpected request: ${method} ${route}`)
    return new Response(JSON.stringify(data))
  }

  await assert.rejects(publishFiles('test', files, 'Update'), /изменился в GitHub/)
  assert.ok(calls.every(({ method }) => method === 'GET'))
  conflict = false
  calls.length = 0
  const updated = await publishFiles('test', files, 'Update')
  assert.deepEqual(updated, { 'content/site.json': 'blob-1', 'content/faq.json': 'blob-2' })
  const tree = calls.find(({ route }) => route === '/git/trees').body
  assert.equal(tree.base_tree, 'original-tree')
  assert.deepEqual(tree.tree.map(({ path }) => path), files.map(({ path }) => path))
  assert.deepEqual(calls.find(({ route }) => route === '/git/commits').body.parents, ['head'])
  assert.deepEqual(calls.at(-1), { route: '/git/refs/heads/main', method: 'PATCH', body: { sha: 'new-commit', force: false } })
  console.log('Admin publication: no writes on conflict, one non-forced branch update for multiple files.')
}

main().catch((error) => { console.error(error); process.exitCode = 1 })
