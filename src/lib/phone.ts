/**
 * Маска +7 (XXX) XXX-XX-XX.
 * Понимает ввод «8 927…», «+7 927…», «927…» и вставку номера в поле, где уже стоит «+7 (».
 * Код 8 в начале не отбрасываем сразу — у Ульяновска городские номера +7 (8422) …;
 * лишняя 8/7 срезается, только когда цифр становится больше 10.
 */
export function formatPhone(raw: string) {
  const trimmed = raw.trim()
  let rest = trimmed.startsWith('+7') ? trimmed.slice(2).replace(/\D/g, '') : trimmed.replace(/\D/g, '')
  if (!trimmed.startsWith('+7') && rest.length === 11 && /^[78]/.test(rest)) rest = rest.slice(1)
  if (rest.length > 10 && /^[78]/.test(rest)) rest = rest.slice(1)
  const p = rest.slice(0, 10)
  let out = '+7'
  if (p.length) out += ' (' + p.slice(0, 3)
  if (p.length >= 3) out += ')'
  if (p.length > 3) out += ' ' + p.slice(3, 6)
  if (p.length > 6) out += '-' + p.slice(6, 8)
  if (p.length > 8) out += '-' + p.slice(8, 10)
  return out
}

export const isPhoneValid = (v: string) => v.replace(/\D/g, '').length === 11
