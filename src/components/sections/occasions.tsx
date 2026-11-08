import { ArrowRight } from 'lucide-react'
import { SectionTitle } from '@/components/shared/section-title'
import type { GalleryCat } from '@/lib/gallery'
import { goal } from '@/lib/analytics'
import { scrollToId } from '@/lib/ui-store'

/**
 * «По поводам»: люди ищут подарок под повод — плитка ведёт в нужную категорию каталога
 * или в корпоративный блок. Фото — реальные работы.
 */
type Go = { cat: GalleryCat } | { corporate: true }
const OCCASIONS: { t: string; d: string; img: string; go: Go }[] = [
  { t: '8 Марта', d: 'ягодные сердца и корзины', img: '/img/real/berry/thumbs/yag-20.webp', go: { cat: 'berry' } },
  { t: '14 Февраля', d: 'клубника и розы', img: '/img/real/berry/thumbs/yag-24.webp', go: { cat: 'berry' } },
  { t: 'День рождения', d: 'сердца, корзины, мясные', img: '/img/real/berry/thumbs/yag-22.webp', go: { cat: 'berry' } },
  { t: '23 Февраля и мужчине', d: 'мясные и раковые букеты', img: '/img/real/meat/thumbs/k-36.webp', go: { cat: 'meat' } },
  { t: 'Маме', d: 'сухофрукты и орехи', img: '/img/real/dried/thumbs/suh-10.webp', go: { cat: 'dried' } },
  { t: 'Новый год', d: 'праздничные наборы', img: '/img/real/dried/thumbs/suh-1.webp', go: { cat: 'dried' } },
  { t: '1 сентября и учителю', d: 'сладкие боксы', img: '/img/real/sweet/thumbs/sl-1.webp', go: { cat: 'sweet' } },
  { t: 'Коллегам', d: 'корпоративные подарки', img: '/img/real/sweet/thumbs/sl-22.webp', go: { corporate: true } },
]

export function Occasions() {
  const open = (o: (typeof OCCASIONS)[number]) => {
    goal('occasion_click', { occasion: o.t })
    if ('corporate' in o.go) {
      window.dispatchEvent(new CustomEvent('prefill-corporate'))
      return scrollToId('corporate')
    }
    window.dispatchEvent(new CustomEvent('open-category', { detail: o.go.cat }))
  }
  return (
    <section id="occasions" className="py-14 md:py-20">
      <div className="container-x">
        <SectionTitle
          eyebrow="По поводам"
          title={
            <>
              Подарок <span className="italic text-gold">к любому случаю</span>
            </>
          }
          sub="Выберите повод — покажем подходящие работы."
        />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          {OCCASIONS.map((o) => (
            <button
              key={o.t}
              onClick={() => open(o)}
              className="group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-3xl text-left ring-1 ring-line transition hover:ring-honey/60"
            >
              <img loading="lazy" src={o.img} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
              <span className="absolute inset-x-3 bottom-3 text-white md:inset-x-4 md:bottom-4">
                <span className="block font-display text-[17px] font-semibold leading-tight md:text-[22px]">{o.t}</span>
                <span className="mt-0.5 flex items-center gap-1 text-[12px] font-semibold text-white/80 md:text-[13px]">
                  {o.d} <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#f3d98a]" />
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
