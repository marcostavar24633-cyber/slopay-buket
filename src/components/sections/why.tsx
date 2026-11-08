import { Check, X } from 'lucide-react'
import { ParallaxImage } from '@/components/aceternity/parallax'
import { SectionTitle } from '@/components/shared/section-title'
import { BlurFade } from '@/components/magicui/blur-fade'
import { CardSpotlight } from '@/components/aceternity/card-spotlight'
import { Button } from '@/components/ui/button'
import { MaxIcon } from '@/components/shared/icons'
import { SITE, MSG, maxLink } from '@/lib/config'
import { goal } from '@/lib/analytics'

const ROWS = [
  ['Вянут через 3–5 дней и отправляются в мусор', 'Съедается в тот же вечер — ничего не пропадает'],
  ['Один из десятка букетов на празднике', 'Все гости фотографируют и спрашивают «где заказывали?»'],
  ['Мужчине дарить неловко', 'Мясо, сыр и снеки — идеальный мужской подарок'],
  ['Нужна ваза, вода, уход', 'Готовый стол на компанию — открыл и угощаешь'],
  ['25 роз в Ульяновске — от 4 500 ₽', 'От 2 000 ₽ — и подарок, и угощение для всей компании'],
]

const ADVANTAGES = [
  { icon: '🌱', title: 'Свежее, как с грядки', text: 'Клубнику, раков, сыр и мясо закупаем в день сборки. Запасов и «вчерашних» продуктов нет.' },
  { icon: '🎨', title: 'Выглядит на все деньги', text: 'Собираем по законам колористики, как флористы. Не пакет из супермаркета на палочках, а композиция, которую хочется сфотографировать.' },
  { icon: '📦', title: 'Доедет идеальным', text: 'Упаковываем всё в прозрачную защитную плёнку. Курьер Яндекс Go везёт напрямую, без заездов — ничего не сместится.' },
  { icon: '🧤', title: 'Собрано чистыми руками — буквально', text: 'Мастер работает в перчатках и маске, на пищевых шпажках. Сыр и мясо в защитной пищевой плёнке — можно сразу на стол.' },
  { icon: '✏️', title: 'Под вас, а не по шаблону', text: 'Уберём орехи при аллергии, заменим дорблю на маасдам, добавим открытку с вашими словами.' },
  { icon: '💳', title: 'На любой бюджет', text: 'От компактного букета-комплимента за 1 700 ₽ до корзины на целый корпоратив. Назовите сумму — соберём лучшее в неё.' },
]

export function Why() {
  return (
    <section className="bg-surface/35 py-14 md:py-24">
      <div className="container-x">
        <SectionTitle
          eyebrow="Цветы или букет из еды?"
          title={
            <>
              Почему всё больше ульяновцев дарят <span className="italic text-gold">съедобные букеты</span> вместо цветов
            </>
          }
        />

        <div className="grid gap-4 md:grid-cols-2 md:gap-6">
          <BlurFade className="overflow-hidden rounded-3xl border border-line bg-surface">
            <div className="relative h-44 md:h-56">
              <ParallaxImage src="/img/wilted.webp" alt="Увядшие розы через несколько дней" className="h-full" imgClassName="grayscale-[60%] brightness-75" />
              <span className="absolute left-4 top-4 rounded-full bg-scrim/90 px-3 py-1 text-[13px] font-bold text-ink-soft">Обычные цветы · день 4</span>
            </div>
            <ul className="divide-y divide-ink/10 p-5 md:p-6">
              {ROWS.map(([a]) => (
                <li key={a} className="flex items-start gap-3 py-3 text-[15px] text-ink-soft">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-ink/10">
                    <X className="h-3.5 w-3.5" />
                  </span>
                  {a}
                </li>
              ))}
            </ul>
          </BlurFade>
          <BlurFade delay={0.1} className="overflow-hidden rounded-3xl bg-panel text-ink border border-honey/25 shadow-lift shadow-honey/10">
            <div className="relative h-44 md:h-56">
              <ParallaxImage src="/img/real/meat/k-23.webp" alt="Мясной съедобный букет — работа мастерской" className="h-full" />
              <span className="absolute left-4 top-4 rounded-full bg-honey px-3 py-1 text-[13px] font-bold text-onaccent">Слопай букет · вечер праздника</span>
            </div>
            <ul className="divide-y divide-white/10 p-5 md:p-6">
              {ROWS.map(([, b], i) => (
                <li key={b} className={`flex items-start gap-3 py-3 text-[15px] ${i === ROWS.length - 1 ? 'font-bold text-honey' : ''}`}>
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-honey text-onaccent">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                  {b}
                </li>
              ))}
            </ul>
          </BlurFade>
        </div>

        <SectionTitle
          className="mt-16 md:mt-24"
          eyebrow="Почему «Слопай букет»"
          title={
            <>
              Все оценки на {SITE.reviewsSource} — 5 звёзд. <span className="italic text-gold">Вот почему</span>
            </>
          }
        />
        <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0">
          {ADVANTAGES.map((a, i) => (
            <BlurFade key={a.title} delay={i * 0.05} className="w-[82%] shrink-0 snap-center md:w-auto">
              <CardSpotlight className="h-full rounded-3xl border border-line bg-cream p-6">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-surface text-[28px] shadow-soft">{a.icon}</span>
                <h3 className="mt-5 text-lg font-extrabold leading-snug">{a.title}</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-ink-soft">{a.text}</p>
              </CardSpotlight>
            </BlurFade>
          ))}
        </div>

        {/* мягкий CTA */}
        <BlurFade className="mt-10 flex flex-col items-start gap-4 rounded-3xl bg-honey-100 p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div>
            <p className="font-display text-[22px] font-semibold leading-tight md:text-[26px]">Назовите бюджет и повод — пришлём 3 варианта с фото</p>
            <p className="mt-1 text-[14px] text-ink-soft">Без обязательств: просто посмотрите, что можно собрать.</p>
          </div>
          <Button variant="max" size="lg" className="w-full shrink-0 md:w-auto" asChild>
            <a href={maxLink(MSG.selection)} target="_blank" rel="noopener" onClick={() => goal('max_click', { from: 'why-selection' })}>
              <MaxIcon className="h-5 w-5" /> Получить подборку в MAX
            </a>
          </Button>
        </BlurFade>
      </div>
    </section>
  )
}
