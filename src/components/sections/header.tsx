import { useState } from 'react'
import { Menu, Phone, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { StatusPill } from '@/components/shared/status-pill'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { TelegramIcon, WhatsAppIcon } from '@/components/shared/icons'
import { useScrolled } from '@/hooks/use-scrolled'
import { SITE, WA, tgLink, waLink } from '@/lib/config'
import { goal } from '@/lib/analytics'
import { scrollToId } from '@/lib/ui-store'
import { cn } from '@/lib/utils'

const NAV = [
  { id: 'catalog', label: 'Каталог' },
  { id: 'quiz', label: 'Подобрать букет' },
  { id: 'reviews', label: 'Отзывы' },
  { id: 'delivery', label: 'Доставка' },
  { id: 'corporate', label: 'Корпоративным' },
]

export function Logo({ light }: { light?: boolean }) {
  return (
    <a href="#top" className="group flex min-w-0 items-center gap-2 md:gap-2.5" aria-label="Слопай букет — на главную">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-honey text-lg md:h-10 md:w-10 md:text-xl shadow-soft transition group-hover:rotate-[-8deg]">🍓</span>
      <span className="leading-none">
        <span className={cn('block font-display text-[17px] font-bold italic tracking-tight md:text-[19px]', light ? 'text-white' : 'text-ink')}>
          Слопай букет
        </span>
        <span className={cn('mt-1 block whitespace-nowrap text-[10px] font-semibold md:text-[11px]', light ? 'text-white/60' : 'text-muted')}>
          <span className="max-sm:hidden">Съедобные букеты</span><span className="sm:hidden">Букеты</span> · <span className={light ? 'text-white' : 'text-ink'}>Ульяновск</span>
        </span>
      </span>
    </a>
  )
}

export function SeasonBar() {
  const [hidden, setHidden] = useState(false)
  if (hidden) return null
  return (
    <div className="relative z-50 border-b border-honey/20 bg-bar text-bar-fg">
      <div className="container-x flex h-10 items-center justify-center gap-3 pr-10 text-[13px] font-semibold">
        <span className="truncate">
          🎄 <span className="hidden sm:inline">Принимаем новогодние заказы на 25–31 декабря — свободно</span>
          <span className="sm:hidden">Новый год: на 25–31.12 осталось</span> {SITE.seasonSlotsLeft} слота
        </span>
        <button
          onClick={() => {
            goal('season_bar_click')
            scrollToId('catalog')
          }}
          className="hidden shrink-0 cursor-pointer text-bar-link underline underline-offset-4 sm:inline"
        >
          Забронировать →
        </button>
      </div>
      <button
        onClick={() => setHidden(true)}
        aria-label="Скрыть"
        className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 cursor-pointer place-items-center rounded-full text-ink/60 hover:text-ink"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
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
      <div className={cn('container-x flex items-center justify-between gap-4 transition-all duration-300', scrolled ? 'h-14 md:h-16' : 'h-[68px] md:h-20')}>
        <Logo />

        <nav className="hidden items-center gap-0.5 xl:flex" aria-label="Основное меню">
          {NAV.map((n) => (
            <a key={n.id} href={`#${n.id}`} className="whitespace-nowrap rounded-full px-3 py-2 text-[14px] font-semibold text-ink-soft transition hover:bg-ink/5 hover:text-ink">
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
          <a href={SITE.phoneHref} onClick={() => goal('phone_click', { from: 'header' })} className="grid h-11 w-11 place-items-center rounded-full border border-line bg-surface 2xl:hidden" aria-label="Позвонить">
            <Phone className="h-[18px] w-[18px]" />
          </a>
          <a href={waLink(WA.header)} target="_blank" rel="noopener" onClick={() => goal('wa_click', { from: 'header' })} className="grid h-11 w-11 place-items-center rounded-full bg-wa text-white transition hover:bg-wa-600" aria-label="Написать в WhatsApp">
            <WhatsAppIcon className="h-5 w-5" />
          </a>
          <a href={tgLink()} target="_blank" rel="noopener" onClick={() => goal('tg_click', { from: 'header' })} className="grid h-11 w-11 place-items-center rounded-full bg-tg text-white transition hover:brightness-95" aria-label="Написать в Telegram">
            <TelegramIcon className="h-[18px] w-[18px]" />
          </a>
          <Button size="md" className="px-5" onClick={() => { goal('cta_header'); scrollToId('catalog') }}>
            Заказать букет
          </Button>
          <button onClick={() => setOpen((v) => !v)} className="grid h-11 w-11 cursor-pointer place-items-center rounded-full bg-honey text-onaccent xl:hidden" aria-label="Меню" aria-expanded={open}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <ThemeToggle />
        </div>

        {/* мобильный: трубка + WA + бургер */}
        <div className="flex items-center gap-1.5 md:hidden">
          <a href={SITE.phoneHref} onClick={() => goal('phone_click', { from: 'header-m' })} className="grid h-10 w-10 place-items-center rounded-full border border-line bg-surface max-[379px]:hidden" aria-label="Позвонить">
            <Phone className="h-[18px] w-[18px]" />
          </a>
          <a href={waLink(WA.header)} target="_blank" rel="noopener" onClick={() => goal('wa_click', { from: 'header-m' })} className="grid h-10 w-10 place-items-center rounded-full bg-wa text-white" aria-label="WhatsApp">
            <WhatsAppIcon className="h-5 w-5" />
          </a>
          <button onClick={() => setOpen((v) => !v)} className="grid h-10 w-10 cursor-pointer place-items-center rounded-full bg-honey text-onaccent" aria-label="Меню" aria-expanded={open}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <ThemeToggle className="h-10 w-10" />
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
                <a key={n.id} href={`#${n.id}`} onClick={() => setOpen(false)} className="border-b border-line/70 py-3.5 text-lg font-bold last:border-0">
                  {n.label}
                </a>
              ))}
              <div className="mt-3 flex flex-col gap-2 pb-2">
                <StatusPill />
                <a href={SITE.phoneHref} className="text-xl font-extrabold">{SITE.phoneDisplay}</a>
                <span className="text-sm text-muted">{SITE.hours}</span>
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
    <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-line bg-cream/95 px-3 pb-[calc(10px+env(safe-area-inset-bottom))] pt-2.5 backdrop-blur-xl md:hidden">
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <a
          href={waLink(WA.mobileBar)}
          target="_blank"
          rel="noopener"
          onClick={() => goal('wa_click', { from: 'mobile-bar' })}
          className="flex h-[52px] items-center justify-center gap-2 rounded-full bg-wa text-[15px] font-bold text-white shadow-[0_8px_24px_-10px_rgb(26_158_82/0.8)] active:scale-[0.98]"
        >
          <WhatsAppIcon className="h-5 w-5" /> Написать в WhatsApp
        </a>
        <a
          href={SITE.phoneHref}
          onClick={() => goal('phone_click', { from: 'mobile-bar' })}
          className="flex h-[52px] items-center justify-center gap-2 rounded-full border-2 border-ink/15 bg-surface px-5 text-[15px] font-bold active:scale-[0.98]"
        >
          <Phone className="h-[18px] w-[18px]" /> Позвонить
        </a>
      </div>
    </div>
  )
}
