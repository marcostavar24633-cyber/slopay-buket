import { ArrowRight } from 'lucide-react'
import { SectionTitle } from '@/components/shared/section-title'
import type { GalleryCat } from '@/lib/gallery'
import { goal } from '@/lib/analytics'
import { OCCASIONS_DATA } from '@/lib/content'

/**
 * «По поводам»: люди ищут подарок под повод — плитка ведёт в нужную категорию каталога
 * или в корпоративный блок. Фото — реальные работы.
 */
type Go = { cat: GalleryCat } | { corporate: true }
/** Поводы — из админки (content/occasions.json): «Куда ведёт» — категория каталога или corporate. */
const OCCASIONS: { t: string; d: string; img: string; go: Go }[] = OCCASIONS_DATA.map((o) => ({
  t: o.title,
  d: o.text,
  img: o.image,
  go: o.target === 'corporate' ? { corporate: true } : { cat: o.target as GalleryCat },
}))

export function Occasions() {
  const open = (o: (typeof OCCASIONS)[number]) => {
    goal('occasion_click', { occasion: o.t })
    if ('corporate' in o.go) {
      location.href = import.meta.env.BASE_URL + 'corporate/'
      return
    }
    window.dispatchEvent(new CustomEvent('open-category', { detail: o.go.cat }))
  }
  return (
    <section id="occasions" className="py-10 md:py-16">
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
        <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
          {OCCASIONS.map((o) => (
            <button
              key={o.t}
              onClick={() => open(o)}
              className="run-border group relative aspect-[4/3] w-[42%] shrink-0 snap-start cursor-pointer overflow-hidden sm:w-[30%] lg:w-[19%] rounded-3xl text-left ring-1 ring-line transition hover:ring-honey/60"
            >
              <img loading="lazy" src={o.img} alt={`${o.t}: ${o.d} — работа мастерской`} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
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
