import { MapPin } from 'lucide-react'
import { Parallax } from '@/components/aceternity/parallax'
import { BlurFade } from '@/components/magicui/blur-fade'
import { SITE } from '@/lib/config'

const COLLAGE = [
  ['/img/real/sea/m-16.webp', 'Букет из раков и креветок с черри и лимоном — работа мастерской'],
  ['/img/real/berry/yag-21.webp', 'Сердце из клубники, голубики и малины — работа мастерской'],
  ['/img/real/meat/k-1.webp', 'Мясной букет с колбасами, сыром и багетами — работа мастерской'],
  ['/img/real/dried/suh-21.webp', 'Шляпная коробка с сухофруктами и розой из кураги — работа мастерской'],
]

export function Process() {
  return (
    <section id="process" className="pb-20 pt-6 md:py-24">
      <div className="container-x">
        {/* Кто собирает */}
        <div className="grid items-center gap-8 md:grid-cols-[0.8fr_1.2fr] md:gap-14">
          <BlurFade className="relative">
            <div className="grid grid-cols-2 gap-3">
              {COLLAGE.map(([src, alt], i) => (
                <img loading="lazy" key={src} src={src} alt={alt} className={`aspect-square w-full rounded-3xl object-cover shadow-lift ring-1 ring-honey/25 ${i % 2 ? 'translate-y-6' : ''}`} />
              ))}
            </div>
            <Parallax speed={-0.3} className="absolute -bottom-8 left-5 right-5 md:-right-8 md:left-auto md:w-64">
              <div className="flex items-center gap-2 rounded-2xl border border-honey/30 bg-surface/95 p-4 text-[14px] font-bold shadow-lift backdrop-blur">
                <MapPin className="h-5 w-5 shrink-0 text-berry" /> Находимся в Новом городе — можно забрать самим
              </div>
            </Parallax>
          </BlurFade>
          <BlurFade delay={0.1}>
            <p className="eyebrow mb-3">Кто собирает</p>
            <h2 className="h-display text-[30px] md:text-[42px]">
              Каждый букет собирает <span className="italic text-gold">{SITE.masterName}</span>
            </h2>
            <div className="mt-6 space-y-4 text-[16px] leading-relaxed text-ink-soft">
              <p>
                С {SITE.sinceYear} года — клубничные сердца, мясные и раковые букеты, сухофрукты и сладкие боксы. Вручную, под повод и бюджет,
                с ответом в мессенджере, а не автоответчиком.
              </p>
              <p>За это время — только пятёрки на {SITE.reviewsSource}. Вот как о Марии пишут покупатели:</p>
            </div>
            <ul className="mt-6 space-y-3">
              {['«Мария справилась на 200%»', '«У Машеньки ручки золотые»', '«Классный и порядочный человек»'].map((q) => (
                <li key={q} className="flex items-start gap-3 rounded-2xl border border-line bg-surface/70 px-4 py-3 font-display text-[18px] italic">
                  <span className="text-honey">★</span> {q}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[12px] text-muted">Цитаты из отзывов на {SITE.reviewsSource} — скриншоты в блоке «Отзывы».</p>
          </BlurFade>
        </div>
      </div>
    </section>
  )
}
