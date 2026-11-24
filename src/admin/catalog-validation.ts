import type { Product } from '@/lib/content'
import { GALLERY_CATS } from '@/lib/gallery'

const categories = new Set<string>(GALLERY_CATS.filter(({ key }) => key !== 'all').map(({ key }) => key))

export const isCatalogPhoto = (src: string) => /^\/img\/unsorted\/(?:[a-z0-9_-]+\/)*[a-z0-9_-]+\.webp$/i.test(src)

export function productProblem(item: Product, demo = false): string | null {
  if (!/^[a-z0-9_-]+$/i.test(item.id)) return 'Некорректный код товара.'
  if (!item.name.trim()) return 'Введите название.'
  if (!categories.has(item.cat)) return 'Выберите категорию.'
  if (!Number.isSafeInteger(item.price) || item.price <= 0) return 'Укажите целую цену больше нуля.'
  if (item.show === false) return null
  if (!item.desc.trim()) return 'Добавьте описание для карточки на сайте.'
  if (!isCatalogPhoto(item.image) && !(demo && item.image.startsWith('blob:'))) return 'Для витрины требуется фото WebP из папки unsorted.'
  return null
}

export function catalogProblem(items: Product[]): string | null {
  const ids = new Set<string>()
  const photos = new Set<string>()
  for (const item of items) {
    const problem = productProblem(item)
    if (problem) return `«${item.name || item.id}»: ${problem}`
    if (ids.has(item.id)) return `Повторяется код товара ${item.id}.`
    ids.add(item.id)
    if (item.show === false) continue
    if (photos.has(item.image)) return `«${item.name}»: это фото уже используется на витрине.`
    photos.add(item.image)
  }
  return null
}
