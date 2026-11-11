import { useState } from 'react'
import { Menu, Phone, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { StatusPill } from '@/components/shared/status-pill'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { TelegramIcon, MaxIcon } from '@/components/shared/icons'
import { useScrolled } from '@/hooks/use-scrolled'
import { SITE, MSG, tgLink, maxLink } from '@/lib/config'
import { goal } from '@/lib/analytics'
import { scrollToId } from '@/lib/ui-store'
import { cn } from '@/lib/utils'

const NAV: { id: string; label: string; href?: string }[] = [
  { id: 'hits', label: 'Хиты' },
  { id: 'catalog', label: 'Каталог' },
  { id: 'reviews', label: 'Отзывы' },
  { id: 'delivery', label: 'Доставка' },
  { id: 'corporate', label: 'Компаниям', href: 'corporate/' },
]

export function Logo({ light }: { light?: boolean }) {
  return (
    <a href="#top" className="group flex min-h-11 min-w-0 items-center gap-2 md:shrink-0 md:gap-2.5" title="На главную">
      <img
        src="/logo-256.webp"
        alt={`Логотип «${SITE.brand}»`}
        width={48}
        height={48}
        className="h-10 w-10 shrink-0 rounded-full shadow-soft ring-1 ring-honey/30 transition duration-500 group-hover:rotate-[-10deg] md:h-12 md:w-12"
      />
      <span className="leading-none">
        <span className={cn('block font-display text-[17px] font-bold italic tracking-tight md:text-[19px]', light ? 'text-white' : 'text-ink')}>
          {SITE.brand}
        </span>
        <span className={cn('mt-1 block whitespace-nowrap text-[11px] font-semibold md:text-[12px]', light ? 'text-white/60' : 'text-muted')}>
          <span className="max-sm:hidden">{SITE.tagline}</span><span className="sm:hidden">Букеты</span> · <span className={light ? 'text-white' : 'text-ink'}>{SITE.city}</span>
        </span>
      </span>
    </a>
  )
}

export function Header() {
  const scrolled = useScrolled(40)
  const [open, setOpen] = useState(false)

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b transition-all duration-300',
        scrolled ? 'border-line bg-cream/90 backdrop-blur-xl' : 'border-transparent bg-cream',
      )}
    >
      <div className={cn('container-x flex items-center justify-between gap-4 transition-all duration-300 2xl:max-w-[1440px]', scrolled ? 'h-14 md:h-16' : 'h-[68px] md:h-20')}>
        <Logo />

        <nav className="hidden items-center gap-0.5 xl:flex" aria-label="Основное меню">
          {NAV.map((n) => (
            <a key={n.id} href={n.href ? import.meta.env.BASE_URL + n.href : `#${n.id}`} className="inline-flex min-h-11 items-center whitespace-nowrap rounded-full px-3 py-2 text-[14px] font-semibold text-ink-soft transition hover:bg-ink/5 hover:text-ink">
              {n.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <div className="hidden flex-col items-end 2xl:flex">
            <a href={SITE.phoneHref} onClick={() => goal('phone_click', { from: 'header' })} className="text-[16px] font-extrabold tracking-tight text-ink hover:text-honey-600">
              {SITE.phoneDisplay}
            </a>
            <StatusPill compact className="whitespace-nowrap text-[12px]" />
          </div>
          <a href={SITE.phoneHref} onClick={() => goal('phone_click', { from: 'header' })} className="run-border grid h-11 w-11 place-items-center rounded-full border border-line bg-surface 2xl:hidden" aria-label="Позвонить">
            <Phone className="h-[18px] w-[18px]" />
          </a>
          <a href={maxLink(MSG.header)} target="_blank" rel="noopener" onClick={() => goal('max_click', { from: 'header' })} className="run-border grid h-11 w-11 place-items-center rounded-full bg-max text-white transition hover:bg-max-600" aria-label="Написать в MAX">
            <MaxIcon className="h-5 w-5" />
          </a>
          <a href={tgLink(MSG.header)} target="_blank" rel="noopener" onClick={() => goal('tg_click', { from: 'header' })} className="run-border grid h-11 w-11 place-items-center rounded-full bg-tg text-white transition hover:brightness-95" aria-label="Написать в Telegram">
            <TelegramIcon className="h-[18px] w-[18px]" />
          </a>
          <Button size="md" className="px-5" onClick={() => { goal('cta_header'); scrollToId('catalog') }}>
            Каталог с ценами
          </Button>
          <button onClick={() => setOpen((v) => !v)} className="run-border grid h-11 w-11 cursor-pointer place-items-center rounded-full bg-honey text-onaccent xl:hidden" aria-label="Меню" aria-expanded={open}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <ThemeToggle />
        </div>

        {/* мобильный: трубка + MSG + бургер */}
        <div className="flex items-center gap-1.5 md:hidden">
          <a href={SITE.phoneHref} onClick={() => goal('phone_click', { from: 'header-m' })} className="run-border grid h-11 w-11 place-items-center rounded-full border border-line bg-surface max-[419px]:hidden" aria-label="Позвонить">
            <Phone className="h-[18px] w-[18px]" />
          </a>
          <a href={maxLink(MSG.header)} target="_blank" rel="noopener" onClick={() => goal('max_click', { from: 'header-m' })} className="run-border grid h-11 w-11 place-items-center rounded-full bg-max text-white" aria-label="MAX">
            <MaxIcon className="h-5 w-5" />
          </a>
          <button onClick={() => { goal('cta_header_m'); scrollToId('catalog') }} className="run-border h-11 cursor-pointer whitespace-nowrap rounded-full bg-gold px-3.5 text-[13px] font-bold text-onaccent">
            Каталог
          </button>
          <button onClick={() => setOpen((v) => !v)} className="run-border grid h-11 w-11 cursor-pointer place-items-center rounded-full border border-line bg-surface" aria-label="Меню" aria-expanded={open}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-line bg-cream xl:hidden"
          >
            <nav className="container-x flex flex-col py-3" aria-label="Мобильное меню">
              {NAV.map((n) => (
                <a key={n.id} href={n.href ? import.meta.env.BASE_URL + n.href : `#${n.id}`} onClick={() => setOpen(false)} className="border-b border-line/70 py-3.5 text-lg font-bold last:border-0">
                  {n.label}
                </a>
              ))}
              <div className="mt-3 flex flex-col gap-2 pb-2">
                <StatusPill />
                <a href={SITE.phoneHref} className="text-xl font-extrabold">{SITE.phoneDisplay}</a>
                <span className="text-sm text-muted">{SITE.hours}</span>
                <div className="mt-2 flex items-center gap-3 text-sm font-semibold text-ink-soft md:hidden">
                  <ThemeToggle /> Светлая / тёмная тема
                </div>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

export function MobileBar() {
  return (
    <nav aria-label="Быстрый заказ" className="fixed inset-x-0 bottom-0 z-[60] border-t border-line bg-cream/95 px-3 pb-[calc(8px+env(safe-area-inset-bottom))] pt-1.5 backdrop-blur-xl md:hidden">
      <p className="mb-1.5 text-center text-[12px] font-bold uppercase tracking-[0.1em] text-muted">Заказать в 1 сообщение</p>
      <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
        <a
          href={maxLink(MSG.mobileBar)}
          target="_blank"
          rel="noopener"
          onClick={() => goal('max_click', { from: 'mobile-bar' })}
          className="run-border flex h-11 items-center justify-center gap-1.5 rounded-full bg-max text-[14px] font-bold text-white active:scale-[0.98]"
        >
          <MaxIcon className="h-4 w-4" /> MAX
        </a>
        <a
          href={tgLink(MSG.mobileBar)}
          target="_blank"
          rel="noopener"
          onClick={() => goal('tg_click', { from: 'mobile-bar' })}
          className="run-border flex h-11 items-center justify-center gap-1.5 rounded-full bg-tg text-[14px] font-bold text-white active:scale-[0.98]"
        >
          <TelegramIcon className="h-4 w-4" /> Telegram
        </a>
        <a
          href={SITE.phoneHref}
          onClick={() => goal('phone_click', { from: 'mobile-bar' })}
          aria-label="Позвонить"
          className="run-border grid h-11 w-11 place-items-center rounded-full border-2 border-ink/15 bg-surface active:scale-[0.98]"
        >
          <Phone className="h-4 w-4" />
        </a>
      </div>
    </nav>
  )
}
