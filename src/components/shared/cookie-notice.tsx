import { useEffect, useState } from 'react'
import { Cookie } from 'lucide-react'

const KEY = 'slopay-cookie-ok'

/** Уведомление о cookie и Яндекс Метрике (152-ФЗ). Показывается один раз, ответ запоминается в браузере. */
export function CookieNotice() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    let seen = false
    try {
      seen = localStorage.getItem(KEY) === '1'
    } catch {
      /* приватный режим — просто покажем */
    }
    if (seen) return
    const t = setTimeout(() => setShow(true), 1500)
    return () => clearTimeout(t)
  }, [])
  if (!show) return null
  const ok = () => {
    try {
      localStorage.setItem(KEY, '1')
    } catch {
      /* не страшно */
    }
    setShow(false)
  }
  return (
    <div
      role="region"
      aria-label="Уведомление о cookie"
      className="fixed inset-x-3 bottom-[calc(84px+env(safe-area-inset-bottom))] z-[70] mx-auto flex max-w-xl items-center gap-3 rounded-2xl border border-line bg-surface/95 p-3.5 text-[13px] leading-snug text-ink-soft shadow-lift backdrop-blur-xl data-[on]:animate-[fade-in_300ms_ease-out] md:bottom-5 md:left-5 md:right-auto md:mx-0"
      data-on
    >
      <Cookie className="h-5 w-5 shrink-0 text-honey" aria-hidden />
      <p>
        Сайт использует cookie и Яндекс Метрику.{' '}
        <a href="/privacy/" target="_blank" rel="noopener" className="font-semibold text-ink underline underline-offset-2">
          Подробнее
        </a>
      </p>
      <button onClick={ok} className="h-10 shrink-0 cursor-pointer rounded-full bg-honey px-4 text-[13px] font-bold text-onaccent">
        Понятно
      </button>
    </div>
  )
}
