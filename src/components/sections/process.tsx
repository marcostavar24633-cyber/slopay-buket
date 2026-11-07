import { Droplets, Hand, MapPin, Package, ShieldCheck, ShoppingBasket, type LucideIcon } from 'lucide-react'
import { Parallax } from '@/components/aceternity/parallax'
import { SectionTitle } from '@/components/shared/section-title'
import { BlurFade } from '@/components/magicui/blur-fade'
import { SITE, legalLine } from '@/lib/config'

const STEPS: { title: string; text: string; icon?: LucideIcon; img?: string }[] = [
  { title: 'Закупка утром в день сборки', text: 'Ягоды, раки, сыр и мясо — от проверенных поставщиков.', icon: ShoppingBasket },
  { title: 'Подготовка', text: 'Моем и сушим ягоды, нарезаем сыр и мясо прямо перед сборкой — ничего не лежит «с вечера».', icon: Droplets },
  { title: 'Сборка в перчатках', text: 'Пищевые шпажки, герметичная плёнка на сыре и мясе, отдельная чистая поверхность для аллергиков.', icon: Hand },
  { title: 'Фото букета вам до отправки', text: 'Вы видите именно тот букет, который получит человек.', img: '/img/real/berry/yag-1.webp' },
  { title: 'Упаковка и передача курьеру', text: 'Упаковано всё в прозрачную защитную плёнку. Курьер Яндекс Go везёт напрямую, без заездов.', icon: Package },
]

const COLLAGE = ['/img/real/sea/m-16.webp', '/img/real/berry/yag-21.webp', '/img/real/meat/k-1.webp', '/img/real/dried/suh-21.webp']

export function Process() {
  return (
    <section id="process" className="py-14 md:py-24">
      <div className="container-x">
        <SectionTitle
          eyebrow="Свежесть и гигиена"
          title={
            <>
              От закупки до вашей двери — <span className="italic text-gold">только свежее</span>
            </>
          }
          sub="Самый частый скрытый вопрос: «кто трогал продукты и сколько они лежали?» Показываем весь путь букета."
        />
      </div>

      <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 md:mx-auto md:max-w-[1240px] md:px-8 md:grid md:grid-cols-5 md:gap-5 md:overflow-visible">
        {STEPS.map((s, i) => (
          <BlurFade key={s.title} delay={i * 0.06} className="relative w-[78%] shrink-0 snap-center sm:w-[45%] md:w-auto">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-cream-2">
              {s.img ? (
                <div className="grid h-full place-items-center bg-gradient-to-b from-honey-100 to-cream-2 p-5">
                  <div className="w-[70%] rounded-[26px] border-[6px] border-black bg-[#0b141a] p-1.5 shadow-lift ring-1 ring-honey/40">
                    <div className="overflow-hidden rounded-2xl bg-[#202c33]">
                      <img loading="lazy" src={s.img} alt="Фото готового букета в MAX перед отправкой" className="aspect-square w-full object-cover" />
                      <p className="px-2 py-1.5 text-[10px] leading-tight text-white">Ваш букет готов 💐 Отправляем?</p>
                    </div>
                  </div>
                </div>
              ) : (
                s.icon && (
                  <div className="relative grid h-full place-items-center overflow-hidden bg-[radial-gradient(circle_at_50%_40%,var(--color-honey-100),var(--color-cream-2)_70%)]">
                    <span aria-hidden className="absolute h-40 w-40 rounded-full border border-honey/20" />
                    <span aria-hidden className="absolute h-56 w-56 rounded-full border border-honey/10" />
                    <s.icon className="relative h-16 w-16 text-honey-600" strokeWidth={1.4} />
                  </div>
                )
              )}
              <span className="absolute left-3 top-3 rounded-full bg-honey px-3 py-1 text-[12px] font-bold text-onaccent">
                Шаг {i + 1}
              </span>
            </div>
            <h3 className="mt-4 text-[17px] font-extrabold leading-snug">{s.title}</h3>
            <p className="mt-1.5 text-[14px] leading-relaxed text-ink-soft">{s.text}</p>
          </BlurFade>
        ))}
      </div>

      <div className="container-x mt-10">
        <BlurFade className="flex flex-col gap-3 rounded-3xl border border-line bg-surface p-5 text-[14px] md:flex-row md:items-center md:gap-6 md:p-6">
          <ShieldCheck className="h-8 w-8 shrink-0 text-leaf" />
          <p className="font-semibold leading-relaxed">
            Работаем официально · чек на каждый заказ{legalLine() ? ` · ${legalLine()}` : ''} · оплата после согласования букета
          </p>
        </BlurFade>

        {/* Кто собирает */}
        <div className="mt-14 grid items-center gap-8 md:mt-20 md:grid-cols-[0.8fr_1.2fr] md:gap-14">
          <BlurFade className="relative">
            <div className="grid grid-cols-2 gap-3">
              {COLLAGE.map((src, i) => (
                <img loading="lazy" key={src} src={src} alt="Работа мастерской" className={`aspect-square w-full rounded-3xl object-cover shadow-lift ring-1 ring-honey/25 ${i % 2 ? 'translate-y-6' : ''}`} />
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
