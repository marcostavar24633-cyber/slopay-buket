import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Camera, Plus, Ruler, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionTitle } from '@/components/shared/section-title'
import { WhatsAppIcon } from '@/components/shared/icons'
import { PRICE_TABS, PRODUCTS, RECIPIENT_TABS, TYPE_TABS, type Product, type Size } from '@/lib/products'
import { WA, waLink } from '@/lib/config'
import { goal } from '@/lib/analytics'
import { useUI } from '@/lib/ui-store'
import { cn, rub } from '@/lib/utils'

type Group = 'recipient' | 'type' | 'price'
const GROUPS: { key: Group; label: string }[] = [
  { key: 'recipient', label: 'Кому' },
  { key: 'type', label: 'Состав' },
  { key: 'price', label: 'Цена' },
]
const PAGE = 8

export function Catalog() {
  const [group, setGroup] = useState<Group>('recipient')
  const [filter, setFilter] = useState<string>('all')
  const [showAll, setShowAll] = useState(false)

  const tabs = group === 'recipient' ? RECIPIENT_TABS : group === 'type' ? [{ key: 'all', label: 'Все' }, ...TYPE_TABS] : [{ key: 'all', label: 'Все' }, ...PRICE_TABS]

  const list = useMemo(() => {
    if (filter === 'all') return PRODUCTS
    if (group === 'recipient') {
      if (filter === 'newyear') return PRODUCTS.filter((p) => p.occasions?.includes('newyear'))
      return PRODUCTS.filter((p) => p.recipients.includes(filter as Product['recipients'][number]))
    }
    if (group === 'type') return PRODUCTS.filter((p) => p.type === filter)
    const r = PRICE_TABS.find((t) => t.key === filter)!
    return PRODUCTS.filter((p) => p.sizes.some((s) => s.price >= r.min && s.price < r.max))
  }, [group, filter])

  const visible = showAll ? list : list.slice(0, PAGE)

  return (
    <section id="catalog" className="relative py-14 md:py-24">
      <div className="container-x">
        <SectionTitle
          eyebrow="Каталог"
          title={
            <>
              Выберите букет — <span className="italic text-gold">или соберём под ваш бюджет</span>
            </>
          }
          sub="Цены за готовый букет с упаковкой. Размер и состав можно поменять — пересчитаем честно."
        />

        {/* Фильтры */}
        <div className="sticky top-14 z-30 -mx-4 mb-6 bg-cream/90 px-4 py-3 backdrop-blur-xl md:top-16 md:mx-0 md:rounded-3xl md:px-0">
          <div className="mb-3 inline-flex rounded-full border border-line bg-surface p-1" role="tablist" aria-label="Тип фильтра">
            {GROUPS.map((g) => (
              <button
                key={g.key}
                role="tab"
                aria-selected={group === g.key}
                onClick={() => {
                  setGroup(g.key)
                  setFilter('all')
                }}
                className={cn(
                  'h-9 cursor-pointer rounded-full px-4 text-[13px] font-bold transition',
                  group === g.key ? 'bg-honey text-onaccent' : 'text-ink-soft hover:text-ink',
                )}
              >
                {g.label}
              </button>
            ))}
          </div>
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => {
                  setFilter(t.key)
                  setShowAll(false)
                  goal('catalog_filter', { group, value: t.key })
                }}
                className={cn(
                  'h-11 shrink-0 cursor-pointer rounded-full border px-4 text-sm font-semibold transition',
                  filter === t.key ? 'border-honey bg-honey text-onaccent' : 'border-line bg-surface hover:border-ink/40',
                  t.key === 'newyear' && filter !== t.key && 'border-honey/60 bg-honey-100',
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <motion.div layout className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {visible.map((p) => (
              <motion.div key={p.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.25 }}>
                <ProductCard product={p} />
              </motion.div>
            ))}
            {(showAll || list.length <= PAGE) && (
              <motion.div key="custom" layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <CustomCard />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {list.length === 0 && <p className="py-10 text-center text-ink-soft">В этой категории пока пусто — но мы соберём букет под ваш запрос.</p>}

        {!showAll && list.length > PAGE && (
          <div className="mt-8 flex justify-center">
            <Button variant="outline" size="lg" onClick={() => setShowAll(true)}>
              Показать ещё {list.length - PAGE}
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}

const BADGE: Record<Product['badges'][number], { label: string; cls: string }> = {
  hit: { label: '🔥 Хит продаж', cls: 'bg-honey text-onaccent' },
  today: { label: 'Можно сегодня', cls: 'bg-surface text-green-400' },
  men: { label: 'Для мужчин', cls: 'bg-surface text-ink' },
  new: { label: 'Новинка', cls: 'bg-honey text-onaccent' },
  season: { label: '🎄 Новый год', cls: 'bg-surface text-berry' },
}

function ProductCard({ product }: { product: Product }) {
  const { openOrder } = useUI()
  const defaultSize = product.sizes.find((s) => s.key === 'M') ?? product.sizes[0]
  const [size, setSize] = useState<Size>(defaultSize)
  const [slide, setSlide] = useState(0)
  const scroller = useRef<HTMLDivElement>(null)

  // scroll-snap может «прилипнуть» ко второму слайду, пока грузится первое фото — возвращаем на первый
  const resetSlide = () => {
    if (scroller.current) scroller.current.scrollLeft = 0
    setSlide(0)
  }
  useEffect(resetSlide, [])

  const onScroll = () => {
    const el = scroller.current
    if (el) setSlide(Math.round(el.scrollLeft / el.clientWidth))
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-lift">
      <div className="relative aspect-[4/3] overflow-hidden bg-cream-2 sm:aspect-square">
        {/* мобильный: свайп; десктоп: второе фото по наведению */}
        <div ref={scroller} onScroll={onScroll} className="no-scrollbar flex h-full snap-x snap-mandatory overflow-x-auto md:overflow-hidden">
          <img src={product.image} alt={product.name} loading="lazy" onLoad={resetSlide} width={720} height={720} className="h-full w-full shrink-0 snap-start object-cover transition duration-500 md:group-hover:opacity-0" />
          {product.alt && (
            <img
              src={product.alt}
              alt={`Похожая работа — ${product.name}`}
              loading="lazy"
              width={720}
              height={720}
              className="h-full w-full shrink-0 snap-start object-cover md:absolute md:inset-0 md:opacity-0 md:transition md:duration-500 md:group-hover:opacity-100"
            />
          )}
        </div>
        <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap gap-1.5">
          {product.badges.slice(0, 2).map((b) => (
            <span key={b} className={cn('rounded-full px-2.5 py-1 text-[11px] font-bold shadow-soft', BADGE[b].cls)}>
              {BADGE[b].label}
            </span>
          ))}
        </div>
        <span className="pointer-events-none absolute bottom-3 right-3 hidden items-center gap-1 rounded-full bg-scrim/90 px-2.5 py-1 text-[11px] font-bold text-ink-soft shadow-soft backdrop-blur md:inline-flex">
          <Camera className="h-3 w-3" /> Реальное фото
        </span>
        {product.alt && (
          <span className="pointer-events-none absolute bottom-3 left-3 hidden rounded-full bg-scrim/90 px-2.5 py-1 text-[11px] font-bold text-ink-soft opacity-0 shadow-soft backdrop-blur transition group-hover:opacity-100 md:inline-flex">
            Похожая работа
          </span>
        )}
        <div className={cn('pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 md:hidden', !product.alt && 'hidden')}>
          {[0, 1].map((i) => (
            <span key={i} className={cn('h-1.5 rounded-full bg-surface shadow transition-all', slide === i ? 'w-5' : 'w-1.5 opacity-60')} />
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4 md:p-5">
        <h3 className="font-display text-[22px] font-semibold leading-tight">{product.name}</h3>
        <p className="mt-1.5 line-clamp-2 text-[13.5px] leading-snug text-ink-soft">
          <b className="font-bold text-ink">{size.note}.</b> {product.composition}
        </p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] font-semibold text-muted">
          <span className="inline-flex items-center gap-1">
            <Ruler className="h-3.5 w-3.5" /> {size.dims}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" /> на {size.persons} чел.
          </span>
        </div>

        <div className="mt-auto pt-4">
          <div className="flex items-end justify-between gap-2">
            <p className="text-[26px] font-extrabold leading-none tracking-tight">{rub(size.price)}</p>
            {product.sizes.length > 1 && (
              <div className="flex rounded-full bg-cream-2 p-1" role="radiogroup" aria-label="Размер">
                {product.sizes.map((s) => (
                  <button
                    key={s.key}
                    role="radio"
                    aria-checked={s.key === size.key}
                    onClick={() => setSize(s)}
                    className={cn(
                      'h-8 w-9 cursor-pointer rounded-full text-[13px] font-bold transition',
                      s.key === size.key ? 'bg-surface text-ink shadow-soft' : 'text-muted hover:text-ink',
                    )}
                  >
                    {s.key}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="mt-4 flex gap-2">
            <Button className="flex-1" onClick={() => openOrder(product, size)}>
              Заказать
            </Button>
            <a
              href={waLink(WA.product(product.name))}
              target="_blank"
              rel="noopener"
              onClick={() => goal('wa_click', { from: 'card', product: product.name })}
              className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-wa/10 text-wa transition hover:bg-wa hover:text-white"
              aria-label={`Спросить про «${product.name}» в WhatsApp`}
            >
              <WhatsAppIcon className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </article>
  )
}

function CustomCard() {
  return (
    <div className="relative flex h-full min-h-[420px] flex-col justify-between overflow-hidden rounded-3xl bg-panel text-ink border border-honey/25 p-6">
      <div aria-hidden className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-honey/30 blur-3xl" />
      <div className="relative">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/10 text-3xl">🎨</span>
        <h3 className="mt-5 font-display text-[26px] font-semibold leading-tight">Не нашли свой?</h3>
        <p className="mt-3 text-[15px] leading-relaxed text-ink/75">
          Соберём индивидуальный букет по вашему фото или списку любимых продуктов получателя.
        </p>
      </div>
      <a
        href={waLink(WA.custom)}
        target="_blank"
        rel="noopener"
        onClick={() => goal('wa_click', { from: 'custom-card' })}
        className="relative mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-honey font-bold text-onaccent transition hover:bg-honey-600"
      >
        <Plus className="h-5 w-5" /> Собрать свой букет
      </a>
    </div>
  )
}
