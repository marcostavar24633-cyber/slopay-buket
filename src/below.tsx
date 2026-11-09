/**
 * Всё, что ниже первого экрана и «Хитов», — отдельный файл сборки: грузится сразу после первого экрана,
 * но не мешает ему отрисоваться быстрее. Порядок и видимость блоков задаются в админке (content/page.json).
 */
import type { ComponentType } from 'react'
import { Catalog, Hits } from '@/components/sections/catalog'
import { Occasions } from '@/components/sections/occasions'
import { Why } from '@/components/sections/why'
import { Reviews } from '@/components/sections/reviews'
import { Process } from '@/components/sections/process'
import { Delivery, HowToOrder } from '@/components/sections/delivery'
import { Faq } from '@/components/sections/trust'
import { CorporateTeaser } from '@/components/sections/corporate-teaser'
import { Footer } from '@/components/sections/final'
import { QuizDialog } from '@/components/sections/quiz'
import { CookieNotice } from '@/components/shared/cookie-notice'
import { BannerBlock, CardsBlock, GalleryBlock, ImageTextBlock, TextBlock } from '@/components/blocks/custom-blocks'
import { TitleOverride } from '@/components/shared/section-title'
import type { Block, BuiltinKey } from '@/lib/content'

/** Готовые блоки сайта: ключ в админке → компонент. */
export const BUILTIN: Record<BuiltinKey, ComponentType> = {
  hits: Hits,
  reviews: Reviews,
  howto: HowToOrder,
  catalog: Catalog,
  why: Why,
  occasions: Occasions,
  delivery: Delivery,
  process: Process,
  faq: Faq,
  corporate: CorporateTeaser,
}

export function BlockView({ b, i }: { b: Block; i: number }) {
  switch (b.type) {
    case 'builtin': {
      const C = BUILTIN[b.section]
      if (!C) return null
      const o = b.eyebrow || b.title || b.sub ? { eyebrow: b.eyebrow, title: b.title, sub: b.sub } : null
      return (
        <TitleOverride.Provider value={o}>
          <C />
        </TitleOverride.Provider>
      )
    }
    case 'text':
      return <TextBlock b={b} i={i} />
    case 'imageText':
      return <ImageTextBlock b={b} i={i} />
    case 'banner':
      return <BannerBlock b={b} i={i} />
    case 'gallery':
      return <GalleryBlock b={b} i={i} />
    case 'cards':
      return <CardsBlock b={b} i={i} />
    default:
      return null
  }
}

export function BelowRest() {
  return (
    <>
      <Footer />
      <QuizDialog />
      <CookieNotice />
    </>
  )
}
