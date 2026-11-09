import { CalendarCheck, CreditCard, EyeOff } from 'lucide-react'
import { SectionTitle } from '@/components/shared/section-title'
import { BlurFade } from '@/components/magicui/blur-fade'
import { Button } from '@/components/ui/button'
import { TelegramIcon, MaxIcon } from '@/components/shared/icons'
import { SITE, MSG, tgLink, maxLink } from '@/lib/config'
import { goal } from '@/lib/analytics'
import { rub } from '@/lib/utils'

const STEPS = [
  { n: '01', t: 'Выберите букет', d: 'В каталоге — или пришлите любое фото-пример из Pinterest.' },
  { n: '02', t: 'Согласуем детали', d: 'Состав, дату, время и адрес доставки.' },
  { n: '03', t: 'Пришлём фото готового букета', d: 'Перед отправкой — вы видите, что получит человек.' },
  { n: '04', t: 'Курьер доставит и вручит', d: 'Пришлём ссылку Яндекс Go — следите за курьером на карте.' },
]

const GUARANTEES = [
  { icon: '📸', t: 'Фото до отправки', d: 'Пришлём фото готового букета — вы видите именно то, что получит человек.' },
  { icon: '🛡️', t: 'Гарантия свежести', d: 'Продукт несвежий? Пришлите фото в течение 2 часов после вручения — после проверки сделаем скидку на заказ.' },
  { icon: '⏰', t: 'Доставим вовремя', d: 'Курьер Яндекс Go везёт напрямую, без пересадок на складах. Время вручения согласуем заранее.' },
]

const DETAILS = [
  { icon: CalendarCheck, t: 'Доставка к удобному времени', d: 'Договоримся о дате и времени вручения. Лучше заказать за 1–2 дня, в отдельных случаях соберём день в день.' },
  { icon: EyeOff, t: 'Анонимно, сюрпризом', d: 'Не скажем, от кого, пока не разрешите. Курьер вручит молча или с вашей фразой.' },
  { icon: CreditCard, t: 'Оплата удобным способом', d: 'Перевод по СБП, карта онлайн, для юрлиц — по счёту. Оплата после согласования букета.' },
]

/** «4 шага и 3 гарантии» — как заказать и чем мы отвечаем, одним блоком. */
export function HowToOrder() {
  return (
    <section id="how" className="bg-surface py-14 md:py-20">
      <div className="container-x">
        <SectionTitle
          eyebrow="4 шага и 3 гарантии"
          title={
            <>
              Пара сообщений — <span className="italic text-gold">и букет едет к получателю</span>
            </>
          }
        />
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <li key={s.n} className="relative rounded-3xl border border-line bg-cream p-5">
              <span className="font-display text-[36px] font-semibold italic leading-none text-honey">{s.n}</span>
              <h3 className="mt-3 text-[16px] font-extrabold">{s.t}</h3>
              <p className="mt-1 text-[14px] leading-relaxed text-ink-soft">{s.d}</p>
            </li>
          ))}
        </ol>
        <ul className="mt-3 grid gap-3 md:grid-cols-3">
          {GUARANTEES.map((g) => (
            <li key={g.t} className="flex gap-3 rounded-3xl border border-honey/30 bg-honey-100 p-5">
              <span className="text-[26px] leading-none">{g.icon}</span>
              <span>
                <b className="block text-[16px] font-extrabold">{g.t}</b>
                <span className="mt-1 block text-[14px] leading-relaxed text-ink-soft">{g.d}</span>
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-8 hidden justify-center gap-3 md:flex">
          <Button variant="max" size="lg" asChild>
            <a href={maxLink(MSG.howOrder)} target="_blank" rel="noopener" onClick={() => goal('max_click', { from: 'how-order' })}>
              <MaxIcon className="h-5 w-5" /> Заказать в MAX
            </a>
          </Button>
          <Button variant="tgOutline" size="lg" asChild>
            <a href={tgLink(MSG.howOrder)} target="_blank" rel="noopener" onClick={() => goal('tg_click', { from: 'how-order' })}>
              <TelegramIcon className="h-5 w-5" /> Заказать в Telegram
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}

export function Delivery() {
  return (
    <section id="delivery" className="py-14 md:py-24">
      <div className="container-x">
        <SectionTitle
          eyebrow="Доставка по Ульяновску"
          title={
            <>
              Привезём к нужному часу — <span className="italic text-gold">по всему Ульяновску</span>
            </>
          }
          sub="Мастерская в Новом городе. Привезём и в Заволжье, и на правый берег — доставка курьером по тарифам Яндекс Go."
        />

        <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
          <BlurFade className="overflow-hidden rounded-3xl border border-line bg-surface">
            <DeliveryMap />
          </BlurFade>
          <BlurFade delay={0.08}>
            <DeliveryPrice />
          </BlurFade>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DETAILS.map((d, i) => (
            <BlurFade key={d.t} delay={i * 0.04} className="flex gap-4 rounded-3xl border border-line bg-surface p-5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-cream-2">
                <d.icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-[15px] font-extrabold leading-snug">{d.t}</h3>
                <p className="mt-1 text-[13.5px] leading-relaxed text-ink-soft">{d.d}</p>
              </div>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  )
}

/** Стоимость доставки: по тарифам Яндекс Go, без фиксированных цен на сайте. */
const DELIVERY_POINTS = [
  { icon: '📍', t: 'Считает Яндекс Go по вашему адресу', d: 'Стоимость зависит от расстояния и загруженности дорог в момент отправки — назовём точную сумму при оформлении.' },
  { icon: '🎁', t: 'Бесплатно по Новому городу', d: `При заказе от ${rub(SITE.freeDeliveryFrom)}.` },
  { icon: '🏠', t: 'Самовывоз — бесплатно', d: `Из мастерской: ${SITE.address}.` },
  { icon: '🛵', t: 'Следите за курьером', d: 'Пришлём ссылку Яндекс Go — видно, где букет и когда приедет.' },
]

function DeliveryPrice() {
  return (
    <div className="flex h-full flex-col gap-5 rounded-3xl border border-line bg-surface p-5 md:p-6">
      <div>
        <p className="eyebrow mb-2">Стоимость доставки</p>
        <p className="font-display text-[28px] font-semibold leading-tight md:text-[34px]">
          По тарифам <span className="italic text-gold">Яндекс Go</span>
        </p>
      </div>
      <ul className="flex flex-col gap-3">
        {DELIVERY_POINTS.map((p) => (
          <li key={p.t} className="flex gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-cream-2 text-lg">{p.icon}</span>
            <span>
              <span className="block text-[15px] font-extrabold leading-snug">{p.t}</span>
              <span className="mt-0.5 block text-[13.5px] leading-relaxed text-ink-soft">{p.d}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Настоящая Яндекс Карта с мастерской; грузится, только когда блок близко к экрану. */
function DeliveryMap() {
  const q = encodeURIComponent(`Ульяновск, ${SITE.address.replace(', Новый город', '')}`)
  return (
    <div className="relative h-full min-h-[320px] w-full">
      <iframe
        title="Мастерская «Слопай букет» и зона доставки на Яндекс Картах"
        src={`https://yandex.ru/map-widget/v1/?text=${q}&z=11`}
        className="absolute inset-0 h-full w-full border-0"
        loading="lazy"
        allowFullScreen
      />
      <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-surface/95 px-3 py-1.5 text-[12.5px] font-bold text-ink shadow-soft">
        📍 Мастерская: {SITE.address}
      </span>
    </div>
  )
}
