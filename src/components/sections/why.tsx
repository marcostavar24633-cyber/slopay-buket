import { Check, X } from 'lucide-react'
import { ParallaxImage } from '@/components/aceternity/parallax'
import { SectionTitle } from '@/components/shared/section-title'
import { BlurFade } from '@/components/magicui/blur-fade'
import { Button } from '@/components/ui/button'
import { goal } from '@/lib/analytics'
import { useUI } from '@/lib/ui-store'

const ROWS = [
  ['Вянут через 3–5 дней и отправляются в мусор', 'Съедается в тот же вечер — ничего не пропадает'],
  ['Один из десятка букетов на празднике', 'Все гости фотографируют и спрашивают «где заказывали?»'],
  ['Мужчине дарить неловко', 'Мясо, сыр и снеки — идеальный мужской подарок'],
  ['Нужна ваза, вода, уход', 'Готовый стол на компанию — открыл и угощаешь'],
  ['25 роз в Ульяновске — от 4 500 ₽', 'От 2 000 ₽ — и подарок, и угощение для всей компании'],
]

export function Why() {
  const { setQuizOpen } = useUI()
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

        {/* итог и действие */}
        <div className="mt-6 flex flex-col items-start gap-4 rounded-3xl border border-honey/30 bg-honey-100 p-5 md:flex-row md:items-center md:justify-between md:p-7">
          <p className="font-display text-[22px] font-semibold leading-tight md:text-[28px]">
            Тот же бюджет — <span className="italic text-gold">но подарок, о котором будут говорить</span>
          </p>
          <Button size="lg" className="w-full shrink-0 md:w-auto" onClick={() => { goal('why_quiz'); setQuizOpen(true) }}>
            Подобрать вместо цветов
          </Button>
        </div>
      </div>
    </section>
  )
}
