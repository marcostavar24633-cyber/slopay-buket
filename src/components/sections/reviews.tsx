import { ExternalLink, Star } from 'lucide-react'
import { SectionTitle } from '@/components/shared/section-title'
import { REVIEWS } from '@/lib/reviews'
import { SITE } from '@/lib/config'
import { goal } from '@/lib/analytics'

/** Только проверяемые цифры со страницы продавца на Авито — сразу в HTML, без анимации счётчиков. */
const STATS = [
  { big: SITE.rating, star: true, label: `средняя оценка на ${SITE.reviewsSource}` },
  { big: String(SITE.reviewsCount), label: 'отзывов — все на 5 ★' },
  { big: `с ${SITE.avitoSince.split(' ').pop()}`, label: 'на Авито · «Надёжный продавец»' },
]

/** 6 самых свежих отзывов — короткая лента. */
const toDate = (d: string) => {
  const M = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
  const [day, mon, year] = d.split(' ')
  return new Date(+year, M.indexOf(mon), +day).getTime()
}
const FRESH = [...REVIEWS].sort((a, b) => toDate(b.date) - toDate(a.date)).slice(0, 6)

export function Reviews() {
  return (
    <section id="reviews" className="overflow-hidden bg-surface py-14 md:py-20">
      <div className="container-x">
        <SectionTitle
          eyebrow="Отзывы"
          title={
            <>
              {SITE.reviewsCount} отзывов — <span className="italic text-gold">и все на пять звёзд</span>
            </>
          }
          sub={`Настоящие отзывы покупателей с ${SITE.reviewsSource}, без правок.`}
        />

        <div className="grid grid-cols-3 gap-3 md:gap-5">
          {STATS.map((s) => (
            <div key={s.label} className="rounded-3xl border border-line bg-cream p-3.5 md:p-6">
              <p className="flex items-center gap-1 text-[24px] font-extrabold leading-none tracking-tight md:text-[40px]">
                {s.big}
                {s.star && <Star className="h-5 w-5 fill-honey text-honey md:h-7 md:w-7" />}
              </p>
              <p className="mt-1.5 text-[12px] font-semibold leading-snug text-ink-soft md:text-[14px]">{s.label}</p>
            </div>
          ))}
        </div>

        {/* лента 6 свежих отзывов */}
        <div tabIndex={0} role="region" aria-label="Свежие отзывы — листайте в сторону" className="no-scrollbar -mx-4 mt-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:mt-8 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:px-0">
          {FRESH.map((r) => (
            <figure key={r.name} className="flex w-[82%] shrink-0 snap-center flex-col rounded-3xl border border-line bg-cream p-5 md:w-auto">
              <div className="flex items-center justify-between gap-2">
                <div className="flex gap-0.5" role="img" aria-label="5 звёзд из 5">
                  {Array.from({ length: 5 }).map((_, k) => (
                    <Star key={k} className="h-4 w-4 fill-honey text-honey" />
                  ))}
                </div>
                <span className="text-[12px] font-semibold text-muted">{r.date}</span>
              </div>
              <blockquote className="mt-3 flex-1 text-[15px] leading-relaxed">«{r.text}»</blockquote>
              <figcaption className="mt-4 text-[13px] font-bold">
                {r.name} <span className="font-semibold text-muted">· {r.item}</span>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-6 flex justify-center">
          <a
            href={SITE.reviewsUrl}
            target="_blank"
            rel="noopener"
            onClick={() => goal('reviews_source_click')}
            className="run-border inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-cream px-5 text-[14px] font-bold text-ink"
          >
            Все {SITE.reviewsCount} отзывов на {SITE.reviewsSource} <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  )
}
