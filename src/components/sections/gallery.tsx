import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { SectionTitle } from '@/components/shared/section-title'
import { BlurFade } from '@/components/magicui/blur-fade'
import { Button } from '@/components/ui/button'
import { MaxIcon } from '@/components/shared/icons'
import { CAT_LABEL, GALLERY, GALLERY_CATS, type GalleryCat, type GalleryPhoto } from '@/lib/gallery'
import { maxLink } from '@/lib/config'
import { goal } from '@/lib/analytics'
import { cn } from '@/lib/utils'

const PAGE = 24

type Shot = GalleryPhoto | { src: string; w: number; h: number }
const isPhoto = (p: Shot | null): p is GalleryPhoto => !!p && 'cat' in p

export function Gallery() {
  const [cat, setCat] = useState<GalleryCat | 'all'>('all')
  const [showAll, setShowAll] = useState(false)
  const [open, setOpen] = useState<number | null>(null)

  const list = useMemo(() => (cat === 'all' ? GALLERY : GALLERY.filter((p) => p.cat === cat)), [cat])
  const visible = showAll ? list : list.slice(0, PAGE)

  return (
    <section id="gallery" className="py-14 md:py-24">
      <div className="container-x">
        <SectionTitle
          eyebrow="Наши работы"
          title={
            <>
              Реальные фото — <span className="italic text-gold">не картинки из интернета</span>
            </>
          }
          sub={`${GALLERY.length} работ нашей мастерской. Понравилась какая-то — нажмите «Хочу такой», соберём похожий под ваш бюджет.`}
        />

        <div className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0" role="tablist" aria-label="Категории работ">
          {GALLERY_CATS.map((c) => {
            const n = c.key === 'all' ? GALLERY.length : GALLERY.filter((p) => p.cat === c.key).length
            return (
              <button
                key={c.key}
                role="tab"
                aria-selected={cat === c.key}
                onClick={() => {
                  setCat(c.key)
                  setShowAll(false)
                  goal('gallery_filter', { cat: c.key })
                }}
                className={cn(
                  'h-11 shrink-0 cursor-pointer rounded-full border px-4 text-sm font-semibold transition',
                  cat === c.key ? 'border-honey bg-honey text-onaccent' : 'border-line bg-surface hover:border-honey/60',
                )}
              >
                {c.label} <span className="opacity-60">{n}</span>
              </button>
            )
          })}
        </div>

        <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6 md:gap-2 lg:grid-cols-8">
          {visible.map((p, i) => (
            <BlurFade key={p.src} delay={(i % 8) * 0.03} y={8}>
              <button
                onClick={() => {
                  setOpen(i)
                  goal('gallery_open', { src: p.src })
                }}
                className="group relative block aspect-square w-full cursor-zoom-in overflow-hidden rounded-xl bg-surface ring-1 ring-line"
                aria-label={`Открыть фото: ${CAT_LABEL[p.cat]}, №${GALLERY.indexOf(p) + 1}`}
              >
                <img src={p.thumb} alt={`${CAT_LABEL[p.cat]} — работа мастерской`} loading="lazy" decoding="async" width={220} height={220} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                <Expand className="absolute right-1.5 top-1.5 h-6 w-6 rounded-full bg-scrim/70 p-1.5 text-ink opacity-0 transition group-hover:opacity-100" />
              </button>
            </BlurFade>
          ))}
        </div>

        {!showAll && list.length > PAGE && (
          <div className="mt-8 flex justify-center">
            <Button variant="outline" size="lg" onClick={() => setShowAll(true)}>
              Показать ещё {list.length - PAGE} фото
            </Button>
          </div>
        )}
      </div>

      <Lightbox list={list} index={open} onIndex={setOpen} />
    </section>
  )
}

/** Все работы одной категории — открывается из карточки каталога. */
export function CategoryDialog({ cat, onClose }: { cat: GalleryCat | null; onClose: () => void }) {
  const [open, setOpen] = useState<number | null>(null)
  const list = useMemo(() => (cat ? GALLERY.filter((p) => p.cat === cat) : []), [cat])
  const title = GALLERY_CATS.find((c) => c.key === cat)?.label ?? ''
  return (
    <>
      <DialogPrimitive.Root open={!!cat} onOpenChange={(v) => !v && onClose()}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-[85] bg-black/70 backdrop-blur-sm data-[state=open]:animate-[fade-in_200ms_ease-out]" />
          <DialogPrimitive.Content
            aria-describedby={undefined}
            className="fixed inset-x-0 bottom-0 top-[6dvh] z-[86] flex flex-col overflow-hidden rounded-t-3xl bg-cream shadow-lift outline-none data-[state=open]:animate-[slide-in_260ms_ease-out] md:inset-x-auto md:left-1/2 md:top-1/2 md:bottom-auto md:max-h-[88dvh] md:w-[min(1100px,calc(100%-48px))] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-3xl"
          >
            <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4 md:px-7">
              <div>
                <DialogPrimitive.Title className="font-display text-[22px] font-semibold leading-tight md:text-[26px]">{title}</DialogPrimitive.Title>
                <p className="text-[13px] text-muted">{list.length} работ мастерской · нажмите на фото, чтобы увеличить</p>
              </div>
              <DialogPrimitive.Close className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full bg-surface text-ink shadow-soft hover:bg-cream-2" aria-label="Закрыть">
                <X className="h-5 w-5" />
              </DialogPrimitive.Close>
            </div>
            <div className="flex-1 overflow-y-auto p-3 md:p-5">
              <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 md:gap-2 lg:grid-cols-6">
                {list.map((p, i) => (
                  <button
                    key={p.src}
                    onClick={() => setOpen(i)}
                    className="group relative block aspect-square w-full cursor-zoom-in overflow-hidden rounded-xl bg-surface ring-1 ring-line"
                    aria-label={`Открыть фото №${i + 1}`}
                  >
                    <img src={p.thumb} alt={`${CAT_LABEL[p.cat]} — работа мастерской`} loading="lazy" decoding="async" width={220} height={220} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  </button>
                ))}
              </div>
            </div>
            <div className="border-t border-line p-3 md:px-7">
              <Button variant="max" className="w-full md:w-auto" asChild>
                <a href={maxLink()} target="_blank" rel="noopener" onClick={() => goal('max_click', { from: 'category', cat })}>
                  <MaxIcon className="h-5 w-5" /> Обсудить заказ в MAX
                </a>
              </Button>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
      <Lightbox list={list} index={open} onIndex={setOpen} />
    </>
  )
}

/** Просмотр фото на весь экран: стрелки, клавиатура, свайп, CTA в MAX. */
export function Lightbox({
  list,
  index,
  onIndex,
  cta = true,
}: {
  list: Shot[]
  index: number | null
  onIndex: (i: number | null) => void
  cta?: boolean
}) {
  const [dir, setDir] = useState(0)
  const startX = useRef<number | null>(null)
  const go = useCallback(
    (d: number) => {
      if (index === null) return
      setDir(d)
      onIndex((index + d + list.length) % list.length)
    },
    [index, list.length, onIndex],
  )

  useEffect(() => {
    if (index === null) return
    const on = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [index, go])

  const p = index !== null ? list[index] : null
  const num = isPhoto(p) ? GALLERY.indexOf(p) + 1 : null

  return (
    <DialogPrimitive.Root open={index !== null} onOpenChange={(v) => !v && onIndex(null)}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[90] bg-black/90 backdrop-blur-sm data-[state=open]:animate-[fade-in_200ms_ease-out]" />
        <DialogPrimitive.Content className="fixed inset-0 z-[91] flex flex-col items-center justify-center p-3 outline-none md:p-8">
          <DialogPrimitive.Title className="sr-only">Просмотр фото</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">Листайте стрелками или свайпом</DialogPrimitive.Description>
          <div
            className="relative flex max-h-[78dvh] w-full max-w-5xl flex-1 items-center justify-center"
            onPointerDown={(e) => (startX.current = e.clientX)}
            onPointerUp={(e) => {
              if (startX.current === null) return
              const dx = e.clientX - startX.current
              if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1)
              startX.current = null
            }}
          >
            <AnimatePresence mode="popLayout" initial={false} custom={dir}>
              {p && (
                <motion.img
                  key={p.src}
                  src={p.src}
                  alt=""
                  custom={dir}
                  initial={{ opacity: 0, x: dir * 60 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: dir * -60 }}
                  transition={{ duration: 0.25 }}
                  draggable={false}
                  className="max-h-[78dvh] max-w-full select-none rounded-2xl object-contain shadow-lift"
                />
              )}
            </AnimatePresence>
            {list.length > 1 && (
              <>
                <button onClick={() => go(-1)} aria-label="Предыдущее фото" className="absolute left-0 top-1/2 grid h-12 w-12 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-black/60 text-white ring-1 ring-white/20 hover:bg-black/80 md:-left-4">
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button onClick={() => go(1)} aria-label="Следующее фото" className="absolute right-0 top-1/2 grid h-12 w-12 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-black/60 text-white ring-1 ring-white/20 hover:bg-black/80 md:-right-4">
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>
          <div className="mt-4 flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 text-white">
            <p className="text-sm text-white/70">
              {index !== null && `${index + 1} / ${list.length}`}
              {isPhoto(p) && ` · ${CAT_LABEL[p.cat]}`}
            </p>
            {cta && isPhoto(p) && (
              <Button variant="max" asChild>
                <a
                  href={maxLink(`Здравствуйте! Хочу такой же: ${CAT_LABEL[p.cat]}, фото №${num} (${location.origin}${p.src}). Сколько будет стоить?`)}
                  target="_blank"
                  rel="noopener"
                  onClick={() => goal('max_click', { from: 'gallery', src: p.src })}
                >
                  <MaxIcon className="h-5 w-5" /> Хочу такой — узнать цену
                </a>
              </Button>
            )}
          </div>
          <DialogPrimitive.Close className="absolute right-3 top-3 grid h-11 w-11 cursor-pointer place-items-center rounded-full bg-black/60 text-white ring-1 ring-white/20 hover:bg-black/80" aria-label="Закрыть">
            <X className="h-5 w-5" />
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
