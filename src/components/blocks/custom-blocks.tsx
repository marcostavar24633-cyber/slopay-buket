/**
 * Свои блоки, которые добавляются в админке (Блоки страницы → «Добавить блок»):
 * текст, фото + текст, баннер с кнопкой, галерея фото, карточки-преимущества.
 * Оформление — в стиле сайта: те же заголовки, отступы, цвета и золотые кнопки.
 */
import { useContext } from 'react'
import { ArrowRight, Sparkles } from 'lucide-react'
import { EditIndex, editableProps } from '@/components/edit/edit-frame'
import { SectionTitle } from '@/components/shared/section-title'
import { MessengerButtons } from '@/components/shared/messenger-buttons'
import { Button } from '@/components/ui/button'
import { BlurFade } from '@/components/magicui/blur-fade'
import { Markdown } from '@/components/blocks/markdown'
import type { Block, Cta } from '@/lib/content'
import { MSG } from '@/lib/config'
import { goal } from '@/lib/analytics'
import { useUI } from '@/lib/ui-store'
import { cn } from '@/lib/utils'

type Of<T extends Block['type']> = Extract<Block, { type: T }>

function BlockCta({ cta, from, center }: { cta?: Cta; from: string; center?: boolean }) {
  const { setQuizOpen } = useUI()
  if (!cta || cta === 'none') return null
  if (cta === 'messengers') return <MessengerButtons row size="md" text={MSG.final} from={from} className={cn('mt-6', center && 'justify-center')} />
  if (cta === 'quiz')
    return (
      <Button size="lg" className="mt-6" onClick={() => (goal('cta_block_quiz', { from }), setQuizOpen(true))}>
        <Sparkles className="h-5 w-5" /> Подобрать букет
      </Button>
    )
  return (
    <Button size="lg" className="mt-6" asChild>
      <a href="#catalog">
        Смотреть каталог <ArrowRight className="h-5 w-5" />
      </a>
    </Button>
  )
}

/** Безопасный id для ссылок вида #block-3 */
const sectionId = (i: number) => `block-${i + 1}`

export function TextBlock({ b, i }: { b: Of<'text'>; i: number }) {
  return (
    <section id={sectionId(i)} className="py-12 md:py-20">
      <div className={cn('container-x', b.center && 'text-center')}>
        {b.title && <SectionTitle eyebrow={b.eyebrow} title={b.title} center={b.center} className="mb-5 md:mb-6" />}
        <Markdown text={b.body} className={cn('max-w-3xl text-[16px] leading-relaxed text-ink-soft md:text-[17px]', b.center && 'mx-auto')} />
        <div className={cn(b.center && 'flex justify-center')}>
          <BlockCta cta={b.cta} from={sectionId(i)} center={b.center} />
        </div>
      </div>
    </section>
  )
}

export function ImageTextBlock({ b, i }: { b: Of<'imageText'>; i: number }) {
  return (
    <section id={sectionId(i)} className="py-12 md:py-20">
      <div className="container-x grid items-center gap-6 md:grid-cols-2 md:gap-12">
        {b.image && (
          <BlurFade className={cn('overflow-hidden rounded-[28px] ring-1 ring-honey/25 shadow-lift', b.imageRight && 'md:order-2')}>
            <img src={b.image} alt={b.title ?? ''} loading="lazy" className="aspect-[4/3] h-full w-full object-cover" />
          </BlurFade>
        )}
        <div>
          {b.title && <SectionTitle eyebrow={b.eyebrow} title={b.title} className="mb-4 md:mb-5" />}
          <Markdown text={b.body} className="text-[16px] leading-relaxed text-ink-soft md:text-[17px]" />
          <BlockCta cta={b.cta} from={sectionId(i)} />
        </div>
      </div>
    </section>
  )
}

export function BannerBlock({ b, i }: { b: Of<'banner'>; i: number }) {
  const ei = useContext(EditIndex)
  return (
    <section id={sectionId(i)} className="py-10 md:py-14">
      <div className="container-x">
        <div className="relative overflow-hidden rounded-[32px] border border-honey/30 bg-panel p-6 md:p-12">
          {b.image && (
            <>
              <img src={b.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
              <span aria-hidden className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/20" />
            </>
          )}
          <div className={cn('relative max-w-2xl', b.image && 'text-white')}>
            {b.title && (
              <h2 key={b.title} className="h-display text-[28px] leading-tight md:text-[44px]" {...editableProps(ei, 'title')}>
                {b.title}
              </h2>
            )}
            <Markdown text={b.body} className={cn('mt-3 text-[16px] leading-relaxed md:text-[18px]', b.image ? 'text-white/80' : 'text-ink-soft')} />
            <BlockCta cta={b.cta ?? 'messengers'} from={sectionId(i)} />
          </div>
        </div>
      </div>
    </section>
  )
}

export function GalleryBlock({ b, i }: { b: Of<'gallery'>; i: number }) {
  const imgs = (b.images ?? []).filter((x) => x.image)
  return (
    <section id={sectionId(i)} className="py-12 md:py-20">
      <div className="container-x">
        {b.title && <SectionTitle eyebrow={b.eyebrow} title={b.title} sub={b.body} />}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
          {imgs.map((x, k) => (
            <figure key={k} className="overflow-hidden rounded-3xl border border-line bg-surface">
              <img src={x.image} alt={x.caption ?? ''} loading="lazy" className="aspect-square w-full object-cover" />
              {x.caption && <figcaption className="px-3.5 py-2.5 text-[13.5px] font-semibold">{x.caption}</figcaption>}
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

export function CardsBlock({ b, i }: { b: Of<'cards'>; i: number }) {
  return (
    <section id={sectionId(i)} className="py-12 md:py-20">
      <div className="container-x">
        {b.title && <SectionTitle eyebrow={b.eyebrow} title={b.title} sub={b.body} />}
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(b.cards ?? []).map((c, k) => (
            <li key={k} className="flex gap-3 rounded-3xl border border-line bg-surface p-5">
              {c.icon && <span className="text-[26px] leading-none">{c.icon}</span>}
              <span>
                <b className="block text-[16px] font-extrabold">{c.title}</b>
                {c.text && <span className="mt-1 block text-[14px] leading-relaxed text-ink-soft">{c.text}</span>}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
