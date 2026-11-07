import { useState } from 'react'
import { Baby, CalendarCheck, CreditCard, EyeOff, Loader2, Store } from 'lucide-react'
import { SectionTitle } from '@/components/shared/section-title'
import { BlurFade } from '@/components/magicui/blur-fade'
import { Button } from '@/components/ui/button'
import { PhoneInput } from '@/components/ui/input'
import { TelegramIcon, MaxIcon } from '@/components/shared/icons'
import { SITE, MSG, tgLink, maxLink } from '@/lib/config'
import { isPhoneValid } from '@/lib/phone'
import { submitLead } from '@/lib/leads'
import { goal } from '@/lib/analytics'
import { useUI } from '@/lib/ui-store'
import { rub } from '@/lib/utils'

const STEPS = [
  { n: '01', t: 'Выберите букет', d: 'В каталоге — или пришлите любое фото-пример из Pinterest.' },
  { n: '02', t: 'Согласуем детали', d: 'Состав, текст открытки, дату и время доставки.' },
  { n: '03', t: 'Пришлём фото готового букета', d: 'Перед отправкой — вы видите, что получит человек.' },
  { n: '04', t: 'Курьер доставит и вручит', d: 'Пришлём ссылку Яндекс Go — следите за курьером на карте.' },
]

const ZONES = [
  { zone: 'Новый город (Заволжский)', price: 250, color: '#ebcb6e' },
  { zone: 'Старый город Заволжья, Верхняя Терраса', price: 350, color: '#d4af37' },
  { zone: 'Ленинский (центр), Засвияжский, Железнодорожный', price: 450, color: '#e2566c' },
  { zone: 'Пригород (Чердаклы и др.)', price: null, color: '#948872' },
]

const DETAILS = [
  { icon: CalendarCheck, t: 'Доставка к удобному времени', d: 'Договоримся о дате и времени вручения. Лучше заказать за 1–2 дня, в отдельных случаях соберём день в день.' },
  { icon: EyeOff, t: 'Анонимно, сюрпризом', d: 'Не скажем, от кого, пока не разрешите. Курьер вручит молча или с вашей фразой.' },
  { icon: Store, t: 'Самовывоз из Нового города — бесплатно', d: SITE.address + '. Подготовим к вашему времени.' },
  { icon: CreditCard, t: 'Оплата удобным способом', d: 'Перевод по СБП, карта онлайн, для юрлиц — по счёту. Оплата после согласования букета.' },
  { icon: Baby, t: 'Детские и аллерген-free букеты', d: 'Без орехов, без глютена, без лактозы — соберём на отдельной чистой поверхности.' },
]

export function HowToOrder() {
  return (
    <section id="how" className="bg-surface py-14 md:py-24">
      <div className="container-x">
        <SectionTitle
          eyebrow="Как заказать"
          title={
            <>
              Пара сообщений — <span className="italic text-gold">и букет едет к получателю</span>
            </>
          }
        />
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <BlurFade key={s.n} delay={i * 0.06} className="relative rounded-3xl border border-line bg-cream p-6">
              <span className="font-display text-[44px] font-semibold italic leading-none text-honey">{s.n}</span>
              <h3 className="mt-4 text-[17px] font-extrabold">{s.t}</h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-ink-soft">{s.d}</p>
            </BlurFade>
          ))}
        </ol>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button variant="max" size="lg" asChild>
            <a href={maxLink(MSG.howOrder)} target="_blank" rel="noopener" onClick={() => goal('max_click', { from: 'how-order' })}>
              <MaxIcon className="h-5 w-5" /> Заказать в MAX
            </a>
          </Button>
          <Button variant="tgOutline" size="lg" asChild>
            <a href={tgLink()} target="_blank" rel="noopener" onClick={() => goal('tg_click', { from: 'how-order' })}>
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
              Доставляем <span className="italic text-gold">по всему Ульяновску</span> — к удобному вам времени
            </>
          }
          sub="Мастерская в Новом городе. Привезём и в Заволжье, и на правый берег — стоимость зависит от района."
        />

        <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
          <BlurFade className="overflow-hidden rounded-3xl border border-line bg-surface">
            <CityScheme />
          </BlurFade>
          <BlurFade delay={0.08} className="overflow-hidden rounded-3xl border border-line bg-surface">
            <table className="w-full text-left text-[14px]">
              <thead className="bg-cream-2 text-[12px] font-bold uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-4 py-3 md:px-6">Район</th>
                  <th className="px-4 py-3 text-right md:px-6">Стоимость</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {ZONES.map((z) => (
                  <tr key={z.zone}>
                    <td className="px-4 py-4 font-semibold md:px-6">
                      <span className="flex items-start gap-2.5">
                        <span className="mt-1 h-3 w-3 shrink-0 rounded-full" style={{ background: z.color }} />
                        {z.zone}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-right font-bold md:px-6">{z.price ? `от ${rub(z.price)}` : 'по запросу'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="m-4 rounded-2xl bg-honey-100 px-4 py-3 text-[14px] font-bold md:mx-6">
              🎁 Бесплатная доставка по Новому городу при заказе от {rub(SITE.freeDeliveryFrom)}
            </div>
            <p className="px-4 pb-5 text-[12px] text-muted md:px-6">Цены — ориентир по тарифам Яндекс Go, в праздники могут меняться.</p>
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

        <DeliveryCheck />
      </div>
    </section>
  )
}

function DeliveryCheck() {
  const { showThanks } = useUI()
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isPhoneValid(phone)) return setErr('Проверьте номер')
    setErr('')
    setLoading(true)
    const ok = await submitLead({ source: 'delivery-check', phone })
    setLoading(false)
    if (ok) {
      setPhone('')
      showThanks()
    } else setErr('Ошибка отправки — позвоните нам')
  }
  return (
    <BlurFade className="mt-8 rounded-3xl bg-panel text-ink border border-honey/25 p-6 md:p-8">
      <form onSubmit={submit} noValidate className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="font-display text-[24px] font-semibold leading-tight md:text-[28px]">Сколько стоит доставка до вашего адреса?</p>
          <p className="mt-1 text-[14px] text-ink/65">Оставьте номер — перезвоним и подскажем стоимость и свободные даты</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
          <PhoneInput dark value={phone} onChange={setPhone} aria-label="Телефон" className="sm:w-64" />
          <Button type="submit" size="md" disabled={loading} className="h-12 shrink-0">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Узнать'}
          </Button>
        </div>
      </form>
      {err && <p className="mt-2 text-sm font-semibold text-honey" role="alert">{err}</p>}
      <p className="mt-3 text-[11.5px] text-ink/45">Нажимая «Узнать», вы соглашаетесь с политикой обработки персональных данных (152-ФЗ).</p>
    </BlurFade>
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
      <circle cx="430" cy="150" r="8" className="fill-honey" />
      <text x="430" y="135" fontSize="22" textAnchor="middle">🍓</text>
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
