import { MapPin, ShieldCheck } from 'lucide-react'
import { ParallaxImage, Parallax } from '@/components/aceternity/parallax'
import { SectionTitle } from '@/components/shared/section-title'
import { BlurFade } from '@/components/magicui/blur-fade'
import { SITE } from '@/lib/config'

const STEPS = [
  { time: '8:00', title: 'Закупка утром в день сборки', text: 'Клубника, сыр и мясо — от проверенных поставщиков. Чек с датой храним и покажем по запросу.', img: '/img/purchase.webp' },
  { time: '9:30', title: 'Подготовка', text: 'Моем и сушим ягоды, нарезаем сыр и мясо прямо перед сборкой — ничего не лежит «с вечера».', img: '/img/cheese.webp' },
  { time: '10:00', title: 'Сборка в перчатках и маске', text: 'Пищевые шпажки, герметичная плёнка на сыре и мясе, чистая поверхность для аллергиков.', img: '/img/master.webp' },
  { time: '12:30', title: 'Фото букета вам до отправки', text: 'Вы видите именно тот букет, который получит человек. Не нравится — пересоберём.', img: '/img/straw.webp', phone: true },
  { time: '13:00', title: 'Упаковка и передача курьеру', text: 'Коробка + прозрачная защитная плёнка. Курьер Яндекс Go везёт напрямую, без заездов.', img: '/img/newyear.webp' },
]

export function Process() {
  return (
    <section id="process" className="py-14 md:py-24">
      <div className="container-x">
        <SectionTitle
          eyebrow="Свежесть и гигиена"
          title={
            <>
              От закупки до вашей двери — <span className="italic text-gold">не больше 6 часов</span>
            </>
          }
          sub="Самый частый скрытый вопрос: «кто трогал продукты и сколько они лежали?» Показываем весь путь букета."
        />
      </div>

      <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 md:mx-auto md:max-w-[1240px] md:px-8 md:grid md:grid-cols-5 md:gap-5 md:overflow-visible">
        {STEPS.map((s, i) => (
          <BlurFade key={s.title} delay={i * 0.06} className="relative w-[78%] shrink-0 snap-center sm:w-[45%] md:w-auto">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-cream-2">
              {s.phone ? (
                <div className="grid h-full place-items-center bg-gradient-to-b from-honey-100 to-cream-2 p-5">
                  <div className="w-[70%] rounded-[26px] border-[6px] border-black bg-[#0b141a] ring-1 ring-honey/40 p-1.5 shadow-lift">
                    <div className="overflow-hidden rounded-2xl bg-[#202c33]">
                      <img src={s.img} alt="Фото готового букета в WhatsApp перед отправкой" className="aspect-square w-full object-cover" loading="lazy" />
                      <p className="px-2 py-1.5 text-[10px] leading-tight">Ваш букет готов 💐 Отправляем?</p>
                    </div>
                  </div>
                </div>
              ) : (
                <ParallaxImage src={s.img} alt={s.title} className="h-full" strength={0.08} />
              )}
              <span className="absolute left-3 top-3 rounded-full bg-honey px-3 py-1 text-[12px] font-bold text-onaccent">
                {i + 1} · {s.time}
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
            Работаем официально · {SITE.legal.split(' · ').slice(0, 2).join(' · ')} · чек на каждый заказ · у мастеров действующие медкнижки
          </p>
        </BlurFade>

        {/* Кто собирает */}
        <div className="mt-14 grid items-center gap-8 md:mt-20 md:grid-cols-[0.8fr_1.2fr] md:gap-14">
          <BlurFade className="relative">
            <ParallaxImage src="/img/founder.webp" alt={`${SITE.masterName} Савельева — основатель «Слопай букет»`} className="aspect-[4/5] rounded-[32px] shadow-lift ring-1 ring-honey/25" strength={0.1} />
<Parallax speed={-0.3} className="absolute -bottom-5 left-5 right-5 md:-right-8 md:left-auto md:w-64">
            <div className="flex items-center gap-2 rounded-2xl border border-honey/30 bg-surface/95 p-4 backdrop-blur text-[14px] font-bold shadow-lift">
              <MapPin className="h-5 w-5 shrink-0 text-berry" /> Находимся в Новом городе — мастерская открыта для самовывоза
            </div>
            </Parallax>
          </BlurFade>
          <BlurFade delay={0.1}>
            <p className="eyebrow mb-3">Кто собирает</p>
            <blockquote className="h-display text-[26px] leading-snug md:text-[36px]">
              «Я начала в 2023-м с букета для мамы — она сказала: <span className="italic text-gold">„цветы завянут, а это я буду вспоминать“</span>»
            </blockquote>
            <div className="mt-6 space-y-4 text-[16px] leading-relaxed text-ink-soft">
              <p>
                Меня зовут {SITE.masterName}. «Слопай» — потому что мой букет не должен стоять в вазе. Его должны съесть с удовольствием, всей компанией, в тот же вечер.
              </p>
              <p>
                Для меня важно три вещи: продукты, которые я сама дала бы ребёнку, честный размер — как на фото, и ответ клиенту за 5 минут. Каждый букет я или мои девочки собираем вручную в нашей мастерской в Новом городе.
              </p>
            </div>
            <p className="mt-6 font-display text-2xl italic">{SITE.masterName} Савельева</p>
            <p className="text-[13px] text-muted">основатель «Слопай букет»</p>
          </BlurFade>
        </div>
      </div>
    </section>
  )
}
