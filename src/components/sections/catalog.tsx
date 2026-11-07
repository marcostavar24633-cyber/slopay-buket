import { useMemo, useState } from 'react'
import { ArrowRight, ChevronDown, Flame, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionTitle } from '@/components/shared/section-title'
import { MaxIcon } from '@/components/shared/icons'
import { Lightbox } from '@/components/sections/gallery'
import { GALLERY_CATS, type GalleryCat } from '@/lib/gallery'
import { HITS, itemsOf, minPriceOf, type Item } from '@/lib/products'
import { MSG, maxLink } from '@/lib/config'
import { goal } from '@/lib/analytics'
import { scrollToId, useUI } from '@/lib/ui-store'
import { cn, rub } from '@/lib/utils'

const CATS = GALLERY_CATS.filter((c) => c.key !== 'all') as { key: GalleryCat; label: string }[]
/** Обложки категорий — по одной узнаваемой работе. */
const COVER: Record<GalleryCat, string> = {
  berry: '/img/real/berry/thumbs/yag-25.webp',
  meat: '/img/real/meat/thumbs/k-1.webp',
  sea: '/img/real/sea/thumbs/m-16.webp',
  dried: '/img/real/dried/thumbs/suh-11.webp',
  sweet: '/img/real/sweet/thumbs/sl-22.webp',
  snack: '/img/real/snack/thumbs/sn-3.webp',
}
const PAGE = 12

/** Карточка работы: фото, состав, примерная цена, «Заказать» и MAX. */
export function ItemCard({ item, onOpen, hit }: { item: Item; onOpen: () => void; hit?: boolean }) {
  const { openOrder } = useUI()
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-lift">
      <button onClick={onOpen} className="relative block aspect-square cursor-zoom-in overflow-hidden bg-cream-2" aria-label={`Открыть фото: ${item.title}`}>
        <img src={item.thumb} alt={`${item.title} — ${item.desc}`} loading="lazy" width={440} height={440} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        {hit && (
          <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-honey px-2.5 py-1 text-[11px] font-bold text-onaccent shadow-soft">
            <Flame className="h-3.5 w-3.5" /> Хит
          </span>
        )}
      </button>
      <div className="flex flex-1 flex-col p-3.5 md:p-4">
        <p className="text-[11.5px] font-bold uppercase tracking-[0.1em] text-honey-600">{item.title}</p>
        <p className="mt-1 text-[13.5px] leading-snug text-ink-soft">{item.desc}</p>
        <div className="mt-auto pt-3">
          <p className="text-[12px] font-semibold text-muted">примерная цена</p>
          <p className="text-[22px] font-extrabold leading-none tracking-tight">от {rub(item.price)}</p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" className="h-11 min-w-0 flex-1" onClick={() => openOrder(item)}>
              Заказать
            </Button>
            <a
              href={maxLink(MSG.product(`${item.title}, ${item.id}`))}
              target="_blank"
              rel="noopener"
              onClick={() => goal('max_click', { from: hit ? 'hit' : 'catalog', item: item.id })}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-max/10 text-max transition hover:bg-max hover:text-white"
              aria-label={`Спросить в MAX: ${item.title}`}
            >
              <MaxIcon className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </article>
  )
}

/** Раздел «Хит продаж»: по 2 работы из каждой категории. */
export function Hits() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <section id="hits" className="relative py-14 md:py-24">
      <div className="container-x">
        <SectionTitle
          eyebrow="Самые популярные"
          title={
            <>
              <Flame className="mb-1.5 mr-1 inline h-8 w-8 text-honey md:h-11 md:w-11" aria-hidden />
              Хит продаж — <span className="italic text-gold">заказывают чаще всего</span>
            </>
          }
          sub="По две самые популярные работы из каждой категории. Цены примерные — точную назовём после согласования состава."
        />
        <div className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">
          {HITS.map((it, i) => (
            <ItemCard key={it.id} item={it} hit onOpen={() => setOpen(i)} />
          ))}
        </div>
      </div>
      <Lightbox list={HITS} index={open} onIndex={setOpen} />
    </section>
  )
}

/** Каталог: категории → все работы выбранной категории с составом и ценой. */
export function Catalog() {
  const [cat, setCat] = useState<GalleryCat | null>(null)
  const [showAll, setShowAll] = useState(false)
  const [open, setOpen] = useState<number | null>(null)
  const list = useMemo(() => (cat ? itemsOf(cat) : []), [cat])
  const visible = showAll ? list : list.slice(0, PAGE)

  const pick = (c: GalleryCat) => {
    goal('catalog_category', { cat: c })
    setShowAll(false)
    if (cat === c) return setCat(null)
    setCat(c)
    setTimeout(() => scrollToId('catalog-list'), 60)
  }

  return (
    <section id="catalog" className="relative py-14 md:py-24">
      <div className="container-x">
        <SectionTitle
          eyebrow="Каталог"
          title={
            <>
              Выберите категорию — <span className="italic text-gold">покажем все наши работы</span>
            </>
          }
          sub="Под каждым фото — состав и примерная цена. Соберём такой же или похожий под ваш бюджет."
        />

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5" role="tablist" aria-label="Категории">
          {CATS.map((c) => {
            const active = cat === c.key
            return (
              <button
                key={c.key}
                role="tab"
                aria-selected={active}
                onClick={() => pick(c.key)}
                className={cn(
                  'group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-3xl text-left ring-1 transition md:aspect-[16/10]',
                  active ? 'ring-4 ring-honey' : 'ring-line hover:ring-honey/60',
                )}
              >
                <img src={COVER[c.key]} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                <span className="absolute inset-x-3 bottom-3 text-white md:inset-x-5 md:bottom-4">
                  <span className="block font-display text-[17px] font-semibold leading-tight md:text-[26px]">{c.label}</span>
                  <span className="mt-1 flex flex-wrap items-center gap-x-2 text-[12px] font-semibold text-white/80 md:text-[14px]">
                    <span>{itemsOf(c.key).length} работ</span>
                    <span className="text-[#f3d98a]">от {rub(minPriceOf(c.key))}</span>
                  </span>
                </span>
                <span className={cn('absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-black/55 text-white backdrop-blur transition', active && 'rotate-180 bg-honey text-onaccent')}>
                  <ChevronDown className="h-5 w-5" />
                </span>
              </button>
            )
          })}
        </div>

        <div id="catalog-list" className="scroll-mt-24">
          {cat ? (
            <div className="mt-8">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
                <h3 className="font-display text-[22px] font-semibold leading-tight md:text-[32px]">
                  {CATS.find((c) => c.key === cat)?.label} <span className="text-muted">· {list.length}</span>
                </h3>
                <button onClick={() => setCat(null)} className="min-h-11 cursor-pointer text-[14px] font-bold text-honey-600 underline underline-offset-4">
                  Свернуть
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">
                {visible.map((it, i) => (
                  <ItemCard key={it.id} item={it} onOpen={() => setOpen(i)} />
                ))}
              </div>
              {!showAll && list.length > PAGE && (
                <div className="mt-8 flex justify-center">
                  <Button variant="outline" size="lg" onClick={() => setShowAll(true)}>
                    Показать ещё {list.length - PAGE}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <p className="mt-5 flex items-center gap-2 text-[14px] font-semibold text-ink-soft">
              <ArrowRight className="h-4 w-4 shrink-0 text-honey" /> Нажмите на категорию, чтобы увидеть все работы с составом и ценой
            </p>
          )}
        </div>

        <CustomBanner />
      </div>
      <Lightbox list={list} index={open} onIndex={setOpen} />
    </section>
  )
}

function CustomBanner() {
  return (
    <div className="relative mt-10 flex flex-col items-start gap-4 overflow-hidden rounded-3xl border border-honey/25 bg-panel p-6 md:flex-row md:items-center md:justify-between md:p-8">
      <div aria-hidden className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-honey/25 blur-3xl" />
      <div className="relative">
        <p className="font-display text-[24px] font-semibold leading-tight">Не нашли подходящий?</p>
        <p className="mt-1 text-[15px] text-ink/75">Соберём индивидуальный букет по вашему фото или списку любимых продуктов получателя.</p>
      </div>
      <a
        href={maxLink(MSG.custom)}
        target="_blank"
        rel="noopener"
        onClick={() => goal('max_click', { from: 'custom' })}
        className="relative inline-flex h-12 w-full shrink-0 items-center justify-center gap-2 rounded-full bg-honey px-6 font-bold text-onaccent transition hover:bg-honey-600 md:w-auto"
      >
        <Plus className="h-5 w-5" /> Собрать свой букет
      </a>
    </div>
  )
}
