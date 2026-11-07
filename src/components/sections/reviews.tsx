import { useRef, useState } from 'react'
import { useInView } from 'motion/react'
import { ArrowRight, ExternalLink, Star } from 'lucide-react'
import { SectionTitle } from '@/components/shared/section-title'
import { NumberTicker } from '@/components/magicui/number-ticker'
import { Marquee } from '@/components/magicui/marquee'
import { BlurFade } from '@/components/magicui/blur-fade'
import { Button } from '@/components/ui/button'
import { SITE } from '@/lib/config'
import { goal } from '@/lib/analytics'
import { scrollToId } from '@/lib/ui-store'
import { REVIEW_SHOTS } from '@/lib/gallery'
import { ITEMS } from '@/lib/products'
import { Lightbox } from '@/components/sections/gallery'

/** Только проверяемые цифры: Авито (скриншот рейтинга) и галерея работ. */
const STATS = [
  { v: 5, dec: 1, suffix: '', label: `средняя оценка на ${SITE.reviewsSource}`, star: true },
  { v: 100, suffix: '%', label: 'оценок покупателей — пятёрки' },
  { v: Math.floor(ITEMS.length / 10) * 10, suffix: '+', label: 'работ в каталоге на сайте' },
  { text: `с ${SITE.sinceYear}`, label: 'собираем букеты в Ульяновске' },
]

/** Реальные отзывы с Авито — дословно (сокращено «…»), фамилии до инициала. Скриншоты — в AvitoShots. */
const REVIEWS = [
  { name: 'Maya', date: '12 июня 2022', item: 'Букет с клубникой', tag: 'Срочно', text: 'Пришлось искать подарок в последний момент… Я написала уже поздно вечером, подарок нужен был к утру. Мария ответила, взялась за заказ и на утро уже всё было готово.' },
  { name: 'Светлана В.', date: '15 августа 2021', item: 'Мужской букет', tag: 'Юбилей', text: 'Заказывали у Марии съедобный мужской букет на юбилей! Мария справилась на 200%. От букета юбиляр и родные были в восторге! В бюджет уложились, заказ прибыл вовремя.' },
  { name: 'Андрей', date: '15 сентября 2022', item: 'Мужской букет', tag: 'Мужчине', text: 'Огромное спасибо Марии. Классный и порядочный человек. Заказывал мужской букет на День рождения. Собрала по высшему классу. Родные были в шоке.' },
  { name: 'Наталья', date: '22 октября 2022', item: 'Букет с клубникой', tag: 'Вкус', text: 'Шикарный букет! Аккуратно сделанный, всё красиво и очень вкусно! Муж в восторге! Будем рекомендовать вас!' },
  { name: 'Надя Ч.', date: '16 октября 2022', item: 'Букет из раков', tag: 'Коллегам', text: 'Спасибо большое! Начальнику очень понравился подарок! Довольный начальник — довольные сотрудники!' },
  { name: 'Лёля А.', date: '2 сентября 2022', item: 'Из сухофруктов', tag: 'Цена', text: 'Заказывала у Марии 2 букета на 1 сентября. Букеты были очень красивые и вкусные. Всегда была на связи, доставили до квартиры бесплатно. Стоимость на букеты не заоблачная. У Машеньки ручки золотые.' },
]

/** Фото-стена — реальные работы (миниатюры), два встречных ряда. */
const WALL = ITEMS.slice(0, 14).map((p) => p.thumb)
const WALL2 = ITEMS.slice(14, 28).map((p) => p.thumb)

function PhotoWall() {
  const ref = useRef<HTMLDivElement>(null)
  const near = useInView(ref, { once: true, margin: '900px 0px' })
  return (
    <div ref={ref} className="mt-12 md:mt-16">
      <p className="container-x mb-4 text-center text-[13px] font-bold uppercase tracking-[0.14em] text-muted">Наши букеты</p>
      {near ? (
        <>
          <Marquee duration="60s">
            {WALL.map((src, i) => (
              <img key={i} src={src} alt="" decoding="async" className="h-40 w-40 rounded-2xl object-cover ring-1 ring-honey/20 md:h-52 md:w-52" />
            ))}
          </Marquee>
          <Marquee duration="70s" reverse className="mt-4">
            {WALL2.map((src, i) => (
              <img key={i} src={src} alt="" decoding="async" className="h-32 w-32 rounded-2xl object-cover opacity-80 ring-1 ring-honey/20 md:h-40 md:w-40" />
            ))}
          </Marquee>
        </>
      ) : (
        <div className="h-[304px] md:h-[384px]" />
      )}
    </div>
  )
}

export function Reviews() {
  return (
    <section id="reviews" className="overflow-hidden bg-surface py-14 md:py-24">
      <div className="container-x">
        <SectionTitle
          eyebrow="Отзывы и реакции"
          title={
            <>
              За этими эмоциями <span className="italic text-gold">заказывают у нас</span>
            </>
          }
          sub={`Все оценки на ${SITE.reviewsSource} — 5 звёзд. Ниже — настоящие отзывы, без правок.`}
        />

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          {STATS.map((s, i) => (
            <BlurFade key={s.label} delay={i * 0.05} className="rounded-3xl border border-line bg-cream p-5 md:p-6">
              <p className="flex items-center gap-1.5 text-[34px] font-extrabold leading-none tracking-tight md:text-[44px]">
                {s.text ?? (
                  <>
                    <span>
                      <NumberTicker value={s.v!} decimals={s.dec} />
                      {s.suffix}
                    </span>
                  </>
                )}
                {s.star && <Star className="h-7 w-7 fill-honey text-honey" />}
              </p>
              <p className="mt-2 text-[13px] font-semibold leading-snug text-ink-soft md:text-[14px]">{s.label}</p>
            </BlurFade>
          ))}
        </div>

        <AvitoShots />

        {/* Реальные отзывы + карточка Авито */}
        <div className="mt-10 grid gap-5 md:mt-14 lg:grid-cols-[1fr_340px]">
          <div className="grid gap-4 sm:grid-cols-2">
            {REVIEWS.map((r, i) => (
              <BlurFade key={r.name} delay={(i % 2) * 0.05} className="flex flex-col rounded-3xl border border-line bg-cream p-5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, k) => (
                      <Star key={k} className="h-4 w-4 fill-honey text-honey" />
                    ))}
                  </div>
                  <span className="rounded-full bg-surface px-2.5 py-0.5 text-[11px] font-bold text-muted">{r.tag}</span>
                </div>
                <p className="mt-3 flex-1 text-[15px] leading-relaxed">«{r.text}»</p>
                <p className="mt-4 text-[13px] font-bold">
                  {r.name} <span className="font-semibold text-muted">· {r.item} · {r.date}</span>
                </p>
              </BlurFade>
            ))}
          </div>
          <div className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
            <a
              href={SITE.reviewsUrl}
              target="_blank"
              rel="noopener"
              onClick={() => goal('reviews_source_click')}
              className="group rounded-3xl bg-panel text-ink border border-honey/25 p-6 transition hover:shadow-lift"
            >
              <div className="flex items-center gap-2 text-[13px] font-bold text-ink/70">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-[#00aaff] text-[12px] font-extrabold text-white">A</span>
                {SITE.reviewsSource}
              </div>
              <p className="mt-4 flex items-end gap-2 text-[56px] font-extrabold leading-none">
                {SITE.rating}
                <span className="mb-2 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, k) => (
                    <Star key={k} className="h-5 w-5 fill-honey text-honey" />
                  ))}
                </span>
              </p>
              <p className="mt-2 text-[14px] text-ink/70">все оценки — пятёрки · «Сделка состоялась»</p>
              <p className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-bold text-honey">
                Все отзывы на {SITE.reviewsSource} <ExternalLink className="h-4 w-4" />
              </p>
            </a>
          </div>
        </div>
      </div>

      {/* Фото-стена: картинки подключаются, только когда до ленты осталось ~1 экран */}
      <PhotoWall />

      <div className="container-x mt-10 flex flex-col items-center gap-3 text-center">
        <Button size="lg" onClick={() => { goal('cta_reviews_catalog'); scrollToId('catalog') }}>
          Хочу так же — выбрать букет <ArrowRight className="h-5 w-5" />
        </Button>
        <a href={SITE.reviewsUrl} target="_blank" rel="noopener" className="text-[14px] font-semibold text-ink-soft underline underline-offset-4">
          Все отзывы на {SITE.reviewsSource} →
        </a>
      </div>
    </section>
  )
}

/** Лента скриншотов реальных отзывов с Авито, по клику — на весь экран. */
function AvitoShots() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <div className="mt-10 md:mt-14">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <p className="text-[15px] font-bold">
          Настоящие отзывы с Авито <span className="font-semibold text-muted">· 5,0 ★ · скриншоты без правок</span>
        </p>
        <p className="text-[13px] text-muted">Нажмите, чтобы прочитать целиком</p>
      </div>
      <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
        {REVIEW_SHOTS.map((r, i) => (
          <button
            key={r.src}
            onClick={() => {
              setOpen(i)
              goal('review_shot_open', { i })
            }}
            className="group relative h-64 w-[240px] shrink-0 cursor-zoom-in snap-start overflow-hidden rounded-2xl bg-[#1f1f1f] ring-1 ring-line md:h-72 md:w-[260px]"
            aria-label={`Отзыв ${i + 1} из ${REVIEW_SHOTS.length}`}
          >
            <img loading="lazy" src={r.src} alt={`Скриншот отзыва покупателя №${i + 1}`} decoding="async" className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-[1.03]" />
            <span aria-hidden className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/80 to-transparent" />
            <span className="absolute bottom-2 left-3 text-[12px] font-bold text-white">Читать отзыв →</span>
          </button>
        ))}
      </div>
      <Lightbox list={REVIEW_SHOTS} index={open} onIndex={setOpen} cta={false} />
    </div>
  )
}
