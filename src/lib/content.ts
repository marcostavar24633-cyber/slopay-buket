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

export type BuiltinKey = 'hits' | 'reviews' | 'howto' | 'catalog' | 'why' | 'occasions' | 'delivery' | 'process' | 'faq' | 'corporate'

export type Cta = 'messengers' | 'quiz' | 'catalog' | 'none'
export type Block =
  | { type: 'builtin'; section: BuiltinKey; show?: boolean; eyebrow?: string; title?: string; sub?: string }
  | { type: 'text'; show?: boolean; eyebrow?: string; title?: string; body?: string; cta?: Cta; center?: boolean }
  | { type: 'imageText'; show?: boolean; eyebrow?: string; title?: string; body?: string; image?: string; imageRight?: boolean; cta?: Cta }
  | { type: 'banner'; show?: boolean; title?: string; body?: string; image?: string; cta?: Cta }
  | { type: 'gallery'; show?: boolean; eyebrow?: string; title?: string; body?: string; images?: { image: string; caption?: string }[] }
  | { type: 'cards'; show?: boolean; eyebrow?: string; title?: string; body?: string; cards?: { icon?: string; title: string; text?: string }[] }

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

export const SITE_DATA = site
export const HERO_DATA = hero
export const PRODUCTS_DATA = products.items as Product[]
export const REVIEWS_DATA = reviews
export const FAQ_DATA = faq.items as { q: string; a: string }[]
export const OCCASIONS_DATA = occasions.items as { title: string; text: string; image: string; target: string }[]
export const SEASONS_DATA = seasons.seasons as { from: string; until: string; text: string; href: string }[]
export const MESSAGES_DATA = messages as Record<string, string>
export const PAGE_BLOCKS = (page.blocks ?? []) as Block[]
