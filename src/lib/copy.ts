/** Копирование сразу в момент нажатия — на телефонах асинхронное копирование не успевает до перехода в мессенджер. */
import { withSource } from './config'

export function copyNow(raw: string) {
  const text = withSource(raw)
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0'
    document.body.appendChild(ta)
    ta.select()
    ta.setSelectionRange(0, text.length)
    document.execCommand('copy')
    ta.remove()
  } catch {
    /* ниже — запасной способ */
  }
  navigator.clipboard?.writeText(text).catch(() => {})
}
