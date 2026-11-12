import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Sparkles, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MaxIcon, TelegramIcon } from '@/components/shared/icons'
import { SITE, MSG, maxLink, tgLink } from '@/lib/config'
import { ANCHOR_PRICE, ITEMS } from '@/lib/products'
import { HERO_QUOTES } from '@/lib/reviews'
import { goal } from '@/lib/analytics'
import { useLive } from '@/lib/live'
import { HeroFrame, editableProps } from '@/components/edit/edit-frame'
import { useUI } from '@/lib/ui-store'
import { rub } from '@/lib/utils'

/** A/B заголовка: ?h=b — вариант под таргет и соцсети. По умолчанию A (поисковый трафик). */
const variant = typeof location !== 'undefined' && new URLSearchParams(location.search).get('h') === 'b' ? 'B' : 'A'

/** Три доказательства с цифрами — только проверяемое. */
const PROOFS = [
  { big: `${SITE.rating} ★`, text: `${SITE.reviewsCount} отзывов на ${SITE.reviewsSource}` },
  { big: `${Math.floor(ITEMS.length / 10) * 10}+`, text: 'реальных работ в каталоге' },
  { big: `с ${SITE.sinceYear}`, text: 'собираем букеты в Ульяновске' },
]

/** Букет на фото первого экрана — его честная цена. */

export function Hero() {
  const { hero: HERO_DATA } = useLive()
  const HERO_ITEM = ITEMS.find((i) => i.id === HERO_DATA.photoProduct)
  const title =
    variant === 'A' ? (
      <>
        <span key={HERO_DATA.title} {...editableProps('hero', 'title')}>
          {HERO_DATA.title}
        </span>{' '}
        <span key={HERO_DATA.titleAccent} className="italic text-gold" {...editableProps('hero', 'titleAccent')}>
          {HERO_DATA.titleAccent}
        </span>
      </>
    ) : (
      <>
        Подарок, который не завянет через 3 дня, <span className="italic text-gold">а будет съеден с удовольствием</span>
      </>
    )

  return (
    <HeroFrame>
    <section id="top" className="relative overflow-hidden pb-8 pt-3 md:pb-16 md:pt-8">
      <div aria-hidden className="grain pointer-events-none absolute inset-0" />
      <div aria-hidden className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-honey/20 blur-[120px]" />

      <div className="container-x relative grid items-center gap-4 md:gap-8 lg:grid-cols-[1.05fr_1fr]">
        {/* Текст: H1 → УТП → 3 доказательства → 2 CTA */}
        <div className="order-1">
          <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-honey-600 md:mb-3 md:text-xs">Съедобные букеты · Ульяновск</p>
          <a
            href={SITE.reviewsUrl}
            target="_blank"
            rel="noopener"
            className="mb-3 inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-scrim/80 py-1.5 pl-1.5 pr-3.5 text-[13px] font-semibold text-ink-soft shadow-soft backdrop-blur md:mb-6"
          >
            <span className="flex items-center gap-1 rounded-full bg-honey px-2 py-0.5 text-onaccent">
              <Star className="h-3 w-3 fill-onaccent text-onaccent" /> {SITE.rating}
            </span>
            · {SITE.reviewsCount} отзывов на {SITE.reviewsSource}
          </a>
          <h1 className="h-display text-[30px] leading-[1.06] tracking-[-0.025em] sm:text-5xl lg:text-[52px] xl:text-[58px]" data-variant={variant}>
            {title}
          </h1>
          <p key={HERO_DATA.subtitle} className="mt-2 max-w-lg text-[15px] font-semibold leading-relaxed text-ink-soft md:mt-4 md:text-lg" {...editableProps('hero', 'subtitle')}>
            {HERO_DATA.subtitle}
          </p>
          <ul className="mt-5 hidden grid-cols-3 gap-3 md:grid">
            {PROOFS.map((p) => (
              <li key={p.text} className="rounded-2xl border border-line bg-surface/80 p-3.5">
                <b className="block text-[24px] font-extrabold leading-none tracking-tight text-honey-600">{p.big}</b>
                <span className="mt-1.5 block text-[13px] font-semibold leading-snug text-ink-soft">{p.text}</span>
              </li>
            ))}
          </ul>
          <HeroCtas className="mt-5 flex md:mt-7" />
        </div>

        {/* Фото — видно сразу, без анимаций; честная цена букета на фото */}
        <div className="relative order-2">
          <div className="relative mx-auto aspect-square h-[38svh] max-w-full max-h-[640px] min-h-[230px] overflow-hidden rounded-[28px] shadow-lift ring-1 ring-honey/30 md:h-auto md:max-h-none md:w-full lg:max-w-[520px]">
            <img
              src="/img/real/berry/hero-heart-720.webp"
              srcSet="/img/real/berry/hero-heart-720.webp 720w, /img/real/berry/hero-heart.webp 1100w"
              sizes="(max-width: 767px) 60vw, 520px"
              alt="«Ежевичный вальс»: сердце из клубники, ежевики и кустовых роз — работа мастерской"
              className="h-full w-full object-cover"
              fetchPriority="high"
              width={1100}
              height={1026}
            />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 rounded-2xl border border-honey/40 bg-scrim/80 px-4 py-2.5 shadow-lift backdrop-blur md:bottom-4 md:left-4 md:right-auto">
              <p className="text-[14px] font-extrabold leading-tight text-ink">
                «{HERO_ITEM?.name}» — {rub(HERO_ITEM?.price ?? 0)}
              </p>
              <p className="mt-0.5 text-[12.5px] font-semibold text-ink-soft">есть варианты от {rub(ANCHOR_PRICE)}</p>
            </div>
          </div>
          <div aria-hidden className="pointer-events-none absolute -inset-3 -z-10 mx-auto hidden rounded-[40px] border border-honey/25 lg:block lg:max-w-[544px]" />
          {/* Плавающая карточка соцдоказательства (компьютер) */}
          <div className="absolute -left-6 bottom-28 hidden w-60 rounded-2xl border border-honey/25 bg-surface/90 p-3.5 shadow-lift backdrop-blur lg:block xl:-left-12">
            <RotatingQuote />
          </div>
        </div>

        {/* Мобильные: CTA и доказательства под фото */}
        <div className="order-3 md:hidden">
          <ul className="grid grid-cols-3 gap-1.5">
            {PROOFS.map((p) => (
              <li key={p.text} className="rounded-xl border border-line/70 bg-surface/60 px-2 py-2">
                <b className="block text-[16px] font-extrabold leading-none text-honey-600">{p.big}</b>
                <span className="mt-1 block text-[10px] font-semibold leading-snug text-ink-soft">{p.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
    </HeroFrame>
  )
}

function HeroCtas({ className = 'flex' }: { className?: string }) {
  const { setQuizOpen } = useUI()
  const { hero: HERO_DATA } = useLive()
  return (
    <div className={`${className} flex-col gap-3`}>
      <Button
        size="lg"
        className="w-full sm:w-auto sm:self-start"
        onClick={() => {
          goal('cta_hero_quiz')
          setQuizOpen(true)
        }}
      >
        <Sparkles className="h-5 w-5" /> {HERO_DATA.quizButton}
      </Button>
      <div className="grid grid-cols-2 gap-2 sm:flex sm:self-start">
        <Button variant="tg" size="md" asChild>
          <a href={tgLink(MSG.hero)} target="_blank" rel="noopener" onClick={() => goal('tg_click', { from: 'hero' })}>
            <TelegramIcon className="h-5 w-5" /> <span className="sm:hidden">Telegram</span><span className="hidden sm:inline">Написать в Telegram</span>
          </a>
        </Button>
        <Button variant="max" size="md" asChild>
          <a href={maxLink(MSG.hero)} target="_blank" rel="noopener" onClick={() => goal('max_click', { from: 'hero' })}>
            <MaxIcon className="h-5 w-5" /> MAX
          </a>
        </Button>
      </div>
      <p className="text-center text-[12.5px] font-semibold text-muted sm:text-left">{SITE.responseNote}</p>
    </div>
  )
}

/** Карточка отзыва у фото: цитаты сменяются каждые 3 секунды. */
const AVATAR_COLORS = ['#8bc34a', '#ff8a65', '#4fc3f7', '#ba68c8', '#ffb74d', '#4db6ac']
function RotatingQuote() {
  const [i, setI] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % HERO_QUOTES.length), 3000)
    return () => clearInterval(t)
  }, [])
  const q = HERO_QUOTES[i]
  return (
    <div className="relative min-h-[118px]" aria-live="polite">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35 }}>
          <div className="flex items-center gap-2.5">
            <span
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-lg font-bold text-white"
              style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
            >
              {q.name[0]}
            </span>
            <div>
              <p className="text-[13px] font-bold">
                {q.name} · {SITE.reviewsSource}
              </p>
              <p className="text-[12px] text-muted">{q.item}</p>
            </div>
          </div>
          <p className="mt-2 text-[13px] leading-snug text-ink-soft">«{q.text}»</p>
          <div className="mt-1.5 flex gap-0.5">
            {Array.from({ length: 5 }).map((_, k) => (
              <Star key={k} className="h-3.5 w-3.5 fill-honey text-honey" />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
