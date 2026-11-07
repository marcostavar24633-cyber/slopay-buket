import { useRef } from 'react'
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react'
import { ArrowRight, Sparkles, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ShimmerButton } from '@/components/magicui/shimmer-button'
import { MaxIcon } from '@/components/shared/icons'
import { SITE, MSG, maxLink } from '@/lib/config'
import { ANCHOR_PRICE } from '@/lib/products'
import { goal } from '@/lib/analytics'
import { scrollToId, useUI } from '@/lib/ui-store'
import { rub } from '@/lib/utils'

/** A/B заголовка: ?h=b — вариант под таргет и соцсети. По умолчанию A (поисковый трафик). */
const variant = typeof location !== 'undefined' && new URLSearchParams(location.search).get('h') === 'b' ? 'B' : 'A'

const BULLETS = [
  { icon: '🚚', text: 'Доставка по всему Ульяновску' },
  { icon: '🍓', text: 'Продукты закупаем в день сборки' },
  { icon: '⭐', text: `${SITE.rating} по ${SITE.reviewsCount} оценкам на ${SITE.reviewsSource}` },
  { icon: '✏️', text: 'Уберём или добавим любой ингредиент' },
]

export function Hero() {
  const { setQuizOpen } = useUI()
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  // Параллакс по скроллу: фото отстаёт, текст уходит вверх и гаснет, карточка отзыва обгоняет
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const imgY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 140])
  const textY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -60])
  const textOpacity = useTransform(scrollYProgress, [0, 0.8], [1, reduce ? 1 : 0.2])
  const cardY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -160])
  // 3D-наклон фото за курсором (десктоп)
  const rx = useSpring(useMotionValue(0), { stiffness: 120, damping: 14 })
  const ry = useSpring(useMotionValue(0), { stiffness: 120, damping: 14 })
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 10)
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 10)
  }
  const onLeave = () => {
    rx.set(0)
    ry.set(0)
  }

  const title =
    variant === 'A' ? (
      <>
        Съедобные букеты в Ульяновске <span className="italic text-gold">с доставкой до двери</span>
      </>
    ) : (
      <>
        Подарок, который не завянет через 3 дня, <span className="italic text-gold">а будет съеден с удовольствием</span>
      </>
    )

  return (
    <section ref={ref} id="top" className="relative overflow-hidden pb-10 pt-4 md:pb-20 md:pt-10">
      <div aria-hidden className="grain pointer-events-none absolute inset-0" />
      <div aria-hidden className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-honey/20 blur-[120px]" />
      <div aria-hidden className="pointer-events-none absolute -left-40 top-1/2 h-[420px] w-[420px] rounded-full bg-honey/10 blur-[120px]" />

      <div className="container-x relative grid items-center gap-5 md:gap-10 lg:grid-cols-[1.1fr_1fr]">
        {/* Текст */}
        <motion.div className="order-1" style={{ y: textY, opacity: textOpacity }}>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <a
              href={SITE.reviewsUrl}
              target="_blank"
              rel="noopener"
              className="mb-3 inline-flex items-center gap-2 rounded-full border border-line bg-scrim/80 py-1.5 pl-1.5 pr-3.5 text-[13px] font-semibold text-ink-soft shadow-soft backdrop-blur md:mb-6"
            >
              <span className="flex items-center gap-1 rounded-full bg-honey px-2 py-0.5 text-onaccent">
                <Star className="h-3 w-3 fill-onaccent text-onaccent" /> {SITE.rating}
              </span>
              {SITE.reviewsCount} оценок на {SITE.reviewsSource} — все пятёрки
            </a>
            <h1 className="h-display text-[29px] leading-[1.08] sm:text-5xl lg:text-[52px] xl:text-[58px]" data-variant={variant}>
              {title}
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 hidden max-w-xl text-lg leading-relaxed text-ink-soft md:block"
          >
            Клубничные сердца, мясные и раковые букеты, сухофрукты и сладкие боксы. Собираем из свежих продуктов в день
            доставки — букет удивит и будет съеден до последней ягоды.
          </motion.p>

          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 hidden grid-cols-2 gap-x-6 gap-y-3 md:grid"
          >
            {BULLETS.map((b) => (
              <li key={b.text} className="flex items-start gap-2.5 text-[15px] font-semibold leading-snug">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-surface text-base shadow-soft">{b.icon}</span>
                <span className="pt-1">{b.text}</span>
              </li>
            ))}
          </motion.ul>

          <HeroCtas className="mt-8 hidden md:flex" onQuiz={() => setQuizOpen(true)} />
        </motion.div>

        {/* Фото — на мобильном минимум половина экрана */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
          className="relative order-2 [perspective:1200px]"
          style={{ y: imgY }}
        >
          <motion.div
            onPointerMove={onMove}
            onPointerLeave={onLeave}
            style={{ rotateX: rx, rotateY: ry }}
            className="relative mx-auto aspect-[4/5] h-[44svh] max-h-[640px] min-h-[300px] overflow-hidden rounded-[32px] shadow-lift ring-1 ring-honey/30 md:h-auto md:max-h-none md:w-full lg:max-w-[520px]"
          >
            <img
              src="/img/real/berry/yag-14.webp"
              alt="Клубника с голубикой и тюльпанами в шляпной коробке — работа мастерской"
              className="h-full w-full scale-105 object-cover animate-[kenburns_18s_ease-in-out_infinite_alternate]"
              fetchPriority="high"
              width={1100}
              height={1100}
            />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
              <div className="rounded-2xl border border-honey/40 bg-scrim/75 px-4 py-3 shadow-lift backdrop-blur">
                <p className="text-[12px] font-semibold text-muted">Букеты</p>
                <p className="text-gold text-2xl font-extrabold leading-none tracking-tight">
                  от {rub(ANCHOR_PRICE)}
                </p>
              </div>
              <div className="hidden rounded-2xl bg-scrim/85 px-3.5 py-2.5 text-[12px] font-semibold text-ink backdrop-blur sm:block">
                «Клубника в шляпной коробке» · от 3 490 ₽
              </div>
            </div>
          </motion.div>
          {/* золотая рамка-ореол */}
          <div aria-hidden className="pointer-events-none absolute -inset-3 -z-10 mx-auto hidden rounded-[40px] border border-honey/25 lg:block lg:max-w-[544px]" />

          {/* Плавающая карточка соцдоказательства */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            style={{ y: cardY }}
            className="absolute -left-6 bottom-28 hidden w-60 rounded-2xl border border-honey/25 bg-surface/90 p-3.5 shadow-lift backdrop-blur lg:block xl:-left-12"
          >
            <div className="flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[#8bc34a] text-lg font-bold text-white">А</span>
              <div>
                <p className="text-[13px] font-bold">Андрей · {SITE.reviewsSource}</p>
                <p className="text-[11px] text-muted">мужской букет на день рождения</p>
              </div>
            </div>
            <p className="mt-2 text-[13px] leading-snug text-ink-soft">«Собрала по высшему классу. Родные были в шоке»</p>
            <div className="mt-1.5 flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-honey text-honey" />
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Мобильные CTA и буллиты — под фото */}
        <div className="order-3 md:hidden">
          <HeroCtas onQuiz={() => setQuizOpen(true)} />
          <ul className="mt-6 grid grid-cols-2 gap-2.5">
            {BULLETS.map((b) => (
              <li key={b.text} className="flex flex-col gap-1.5 rounded-2xl border border-line bg-surface p-3 text-[13px] font-semibold leading-snug">
                <span className="text-lg">{b.icon}</span>
                {b.text}
              </li>
            ))}
          </ul>
          <p className="mt-5 text-[15px] leading-relaxed text-ink-soft">
            Клубничные сердца, мясные и раковые букеты, сухофрукты и сладкие боксы. Собираем из свежих продуктов в день
            доставки.
          </p>
        </div>
      </div>
    </section>
  )
}

function HeroCtas({ className = 'flex', onQuiz }: { className?: string; onQuiz: () => void }) {
  return (
    <div className={`${className} flex-col gap-3`}>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-col items-center sm:items-start">
          <ShimmerButton
            className="w-full sm:w-auto"
            onClick={() => {
              goal('cta_hero_catalog')
              scrollToId('catalog')
            }}
          >
            Выбрать букет <ArrowRight className="h-5 w-5" />
          </ShimmerButton>
          <p className="mt-2 text-center text-[12.5px] font-semibold text-muted sm:text-left">
            Лучше заказать за 1–2 дня — бывает, успеваем и день в день
          </p>
        </div>
        <Button
          variant="outline"
          size="lg"
          className="w-full sm:w-auto"
          onClick={() => {
            goal('cta_hero_quiz')
            onQuiz()
          }}
        >
          <Sparkles className="h-5 w-5 text-honey-600" /> Подобрать за 1 минуту
        </Button>
      </div>
      <a
        href={maxLink(MSG.heroPhoto)}
        target="_blank"
        rel="noopener"
        onClick={() => goal('max_click', { from: 'hero-photo' })}
        className="inline-flex items-center justify-center gap-2 text-[14px] font-semibold text-ink-soft underline decoration-max/50 decoration-2 underline-offset-4 hover:text-ink sm:justify-start"
      >
        <MaxIcon className="h-4 w-4 text-max" />
        Или просто пришлите фото примера в MAX — соберём похожий
      </a>
    </div>
  )
}
