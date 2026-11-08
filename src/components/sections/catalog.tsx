import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, ChevronDown, Flame } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionTitle } from '@/components/shared/section-title'
import { MessengerButtons } from '@/components/shared/messenger-buttons'
import { Lightbox } from '@/components/sections/gallery'
import { GALLERY_CATS, type GalleryCat } from '@/lib/gallery'
import { HITS, ITEMS, PRICE_TABS, RECIPIENT_CATS, RECIPIENT_TABS, itemsOf, minPriceOf, type Item, type Recipient } from '@/lib/products'
import { MSG } from '@/lib/config'
import { goal } from '@/lib/analytics'
import { scrollToId, useUI } from '@/lib/ui-store'
import { cn, rub } from '@/lib/utils'

const CATS = (GALLERY_CATS.filter((c) => c.key !== 'all') as { key: GalleryCat; label: string }[]).filter((c) => itemsOf(c.key).length > 0)
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

/** Карточка работы: фото, состав, примерная цена, «Заказать». */
export function ItemCard({ item, onOpen, hit }: { item: Item; onOpen: () => void; hit?: boolean }) {
  const { openOrder } = useUI()
  return (
    <article className="run-border group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-lift">
      <button onClick={onOpen} className="relative block aspect-square cursor-zoom-in overflow-hidden bg-cream-2" aria-label={`Открыть фото: ${item.name}`}>
        <img loading="lazy" src={item.thumb} alt={`«${item.name}» — ${item.desc}`} width={440} height={440} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        {hit && (
          <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-honey px-2.5 py-1 text-[11px] font-bold text-onaccent shadow-soft">
            <Flame className="h-3.5 w-3.5" /> Хит
          </span>
        )}
      </button>
      <div className="flex flex-1 flex-col p-3.5 md:p-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-honey-600">{item.title}</p>
        <h3 className="mt-1 font-display text-[19px] font-semibold leading-tight md:text-[21px]">{item.name}</h3>
        <p className="mt-1.5 text-[13.5px] leading-snug text-ink-soft">{item.desc}</p>
        <div className="mt-auto pt-3">
          <p className="text-[12px] font-semibold text-muted">примерная цена</p>
          <p className="text-[22px] font-extrabold leading-none tracking-tight">от {rub(item.price)}</p>
          <div className="mt-3">
            <Button size="sm" className="h-11 w-full" onClick={() => openOrder(item)}>
              Заказать
            </Button>
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
        {/* на телефоне — лента, листается вбок; на компьютере — сетка */}
        <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-2 md:gap-5 md:overflow-visible md:px-0 lg:grid-cols-4">
          {HITS.map((it, i) => (
            <div key={it.id} className="w-[46%] shrink-0 snap-start md:w-auto">
              <ItemCard item={it} hit onOpen={() => setOpen(i)} />
            </div>
          ))}
        </div>
        <p className="mt-2 text-center text-[12.5px] font-semibold text-muted md:hidden">← листайте →</p>
      </div>
      <Lightbox list={HITS} index={open} onIndex={setOpen} />
    </section>
  )
}

/** Каталог: категории → все работы выбранной категории с составом и ценой. */
export function Catalog() {
  const [cat, setCat] = useState<GalleryCat | null>(null)
  const [who, setWho] = useState<Recipient | 'all'>('all')
  const [price, setPrice] = useState<(typeof PRICE_TABS)[number]['key']>('all')
  const [showAll, setShowAll] = useState(false)
  const [open, setOpen] = useState<number | null>(null)
  const filtered = who !== 'all' || price !== 'all'
  // блок «По поводам» открывает нужную категорию
  useEffect(() => {
    const on = (e: Event) => {
      const c = (e as CustomEvent<GalleryCat>).detail
      setWho('all')
      setPrice('all')
      setShowAll(false)
      setCat(c)
      setTimeout(() => scrollToId('catalog-list'), 60)
    }
    window.addEventListener('open-category', on)
    return () => window.removeEventListener('open-category', on)
  }, [])
  const list = useMemo(() => {
    if (!cat && !filtered) return []
    const r = PRICE_TABS.find((t) => t.key === price)!
    return (cat ? itemsOf(cat) : ITEMS)
      .filter((i) => who === 'all' || i.recipients.includes(who))
      .filter((i) => i.price >= r.min && i.price < r.max)
  }, [cat, who, price, filtered])
  const heading = cat ? CATS.find((c) => c.key === cat)?.label : 'Подборка по фильтрам'
  const resetFilters = () => {
    setWho('all')
    setPrice('all')
  }
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

        <div className="mb-4 rounded-3xl border border-line bg-surface/70 p-4 backdrop-blur md:p-5" aria-label="Кому букет">
          <FilterRow label="Кому" options={RECIPIENT_TABS} value={who} onChange={(v) => { setWho(v); setShowAll(false); if (v !== 'all' && cat && !RECIPIENT_CATS[v].includes(cat)) setCat(null); goal('catalog_filter', { who: v }) }} />
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5" role="tablist" aria-label="Категории">
          {CATS.filter((c) => who === 'all' || RECIPIENT_CATS[who].includes(c.key)).map((c) => {
            const active = cat === c.key
            return (
              <button
                key={c.key}
                role="tab"
                aria-selected={active}
                onClick={() => pick(c.key)}
                className={cn(
                  'run-border group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-3xl text-left ring-1 transition md:aspect-[16/10]',
                  active ? 'ring-4 ring-honey' : 'ring-line hover:ring-honey/60',
                )}
              >
                <img loading="lazy" src={COVER[c.key]} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
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

        <div className="mt-5 flex flex-col gap-3 rounded-3xl border border-line bg-surface/70 p-4 backdrop-blur md:p-5" aria-label="Фильтр по цене">
          <FilterRow label="Цена" options={PRICE_TABS} value={price} onChange={(v) => { setPrice(v); setShowAll(false); goal('catalog_filter', { price: v }) }} />
        </div>

        <div id="catalog-list" className="scroll-mt-24">
          {cat || filtered ? (
            <div className="mt-8">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
                <h3 className="font-display text-[22px] font-semibold leading-tight md:text-[32px]">
                  {heading} <span className="text-muted">· {list.length}</span>
                </h3>
                <div className="flex gap-4">
                  {filtered && (
                    <button onClick={resetFilters} className="min-h-11 cursor-pointer text-[14px] font-bold text-ink-soft underline underline-offset-4">
                      Сбросить фильтры
                    </button>
                  )}
                  <button onClick={() => { setCat(null); resetFilters() }} className="min-h-11 cursor-pointer text-[14px] font-bold text-honey-600 underline underline-offset-4">
                    Свернуть
                  </button>
                </div>
              </div>
              {list.length === 0 && (
                <p className="rounded-3xl border border-line bg-surface p-6 text-[15px] text-ink-soft">
                  Под эти условия готовых работ нет — но соберём под ваш запрос. Напишите нам или сбросьте фильтры.
                </p>
              )}
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
              <ArrowRight className="h-4 w-4 shrink-0 text-honey" /> Нажмите на категорию или выберите, кому и на какую сумму, — покажем подходящие работы
            </p>
          )}
        </div>

        <CustomBanner />
      </div>
      <Lightbox list={list} index={open} onIndex={setOpen} />
    </section>
  )
}

function FilterRow<K extends string>({ label, options, value, onChange }: { label: string; options: readonly { key: K; label: string }[]; value: K; onChange: (v: K) => void }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-12 shrink-0 text-[13px] font-bold text-muted">{label}</span>
      <div className="no-scrollbar -mr-4 flex gap-2 overflow-x-auto pr-4 md:mr-0 md:flex-wrap md:pr-0" role="radiogroup" aria-label={label}>
        {options.map((o) => (
          <button
            key={o.key}
            role="radio"
            aria-checked={value === o.key}
            onClick={() => onChange(o.key)}
            className={cn(
              'h-10 shrink-0 cursor-pointer rounded-full border px-3.5 text-[13.5px] font-semibold transition',
              value === o.key ? 'border-honey bg-honey text-onaccent' : 'border-line bg-cream hover:border-honey/60',
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
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
      <MessengerButtons row text={MSG.custom} from="custom" className="relative w-full shrink-0 md:w-[380px] [&_p]:text-ink/60" />
    </div>
  )
}
