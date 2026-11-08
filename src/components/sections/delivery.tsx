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
  { icon: '⏰', t: 'Доставим вовремя', d: 'Курьер Яндекс Go везёт напрямую. Задержались по нашей вине — доставку оплатим сами.' },
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
            <CityScheme />
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

/** Упрощённая схема города: Волга делит Заволжье и правый берег. */
function CityScheme() {
  return (
    <svg viewBox="0 0 520 400" className="h-full min-h-[300px] w-full" role="img" aria-label="Схема зон доставки по Ульяновску">
      <rect width="520" height="400" className="fill-surface" />
      {/* правый берег */}
      <path d="M0 0h250c-10 70-50 120-40 200s50 130 40 200H0z" className="fill-berry" fillOpacity=".08" />
      {/* Волга */}
      <path d="M250 0c-10 70-50 120-40 200s50 130 40 200h70c10-70-30-130-20-200s40-130 40-200z" className="fill-river" />
      <text x="282" y="210" className="fill-river-fg" fontSize="13" fontWeight="700" transform="rotate(80 282 210)" textAnchor="middle">Волга</text>
      {/* мосты */}
      <rect x="205" y="118" width="120" height="7" rx="3" className="fill-honey" fillOpacity=".75" />
      <rect x="215" y="268" width="110" height="7" rx="3" className="fill-honey" fillOpacity=".75" />
      <text x="265" y="112" fontSize="10" className="fill-ink-soft" textAnchor="middle">Президентский мост</text>
      <text x="270" y="292" fontSize="10" className="fill-ink-soft" textAnchor="middle">Императорский мост</text>
      {/* Заволжье */}
      <path d="M320 0h200v400H320c10-70-30-130-20-200S340 70 320 0z" className="fill-honey" fillOpacity=".07" />
      <circle cx="430" cy="150" r="72" className="fill-honey stroke-honey" fillOpacity=".16" strokeOpacity=".5" strokeDasharray="4 6" />
      <image href="/logo-256.webp" x="408" y="118" width="44" height="44" />
      <text x="430" y="182" fontSize="12" fontWeight="800" className="fill-ink" textAnchor="middle">Мастерская</text>
      <text x="430" y="242" fontSize="13" fontWeight="700" className="fill-honey-600" textAnchor="middle">Новый город</text>
      <text x="425" y="300" fontSize="12" fontWeight="700" className="fill-honey-600" textAnchor="middle">Верхняя Терраса</text>
      <text x="415" y="350" fontSize="11.5" fontWeight="700" className="fill-honey-600" textAnchor="middle">Старый город Заволжья</text>
      {/* правый берег подписи */}
      <text x="110" y="70" fontSize="12" fontWeight="700" className="fill-berry" textAnchor="middle">Правый берег</text>
      <text x="110" y="190" fontSize="13" fontWeight="800" className="fill-berry" textAnchor="middle">Ленинский (центр)</text>
      <text x="110" y="292" fontSize="12" fontWeight="700" className="fill-berry" textAnchor="middle">Засвияжье,</text>
      <text x="110" y="308" fontSize="12" fontWeight="700" className="fill-berry" textAnchor="middle">Железнодорожный</text>
    </svg>
  )
}
