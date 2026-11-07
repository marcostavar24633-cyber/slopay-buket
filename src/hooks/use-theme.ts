import { useCallback, useEffect, useState } from 'react'

export type Theme = 'dark' | 'light'
const KEY = 'slopay-theme'
const META = { dark: '#0a0908', light: '#fff1e6' }

const read = (): Theme => (document.documentElement.dataset.theme === 'light' ? 'light' : 'dark')

function apply(t: Theme) {
  document.documentElement.dataset.theme = t
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', META[t])
  try {
    localStorage.setItem(KEY, t)
  } catch {
    /* приватный режим — тема просто не запомнится */
  }
}

/** Тема сайта: тёмная по умолчанию, выбор запоминается в браузере посетителя. */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(read)

  useEffect(() => {
    const obs = new MutationObserver(() => setTheme(read()))
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => obs.disconnect()
  }, [])

  const toggle = useCallback((origin?: { x: number; y: number }) => {
    const next: Theme = read() === 'dark' ? 'light' : 'dark'
    const root = document.documentElement
    if (origin) {
      root.style.setProperty('--tx', `${origin.x}px`)
      root.style.setProperty('--ty', `${origin.y}px`)
    }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown }
    if (doc.startViewTransition && !reduce) doc.startViewTransition(() => apply(next))
    else apply(next)
  }, [])

  return { theme, toggle }
}
