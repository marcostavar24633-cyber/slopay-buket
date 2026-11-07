import { useEffect, useState } from 'react'
import { ParallaxImage } from '@/components/aceternity/parallax'
import { CalendarClock, Download, Gift, Loader2, Megaphone, Truck } from 'lucide-react'
import { Spotlight } from '@/components/aceternity/spotlight'
import { BlurFade } from '@/components/magicui/blur-fade'
import { Button } from '@/components/ui/button'
import { Chips } from '@/components/ui/chips'
import { Input, PhoneInput } from '@/components/ui/input'
import { Consent } from '@/components/shared/consent'
import { SITE } from '@/lib/config'
import { isPhoneValid } from '@/lib/phone'
import { submitLead } from '@/lib/leads'
import { goal } from '@/lib/analytics'
import { useUI } from '@/lib/ui-store'

const PAINS = [
  { icon: Megaphone, t: 'Надоели ежедневники и кружки', d: 'Съедобный подарок запоминают, фотографируют и с удовольствием съедают всей командой.' },
  { icon: Gift, t: 'Нужно много одинаковых подарков', d: 'Аккуратные коробочки одного стиля — удобно вручать каждому сотруднику или партнёру.' },
  { icon: Truck, t: 'Нет времени заниматься', d: 'Берём всё на себя: соберём, упакуем и привезём в офис к нужной дате.' },
  { icon: CalendarClock, t: 'Боюсь, что в праздник не успеют', d: 'Фиксируем дату по предоплате 50% и заранее бронируем её под вас.' },
]

const FORMATS = [
  { t: 'Сладкая коробочка', p: 'от 1 290 ₽' },
  { t: 'Ягодная коробочка', p: 'от 1 690 ₽' },
  { t: 'Коробочка с сухофруктами', p: 'от 1 490 ₽' },
]


const QTY = [
  { key: '5-10', label: '5–10' },
  { key: '10-20', label: '10–20' },
  { key: '20+', label: '20+' },
] as const

export function Corporate() {
  const { showThanks } = useUI()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [company, setCompany] = useState('')
  const [qty, setQty] = useState<(typeof QTY)[number]['key'] | null>(null)
  const [date, setDate] = useState('')
  const [consent, setConsent] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [highlight, setHighlight] = useState(false)

  useEffect(() => {
    const on = () => {
      setHighlight(true)
      setTimeout(() => setHighlight(false), 2400)
    }
    window.addEventListener('prefill-corporate', on)
    return () => window.removeEventListener('prefill-corporate', on)
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return setError('Как к вам обращаться?')
    if (!isPhoneValid(phone)) return setError('Проверьте номер телефона')
    if (!consent) return setError('Нужно согласие на обработку данных')
    setError('')
    setLoading(true)
    const ok = await submitLead({ source: 'corporate', name, phone, company, qty, date })
    setLoading(false)
    if (!ok) return setError('Не получилось отправить — позвоните нам')
    showThanks(name)
  }

  return (
    <section id="corporate" className="on-dark relative overflow-hidden border-y border-honey/20 bg-graphite/85 py-16 text-white md:py-28">
      <Spotlight className="-top-40 left-0 md:-top-20 md:left-60" />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgb(255_255_255/0.03)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.03)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />

      <div className="container-x relative">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-honey/40 bg-honey/10 px-4 py-2 text-[13px] font-bold text-honey">
          🎄 Новогодние корпоративные заказы принимаем до {SITE.corpDeadline}
        </div>
        <BlurFade className="max-w-3xl">
          <p className="eyebrow mb-3 text-honey">Корпоративным клиентам</p>
          <h2 className="h-display text-[32px] text-white md:text-[52px]">
            Корпоративные подарки, которые <span className="italic text-gold">не отправятся в ящик стола</span>
          </h2>
          <p className="mt-4 text-[16px] text-white/65 md:text-lg">
            Небольшие съедобные подарки в коробочках — для сотрудников, клиентов и партнёров.
          </p>
        </BlurFade>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
          <div>
            <div className="grid gap-3 sm:grid-cols-2">
              {PAINS.map((p, i) => (
                <BlurFade key={p.t} delay={i * 0.05} className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                  <p.icon className="h-6 w-6 text-honey" />
                  <h3 className="mt-3 text-[15px] font-extrabold leading-snug">«{p.t}»</h3>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-white/60">{p.d}</p>
                </BlurFade>
              ))}
            </div>

            <div className="relative mt-5 overflow-hidden rounded-3xl">
              <ParallaxImage src="/img/real/sweet/sl-22.webp" alt="Сладкий бокс — работа мастерской" className="aspect-[16/9]" />
              <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
                {['Компактные коробочки', 'единый стиль', 'на любое количество'].map((t) => (
                  <span key={t} className="rounded-full bg-black/60 px-3 py-1 text-[12px] font-bold backdrop-blur">{t}</span>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {FORMATS.map((f) => (
                <div key={f.t} className="rounded-2xl border border-white/10 p-4">
                  <p className="text-[13px] text-white/60">{f.t}</p>
                  <p className="mt-1 text-xl font-extrabold text-honey">{f.p}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[14px] font-semibold text-white/75">
              Скидка за объём: <span className="text-honey">от 10 шт. — −10%</span>, <span className="text-honey">от 20 шт. — −15%</span>
            </p>

            <figure className="mt-8 rounded-3xl border border-honey/25 bg-white/[0.04] p-5">
              <div className="flex gap-0.5 text-honey">★★★★★</div>
              <blockquote className="mt-2 font-display text-[20px] italic leading-snug text-white">
                «Начальнику очень понравился подарок! Довольный начальник — довольные сотрудники!»
              </blockquote>
              <figcaption className="mt-3 text-[13px] text-white/55">Надя Ч. · букет из раков · {SITE.reviewsSource}, октябрь 2022</figcaption>
            </figure>
          </div>

          <BlurFade delay={0.1}>
            <form
              onSubmit={submit}
              noValidate
              className={`sticky top-24 rounded-3xl border bg-graphite-2 p-5 shadow-2xl transition md:p-7 ${highlight ? 'border-honey ring-4 ring-honey/30' : 'border-white/10'}`}
            >
              <h3 className="font-display text-[26px] font-semibold leading-tight">Рассчитать корпоративный заказ</h3>
              <p className="mt-1 text-[14px] text-white/55">Пришлём КП с фото и ценами</p>
              <div className="mt-5 flex flex-col gap-3">
                <Input dark placeholder="Имя" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} aria-label="Имя" />
                <PhoneInput dark value={phone} onChange={setPhone} aria-label="Телефон" />
                <Input dark placeholder="Компания (необязательно)" autoComplete="organization" value={company} onChange={(e) => setCompany(e.target.value)} aria-label="Компания" />
                <div>
                  <p className="mb-1.5 text-sm font-semibold text-white/60">Количество подарков</p>
                  <Chips dark ariaLabel="Количество" options={QTY} value={qty} onChange={setQty} />
                </div>
                <div>
                  <p className="mb-1.5 text-sm font-semibold text-white/60">Дата мероприятия</p>
                  <Input dark type="date" value={date} onChange={(e) => setDate(e.target.value)} aria-label="Дата мероприятия" className="[color-scheme:dark]" />
                </div>
                <Consent dark checked={consent} onChange={setConsent} />
                {error && <p className="rounded-xl bg-berry/20 px-3 py-2 text-sm font-semibold text-white" role="alert">{error}</p>}
                <Button type="submit" size="lg" disabled={loading}>
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Получить коммерческое предложение'}
                </Button>
                <p className="text-center text-[12.5px] text-white/50">Предоплата 50% — фиксирует дату</p>
                <a
                  href="/corporate-catalog.pdf"
                  download
                  onClick={() => goal('corp_pdf_download')}
                  className="mt-1 inline-flex items-center justify-center gap-2 text-[14px] font-bold text-honey underline underline-offset-4"
                >
                  <Download className="h-4 w-4" /> Скачать каталог корпоративных подарков (PDF)
                </a>
              </div>
            </form>
          </BlurFade>
        </div>
      </div>
    </section>
  )
}
