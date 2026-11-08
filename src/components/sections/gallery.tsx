import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { Button } from '@/components/ui/button'
import { MaxIcon, TelegramIcon } from '@/components/shared/icons'
import { CAT_LABEL, type GalleryPhoto } from '@/lib/gallery'
import { SITE, maxLink, tgLink } from '@/lib/config'
import { copyNow } from '@/lib/copy'
import { itemBySrc } from '@/lib/products'
import { useUI } from '@/lib/ui-store'
import { rub } from '@/lib/utils'
import { goal } from '@/lib/analytics'

type Shot = GalleryPhoto | { src: string; w: number; h: number }
const isPhoto = (p: Shot | null): p is GalleryPhoto => !!p && 'cat' in p

/** Просмотр фото на весь экран: стрелки, клавиатура, свайп, «Заказать», MAX и Telegram (текст заказа со ссылкой на фото копируется). */
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

  const { openOrder } = useUI()
  const p = index !== null ? list[index] : null
  const item = isPhoto(p) ? itemBySrc(p.src) : undefined
  const orderText = item ? `Здравствуйте! Хочу заказать букет «${item.name}» (${item.title.toLowerCase()})\n${SITE.photoBase}${item.id}.jpg` : ''
  const toChat = (to: 'max' | 'tg') => {
    if (!item) return
    goal(to === 'max' ? 'max_click' : 'tg_click', { from: 'lightbox', product: item.id })
    copyNow(orderText)
  }

  return (
    <DialogPrimitive.Root open={index !== null} onOpenChange={(v) => !v && onIndex(null)}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[90] bg-black/90 backdrop-blur-sm data-[state=open]:animate-[fade-in_200ms_ease-out]" />
        <DialogPrimitive.Content className="fixed inset-0 z-[91] flex flex-col items-center justify-center p-3 outline-none md:p-8">
          <DialogPrimitive.Title className="sr-only">Просмотр фото</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">Листайте стрелками или свайпом</DialogPrimitive.Description>
          <div
            className={`relative flex w-full max-w-5xl items-center justify-center ${cta ? "md:max-h-[78dvh] md:flex-1" : "max-h-[78dvh] flex-1"}`}
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
                  className={`max-w-full select-none rounded-2xl object-contain shadow-lift ${cta ? "max-h-[56dvh] md:max-h-[78dvh]" : "max-h-[78dvh]"}`}
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
          <div className="mt-3 flex w-full max-w-5xl flex-col gap-3 text-white md:mt-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0 md:flex-1">
              <p className="text-sm text-white/70">
                {index !== null && `${index + 1} / ${list.length}`}
                {isPhoto(p) && ` · ${CAT_LABEL[p.cat]}`}
              </p>
              {cta && item && (
                <p className="mt-1 text-[14px] leading-snug text-white">
                  <b className="font-display text-[17px]">«{item.name}»</b> — {item.desc} · <b className="text-[#f3d98a]">от {rub(item.price)}</b>
                </p>
              )}
            </div>
            {cta && item && (
              <div className="grid w-full grid-cols-3 gap-2 md:flex md:w-auto md:shrink-0">
                <Button
                  onClick={() => {
                    onIndex(null)
                    setTimeout(() => openOrder(item), 150)
                  }}
                >
                  Заказать
                </Button>
                <Button variant="max" asChild>
                  <a href={maxLink()} target="_blank" rel="noopener" onClick={() => toChat('max')} aria-label="Написать в MAX">
                    <MaxIcon className="h-5 w-5" /> MAX
                  </a>
                </Button>
                <Button variant="tg" asChild>
                  <a href={tgLink(orderText)} target="_blank" rel="noopener" onClick={() => toChat('tg')} aria-label="Написать в Telegram">
                    <TelegramIcon className="h-5 w-5" /> Telegram
                  </a>
                </Button>
              </div>
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
