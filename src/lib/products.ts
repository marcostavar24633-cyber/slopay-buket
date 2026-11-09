/**
 * Каталог = реальные фото мастерской. Тексты, цены и видимость правятся в админке (content/products.json).
 */
import { CAT_LABEL, GALLERY, type GalleryCat, type GalleryPhoto } from '@/lib/gallery'
import { PRODUCTS_DATA } from '@/lib/content'

export interface Item extends GalleryPhoto {
  id: string
  /** название работы */
  name: string
  /** категория: «Ягодный букет», «Букет из раков»… */
  title: string
  desc: string
  price: number
  recipients: Recipient[]
}

export type Recipient = 'her' | 'him'

/** Кому подходит работа — по категории: для неё — ягодные, сухофрукты, сладкие; для него — раки и мясные. */
export const RECIPIENT_CATS: Record<Recipient, GalleryCat[]> = {
  her: ['berry', 'dried', 'sweet'],
  him: ['sea', 'meat', 'snack'],
}
function recipientsOf(cat: GalleryCat): Recipient[] {
  return (Object.keys(RECIPIENT_CATS) as Recipient[]).filter((r) => RECIPIENT_CATS[r].includes(cat))
}

/** Метаданные фото из галереи (размеры, миниатюра); для фото, загруженных через админку, — по умолчанию. */
const META = new Map(GALLERY.map((p) => [p.src, p]))
const CATS = new Set(Object.keys(CAT_LABEL))

/**
 * Работы каталога — из админки (content/products.json): название, состав, цена, «показывать», «хит».
 * Фото с алкоголем и дубликаты там отмечены «не показывать».
 */
const visible: Item[] = PRODUCTS_DATA.filter((p) => p.show !== false && p.image && CATS.has(p.cat)).map((p) => {
  const cat = p.cat as GalleryCat
  const m = META.get(p.image)
  const photo: GalleryPhoto = m ? { ...m, cat } : { cat, src: p.image, thumb: p.image, w: 1000, h: 1000 }
  return { ...photo, id: p.id, name: p.name, title: CAT_LABEL[cat], desc: p.desc, price: Number(p.price) || 0, recipients: recipientsOf(cat) }
})
/** Если в категории осталось меньше 2 работ — переносим их в «Мясные». */
const small = new Set(
  [...new Set(visible.map((i) => i.cat))].filter((c) => visible.filter((i) => i.cat === c).length < 2),
)
export const ITEMS: Item[] = visible.map((i) => (small.has(i.cat) ? { ...i, cat: 'meat' as GalleryCat } : i))
export const itemsOf = (cat: GalleryCat) => ITEMS.filter((i) => i.cat === cat)
export const itemBySrc = (src: string) => ITEMS.find((i) => i.src === src)
export const minPriceOf = (cat: GalleryCat) => Math.min(...itemsOf(cat).map((i) => i.price))

/** Хит продаж — отмеченные в админке «Хит»; метка «Хит» на карточке — у отмеченных «Лидер продаж». */
const flagged = PRODUCTS_DATA.filter((p) => p.show !== false && p.hit).sort((a, b) => (a.hitOrder ?? 99) - (b.hitOrder ?? 99))
export const HIT_LEADERS = new Set(flagged.filter((p) => p.hitLabel).map((p) => p.id))
export const HITS: Item[] = flagged.map((p) => ITEMS.find((i) => i.id === p.id)).filter((i): i is Item => !!i)

export const RECIPIENT_TABS: { key: Recipient | 'all'; label: string }[] = [
  { key: 'all', label: 'Всем' },
  { key: 'her', label: 'Для неё' },
  { key: 'him', label: 'Для него' },
]

export const PRICE_TABS = [
  { key: 'all', label: 'Любая', min: 0, max: Infinity },
  { key: 'p1', label: 'до 3 000 ₽', min: 0, max: 3000 },
  { key: 'p2', label: '3 000 – 5 000 ₽', min: 3000, max: 5000 },
  { key: 'p3', label: '5 000 – 8 000 ₽', min: 5000, max: 8000 },
  { key: 'p4', label: 'от 8 000 ₽', min: 8000, max: Infinity },
] as const

/** Цена-якорь на первом экране — самая доступная работа. */
export const ANCHOR_PRICE = ITEMS.length ? Math.min(...ITEMS.map((i) => i.price)) : 0
