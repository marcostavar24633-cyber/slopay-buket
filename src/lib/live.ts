/**
 * «Живые» данные для визуального редактора: блоки страницы, первый экран и цвета.
 * На обычном сайте — просто опубликованные данные. Во фрейме редактора (?edit=1) админка присылает
 * черновик сообщениями, и страница перерисовывается сразу, без перезагрузки.
 */
import { useSyncExternalStore } from 'react'
import { EDIT_MODE, HERO_DATA, PAGE_BLOCKS, SITE_DATA, type Block, type BlockStyle, type Theme } from '@/lib/content'

export type Live = {
  page: Block[]
  hero: typeof HERO_DATA
  theme: Theme
  /** выбранный в редакторе блок: номер или 'hero' */
  selected: number | 'hero' | null
  /** true — кнопки и ссылки работают как на сайте; false — клик выбирает блок */
  interactive: boolean
}

let state: Live = { page: PAGE_BLOCKS, hero: HERO_DATA, theme: SITE_DATA.theme ?? {}, selected: null, interactive: false }
const subs = new Set<() => void>()
const emit = () => subs.forEach((f) => f())

/** Сообщения сайт ↔ админка (один адрес, поэтому проверяем origin). */
export type ToSite = { type: 'slopay:live'; page?: Block[]; hero?: Live['hero']; theme?: Theme; selected?: Live['selected']; interactive?: boolean } | { type: 'slopay:scroll'; y: number }
export type ToAdmin =
  | { type: 'slopay:ready' }
  | { type: 'slopay:select'; index: number | 'hero' }
  | { type: 'slopay:move'; from: number; to: number }
  | { type: 'slopay:style'; index: number; patch: BlockStyle }
  | { type: 'slopay:text'; index: number | 'hero'; field: string; value: string }
  | { type: 'slopay:scrollpos'; y: number }

export const toAdmin = (m: ToAdmin) => EDIT_MODE && window.parent.postMessage(m, location.origin === 'null' ? '*' : location.origin)

if (EDIT_MODE) {
  queueMicrotask(() => toAdmin({ type: 'slopay:ready' }))
  addEventListener('message', (e: MessageEvent<ToSite>) => {
    if (e.source !== window.parent || !e.data?.type) return
    if (e.data.type === 'slopay:live') {
      const rest = Object.fromEntries(Object.entries(e.data).filter(([key, value]) => key !== 'type' && value !== undefined))
      state = { ...state, ...rest }
      emit()
    } else if (e.data.type === 'slopay:scroll') scrollTo(0, e.data.y)
  })
  // сообщаем позицию прокрутки — чтобы после перезагрузки фрейма вернуться на то же место
  let t = 0
  addEventListener('scroll', () => {
    clearTimeout(t)
    t = window.setTimeout(() => toAdmin({ type: 'slopay:scrollpos', y: scrollY }), 150)
  })
}

export function useLive(): Live {
  return useSyncExternalStore(
    (f) => (subs.add(f), () => subs.delete(f)),
    () => state,
    () => state,
  )
}

/* ───────── CSS из настроек ───────── */

const color = (c?: string) => (c && /^#[0-9a-f]{3,8}$/i.test(c) ? c : '')
const num = (n?: number) => (typeof n === 'number' && isFinite(n) ? Math.max(0, Math.min(400, Math.round(n))) : null)

/** Стили одного блока по его номеру: обёртка [data-bi="N"] вокруг секции. */
export function blockCss(i: number, s?: BlockStyle): string {
  if (!s) return ''
  const sel = `[data-bi="${i}"]`
  const out: string[] = []
  const bg = color(s.bg)
  const text = color(s.text)
  const accent = color(s.accent)
  if (bg) out.push(`${sel}{background:${bg}}${sel}>section{background:transparent!important}`)
  if (text)
    out.push(
      `${sel}{--color-ink:${text};--color-ink-soft:color-mix(in srgb,${text} 80%,transparent);--color-muted:color-mix(in srgb,${text} 62%,transparent);color:${text}}${sel} .text-white{color:${text}}`,
    )
  if (accent)
    out.push(
      `${sel}{--color-honey:${accent};--color-honey-600:${accent}}${sel} .bg-gold{background-image:none;background-color:${accent}}${sel} .text-gold{background-image:none;color:${accent};-webkit-text-fill-color:${accent};animation:none}`,
    )
  const pt = num(s.padTop)
  const pb = num(s.padBottom)
  if (pt !== null) out.push(`${sel}>section{padding-top:${pt}px!important}`)
  if (pb !== null) out.push(`${sel}>section{padding-bottom:${pb}px!important}`)
  if (s.width === 'narrow') out.push(`${sel} .container-x{max-width:960px}`)
  if (s.width === 'wide') out.push(`${sel} .container-x{max-width:1480px}`)
  const ts = num(s.titleSize)
  if (ts) out.push(`${sel} h2{font-size:max(22px,min(${ts}px,${((ts * 0.78) / 3.9).toFixed(2)}vw))!important}`)
  return out.join('')
}

/** Цвета всего сайта: акцент — в обеих темах, фон/карточки/текст — в тёмной (основной). */
export function themeCss(t: Theme): string {
  const out: string[] = []
  const accent = color(t.accent)
  if (accent)
    out.push(
      `:root,:root[data-theme="light"]{--color-honey:${accent};--color-honey-600:${accent}}.bg-gold,:root[data-theme="light"] .bg-gold{background-image:none!important;background-color:${accent}}.text-gold,:root[data-theme="light"] .text-gold{background-image:none!important;color:${accent}!important;-webkit-text-fill-color:${accent};animation:none}`,
    )
  const dark: string[] = []
  if (color(t.bg)) dark.push(`--color-cream:${t.bg};--color-graphite:${t.bg}`)
  if (color(t.surface)) dark.push(`--color-surface:${t.surface};--color-cream-2:${t.surface};--color-graphite-2:${t.surface}`)
  if (color(t.text)) dark.push(`--color-ink:${t.text};--color-ink-soft:color-mix(in srgb,${t.text} 80%,transparent)`)
  if (dark.length) out.push(`:root:not([data-theme="light"]){${dark.join(';')}}`)
  return out.join('')
}
