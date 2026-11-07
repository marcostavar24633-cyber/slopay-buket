import assert from 'node:assert/strict'
import { formatPhone } from '../src/lib/phone.ts'
const cases: [string, string][] = [
  ['89271234567', '+7 (927) 123-45-67'],
  ['+79271234567', '+7 (927) 123-45-67'],
  ['9271234567', '+7 (927) 123-45-67'],
  ['+7 (89271234567', '+7 (927) 123-45-67'],
  ['+7 (892) 712-34-567', '+7 (927) 123-45-67'],
  ['+7 (8422) 50-70-90', '+7 (842) 250-70-90'],
  ['+7 (8', '+7 (8'],
  ['8 (927) 123-45-67', '+7 (927) 123-45-67'],
]
for (const [i, o] of cases) assert.equal(formatPhone(i), o, i)
console.log(`phone mask: ${cases.length}/${cases.length} ok`)
