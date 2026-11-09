/**
 * Содержимое сайта, которое редактируется в админке (/admin/ → файлы content/*.json).
 * Здесь только типы и импорт; логика — в config.ts, products.ts и компонентах.
 */
import site from '../../content/site.json'
import hero from '../../content/hero.json'
import products from '../../content/products.json'
import reviews from '../../content/reviews.json'
import faq from '../../content/faq.json'
import occasions from '../../content/occasions.json'
import seasons from '../../content/seasons.json'
import messages from '../../content/messages.json'
import page from '../../content/page.json'

/**
 * Визуальный редактор: админка открывает сайт во фрейме с ?edit=1 и кладёт черновик в sessionStorage
 * (у фрейма и админки общий адрес — общий sessionStorage). Тогда сайт показывает черновик, а не опубликованное.
 */
export const EDIT_MODE =
  typeof window !== 'undefined' && window.parent !== window && new URLSearchParams(location.search).get('edit') === '1'
const DRAFT: Record<string, unknown> | null = (() => {
  if (!EDIT_MODE) return null
  try {
    return JSON.parse(sessionStorage.getItem('slopay-draft') || 'null')
  } catch {
    return null
  }
})()
const pick = <T,>(key: string, v: T): T => ((DRAFT?.[key] as T) ?? v)

/** Оформление блока из визуального редактора: цвета, отступы, ширина, размер заголовка. */
export type BlockStyle = {
  bg?: string
  text?: string
  accent?: string
  padTop?: number
  padBottom?: number
  width?: 'narrow' | 'normal' | 'wide'
  titleSize?: number
}
/** Цвета всего сайта (пусто — как задумано в дизайне). Фон/карточки/текст — для тёмной темы. */
export type Theme = { accent?: string; bg?: string; surface?: string; text?: string }

export type BuiltinKey = 'hits' | 'reviews' | 'howto' | 'catalog' | 'why' | 'occasions' | 'delivery' | 'process' | 'faq' | 'corporate'

export type Cta = 'messengers' | 'quiz' | 'catalog' | 'none'
type Common = { show?: boolean; style?: BlockStyle }
export type Block = Common &
  (
    | { type: 'builtin'; section: BuiltinKey; eyebrow?: string; title?: string; sub?: string }
    | { type: 'text'; eyebrow?: string; title?: string; body?: string; cta?: Cta; center?: boolean }
    | { type: 'imageText'; eyebrow?: string; title?: string; body?: string; image?: string; imageRight?: boolean; cta?: Cta }
    | { type: 'banner'; title?: string; body?: string; image?: string; cta?: Cta }
    | { type: 'gallery'; eyebrow?: string; title?: string; body?: string; images?: { image: string; caption?: string }[] }
    | { type: 'cards'; eyebrow?: string; title?: string; body?: string; cards?: { icon?: string; title: string; text?: string }[] }
  )

export type Product = {
  id: string
  cat: string
  name: string
  desc: string
  price: number
  image: string
  show?: boolean
  hit?: boolean
  hitLabel?: boolean
  /** порядок в «Хитах»: 1, 2, 3… */
  hitOrder?: number
}

export const SITE_DATA = pick('site', site) as typeof site & { theme?: Theme }
export const HERO_DATA = pick('hero', hero)
export const PRODUCTS_DATA = pick('products', products).items as Product[]
export const REVIEWS_DATA = pick('reviews', reviews)
export const FAQ_DATA = pick('faq', faq).items as { q: string; a: string }[]
export const OCCASIONS_DATA = pick('occasions', occasions).items as { title: string; text: string; image: string; target: string }[]
export const SEASONS_DATA = pick('seasons', seasons).seasons as { from: string; until: string; text: string; href: string }[]
export const MESSAGES_DATA = pick('messages', messages) as Record<string, string>
export const PAGE_BLOCKS = (pick('page', page).blocks ?? []) as Block[]
