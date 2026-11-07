import { ArrowRight, ExternalLink, Play, Star } from 'lucide-react'
import { SectionTitle } from '@/components/shared/section-title'
import { NumberTicker } from '@/components/magicui/number-ticker'
import { Marquee } from '@/components/magicui/marquee'
import { BlurFade } from '@/components/magicui/blur-fade'
import { Button } from '@/components/ui/button'
import { SITE } from '@/lib/config'
import { goal } from '@/lib/analytics'
import { scrollToId } from '@/lib/ui-store'

/** Сторис-реакции. Добавьте video: '/video/xxx.mp4' — карточка станет роликом (без звука, по тапу). */
const STORIES: { poster: string; caption: string; who: string; video?: string }[] = [
  { poster: '/img/reaction.webp', caption: 'Вручение «Клубничного поцелуя»', who: 'Алина, 8 сек' },
  { poster: '/img/meathands.webp', caption: '«Мужской разговор» на 35-летие', who: 'Денис, 12 сек' },
  { poster: '/img/fruithands.webp', caption: 'Маме на юбилей', who: 'Ольга, 15 сек' },
  { poster: '/img/inhands.webp', caption: 'Сюрприз на годовщину', who: 'Артём, 10 сек' },
  { poster: '/img/corp.webp', caption: 'Новый год в «ВолгаТехСтрое»', who: 'HR-отдел, 18 сек' },
]

const STATS = [
  { v: SITE.ordersCount, suffix: '+', label: 'заказов для ульяновцев' },
  { v: 4.9, dec: 1, suffix: '', label: 'рейтинг на Яндекс Картах', star: true },
  { v: SITE.repeatShare, suffix: '%', label: 'клиентов заказывают повторно' },
  { text: SITE.avgDelivery, label: 'среднее время доставки' },
]

const REVIEWS = [
  { name: 'Марина К.', area: 'Новый город', text: 'Всё свежее, клубника сладкая и крупная — не «пластиковая» из супермаркета. Шоколад настоящий, не глазурь.', tag: 'Свежесть' },
  { name: 'Игорь П.', area: 'Ленинский район', text: 'Вспомнил про день рождения жены в 14:00. Написал — в 16:10 букет был у неё в офисе. Выручили!', tag: 'Скорость' },
  { name: 'Екатерина В.', area: 'Засвияжье', text: 'Боялась, что привезут крошечный. Размер как на фото, даже больше — хватило на всю компанию.', tag: 'Размер' },
  { name: 'Светлана Р.', area: 'Верхняя Терраса', text: 'Муж был в восторге, наконец-то не носки 😄 Мясной букет съели за вечер с друзьями под футбол.', tag: 'Мужчине' },
  { name: 'Анна Л.', area: 'Офис на Гончарова', text: 'Заказывали 18 боксов с логотипом на Новый год. Все довольны, документы прислали в тот же день.', tag: 'Корпоратив' },
  { name: 'Юлия Д.', area: 'Железнодорожный', text: 'У сына аллергия на орехи — убрали всё, собрали отдельно. Спасибо за внимательность!', tag: 'Аллергия' },
]

const WALL = ['/img/reaction.webp', '/img/straw.webp', '/img/meathands.webp', '/img/cheese.webp', '/img/fruithands.webp', '/img/kids.webp', '/img/inhands.webp', '/img/newyear.webp', '/img/snack.webp', '/img/fruit.webp']

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
          sub={`Более ${SITE.ordersCount} букетов для ульяновцев — и вот что нам пишут.`}
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

        {/* Сторис */}
        <div className="no-scrollbar -mx-4 mt-10 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 md:mx-0 md:mt-14 md:grid md:grid-cols-5 md:gap-4 md:px-0">
          {STORIES.map((s) => (
            <button
              key={s.caption}
              onClick={() => goal('story_open', { caption: s.caption })}
              className="group relative aspect-[9/16] w-[46%] shrink-0 cursor-pointer snap-start overflow-hidden rounded-3xl bg-black text-left sm:w-[30%] md:w-auto"
            >
              {s.video ? (
                <video src={s.video} poster={s.poster} muted loop playsInline preload="none" className="h-full w-full object-cover" />
              ) : (
                <img src={s.poster} alt={s.caption} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
              )}
              <div className="absolute inset-x-3 top-3 h-1 overflow-hidden rounded-full bg-white/30">
                <div className="h-full w-1/3 rounded-full bg-surface" />
              </div>
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
              <span className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/25 backdrop-blur transition group-hover:scale-110">
                <Play className="h-6 w-6 fill-white text-white" />
              </span>
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <p className="text-[14px] font-bold leading-tight">{s.caption}</p>
                <p className="mt-0.5 text-[12px] text-white/70">{s.who}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Отзывы + Яндекс + переписка */}
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
                  {r.name} <span className="font-semibold text-muted">· {r.area}</span>
                </p>
              </BlurFade>
            ))}
          </div>
          <div className="flex flex-col gap-4">
            <a
              href={SITE.yandexReviews}
              target="_blank"
              rel="noopener"
              onClick={() => goal('yandex_reviews_click')}
              className="group rounded-3xl bg-panel text-ink border border-honey/25 p-6 transition hover:shadow-lift"
            >
              <div className="flex items-center gap-2 text-[13px] font-bold text-ink/70">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-[#fc3f1d] text-[13px] font-extrabold text-white">Я</span>
                Яндекс Карты
              </div>
              <p className="mt-4 flex items-end gap-2 text-[56px] font-extrabold leading-none">
                {SITE.rating}
                <span className="mb-2 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, k) => (
                    <Star key={k} className="h-5 w-5 fill-honey text-honey" />
                  ))}
                </span>
              </p>
              <p className="mt-2 text-[14px] text-ink/70">{SITE.reviewsCount} отзывов · «Хорошее место» 2026</p>
              <p className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-bold text-honey">
                Все отзывы на Яндекс Картах <ExternalLink className="h-4 w-4" />
              </p>
            </a>
            <ChatShot />
          </div>
        </div>
      </div>

      {/* Фото-стена */}
      <div className="mt-12 md:mt-16">
        <p className="container-x mb-4 text-center text-[13px] font-bold uppercase tracking-[0.14em] text-muted">Реальные букеты, реальные люди</p>
        <Marquee duration="60s">
          {WALL.map((src, i) => (
            <img key={i} src={src} alt="" loading="lazy" className="h-40 w-40 rounded-2xl object-cover ring-1 ring-honey/20 md:h-52 md:w-52" />
          ))}
        </Marquee>
        <Marquee duration="70s" reverse className="mt-4">
          {[...WALL].reverse().map((src, i) => (
            <img key={i} src={src} alt="" loading="lazy" className="h-32 w-32 rounded-2xl object-cover opacity-80 ring-1 ring-honey/20 md:h-40 md:w-40" />
          ))}
        </Marquee>
      </div>

      <div className="container-x mt-10 flex flex-col items-center gap-3 text-center">
        <Button size="lg" onClick={() => { goal('cta_reviews_catalog'); scrollToId('catalog') }}>
          Хочу такую же реакцию — выбрать букет <ArrowRight className="h-5 w-5" />
        </Button>
        <a href={SITE.yandexReviews} target="_blank" rel="noopener" className="text-[14px] font-semibold text-ink-soft underline underline-offset-4">
          Все отзывы на Яндекс Картах →
        </a>
      </div>
    </section>
  )
}

/** Переписка в стиле WhatsApp: имя скрыто, как на реальных скриншотах. */
function ChatShot() {
  return (
    <div className="overflow-hidden rounded-3xl border border-line bg-[#0b141a]">
      <div className="flex items-center gap-2.5 bg-[#202c33] px-4 py-3 text-white">
        <span className="h-8 w-8 rounded-full bg-gradient-to-br from-pink-300 to-orange-300" />
        <div>
          <p className="h-3 w-24 rounded bg-white/70 blur-[3px]" aria-label="Имя скрыто" />
          <p className="mt-1 text-[11px] text-white/70">в сети</p>
        </div>
      </div>
      <div className="flex flex-col gap-2 p-3 text-[13.5px]">
        <div className="max-w-[85%] self-start overflow-hidden rounded-2xl rounded-tl-sm bg-[#202c33] text-white shadow-sm">
          <img src="/img/reaction.webp" alt="Фото от клиента" className="h-36 w-full object-cover" loading="lazy" />
          <p className="px-3 py-2">Это было 🔥🔥🔥 Она плакала от счастья! Спасибо огромное 🙏 <span className="ml-1 text-[10px] text-muted">19:42</span></p>
        </div>
        <div className="max-w-[80%] self-end rounded-2xl rounded-tr-sm bg-[#005c4b] px-3 py-2 text-white shadow-sm">
          Ура! Очень рады, что угадали 🥰 Ждём на 8 Марта! <span className="ml-1 text-[10px] text-muted">19:45 ✓✓</span>
        </div>
      </div>
    </div>
  )
}
