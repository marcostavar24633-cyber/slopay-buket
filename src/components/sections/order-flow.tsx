import { useEffect, useState } from 'react'
import { Check, Loader2, Minus, Plus } from 'lucide-react'
import { Sheet } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Chips } from '@/components/ui/chips'
import { Checkbox } from '@/components/ui/checkbox'
import { Input, Label, PhoneInput } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Consent } from '@/components/shared/consent'
import { InstagramIcon, VkIcon, WhatsAppIcon } from '@/components/shared/icons'
import { useOrderWindow } from '@/hooks/use-order-window'
import { SITE, WA, waLink } from '@/lib/config'
import { isPhoneValid } from '@/lib/phone'
import { UPSELLS } from '@/lib/products'
import { submitLead } from '@/lib/leads'
import { goal } from '@/lib/analytics'
import { useUI } from '@/lib/ui-store'
import { cn, rub } from '@/lib/utils'

const DATES = [
  { key: 'today', label: 'Сегодня' },
  { key: 'tomorrow', label: 'Завтра' },
  { key: 'other', label: 'Другая дата' },
] as const
export const CONTACTS = [
  { key: 'wa', label: 'WhatsApp' },
  { key: 'tg', label: 'Telegram' },
  { key: 'call', label: 'Позвоните' },
] as const

export function OrderSheet() {
  const { order, closeOrder, showThanks } = useUI()
  const { acceptingToday } = useOrderWindow()
  const [step, setStep] = useState<'form' | 'upsell'>('form')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [date, setDate] = useState<(typeof DATES)[number]['key']>('today')
  const [otherDate, setOtherDate] = useState('')
  const [contact, setContact] = useState<(typeof CONTACTS)[number]['key']>('wa')
  const [card, setCard] = useState(false)
  const [cardText, setCardText] = useState('')
  const [consent, setConsent] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [extras, setExtras] = useState<Record<string, number>>({})

  useEffect(() => {
    if (order) {
      setStep('form')
      setError('')
      setExtras({})
      setDate(acceptingToday ? 'today' : 'tomorrow')
    }
  }, [order, acceptingToday])

  if (!order) return <Sheet open={false} onOpenChange={() => {}} title="Заказ">{null}</Sheet>
  const { product, size } = order

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return setError('Как к вам обращаться?')
    if (!isPhoneValid(phone)) return setError('Проверьте номер телефона')
    if (!consent) return setError('Нужно согласие на обработку данных')
    setError('')
    setLoading(true)
    const ok = await submitLead({
      source: 'order-drawer',
      name,
      phone,
      contact,
      product: product.name,
      size: size.key,
      price: size.price,
      date: date === 'other' ? otherDate || 'другая' : date,
      card: card ? cardText || 'да' : 'нет',
    })
    setLoading(false)
    if (!ok) return setError('Не получилось отправить. Напишите нам в WhatsApp — ответим за 5 минут.')
    setStep('upsell')
  }

  const finish = async () => {
    const chosen = Object.entries(extras).filter(([, q]) => q > 0)
    if (chosen.length) {
      goal('upsell_added', { items: chosen.length })
      await submitLead({ source: 'upsell', phone, name, product: product.name, extras: chosen.map(([id, q]) => `${UPSELLS.find((u) => u.id === id)?.name} ×${q}`).join(', ') })
    }
    closeOrder()
    showThanks(name)
  }

  const extrasSum = Object.entries(extras).reduce((s, [id, q]) => s + (UPSELLS.find((u) => u.id === id)?.price ?? 0) * q, 0)

  return (
    <Sheet open={!!order} onOpenChange={(v) => !v && (step === 'upsell' ? finish() : closeOrder())} title={`Заказ букета «${product.name}»`}>
      <div className="flex items-center gap-3.5 rounded-2xl border border-line bg-surface p-3 md:mt-6">
        <img src={product.image} alt="" className="h-16 w-16 rounded-xl object-cover" />
        <div className="min-w-0">
          <p className="truncate font-display text-lg font-semibold leading-tight">{product.name}</p>
          <p className="text-[13px] text-muted">
            Размер {size.key} · {size.note}
          </p>
        </div>
        <p className="ml-auto shrink-0 text-lg font-extrabold">{rub(size.price + extrasSum)}</p>
      </div>

      {step === 'form' ? (
        <form onSubmit={submit} className="mt-5 flex flex-col gap-4" noValidate>
          <div>
            <Label htmlFor="o-name">Имя</Label>
            <Input id="o-name" autoComplete="given-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Как к вам обращаться" />
          </div>
          <div>
            <Label htmlFor="o-phone">Телефон</Label>
            <PhoneInput id="o-phone" value={phone} onChange={setPhone} />
          </div>
          <div>
            <Label>Дата доставки</Label>
            <Chips ariaLabel="Дата доставки" options={DATES} value={date} onChange={setDate} />
            {date === 'today' && !acceptingToday && <p className="mt-2 text-[12.5px] font-semibold text-berry">Сегодня приём уже закрыт — постараемся, но лучше выбрать завтра.</p>}
            {date === 'other' && <Input type="date" className="mt-2" value={otherDate} onChange={(e) => setOtherDate(e.target.value)} aria-label="Дата" />}
          </div>
          <div>
            <Label>Как связаться</Label>
            <Chips ariaLabel="Способ связи" options={CONTACTS} value={contact} onChange={setContact} />
          </div>
          <Checkbox checked={card} onChange={setCard}>
            Добавить открытку с моим текстом — бесплатно
          </Checkbox>
          {card && (
            <textarea
              value={cardText}
              onChange={(e) => setCardText(e.target.value)}
              rows={3}
              maxLength={200}
              placeholder="С днём рождения, любимая! ❤️"
              className="w-full rounded-2xl border border-line bg-surface p-4 text-base outline-none focus:border-honey-600 focus:ring-4 focus:ring-honey/25"
            />
          )}
          <Consent checked={consent} onChange={setConsent} />
          {error && <p className="rounded-xl bg-berry/10 px-3 py-2 text-sm font-semibold text-berry" role="alert">{error}</p>}
          <Button type="submit" size="lg" disabled={loading}>
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Оформить заказ'}
          </Button>
          <p className="-mt-1 text-center text-[13px] leading-snug text-muted">
            Перезвоним за 10 минут, уточним адрес и время. Оплата — после согласования.
          </p>
        </form>
      ) : (
        <div className="mt-5">
          <div className="flex items-center gap-2 rounded-2xl bg-green-500/10 px-4 py-3 text-[14px] font-bold text-green-300">
            <Check className="h-5 w-5" /> Заявка принята! Пока мастер её смотрит —
          </div>
          <h3 className="mt-4 font-display text-2xl font-semibold">Добавить к заказу?</h3>
          <p className="mt-1 text-[14px] text-ink-soft">Привезём вместе с букетом, одной доставкой.</p>
          <ul className="mt-4 flex flex-col gap-2.5">
            {UPSELLS.map((u) => {
              const q = extras[u.id] ?? 0
              return (
                <li key={u.id} className={cn('flex items-center gap-3 rounded-2xl border bg-surface p-3 transition', q ? 'border-honey' : 'border-line')}>
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-cream-2 text-2xl">{u.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-bold leading-tight">{u.name}</p>
                    <p className="text-[13px] text-muted">{rub(u.price)}</p>
                  </div>
                  {q > 0 && (
                    <button onClick={() => setExtras((x) => ({ ...x, [u.id]: q - 1 }))} className="grid h-10 w-10 cursor-pointer place-items-center rounded-full bg-cream-2" aria-label="Убрать">
                      <Minus className="h-4 w-4" />
                    </button>
                  )}
                  {q > 0 && <span className="w-4 text-center font-bold">{q}</span>}
                  <button onClick={() => setExtras((x) => ({ ...x, [u.id]: q + 1 }))} className="grid h-10 w-10 cursor-pointer place-items-center rounded-full bg-honey text-onaccent" aria-label={`Добавить: ${u.name}`}>
                    <Plus className="h-4 w-4" />
                  </button>
                </li>
              )
            })}
          </ul>
          <Button size="lg" className="mt-5 w-full" onClick={finish}>
            {extrasSum ? `Добавить за ${rub(extrasSum)} и завершить` : 'Нет, спасибо — завершить'}
          </Button>
        </div>
      )}
    </Sheet>
  )
}

export function ThanksDialog() {
  const { thanks, closeThanks } = useUI()
  return (
    <Dialog open={!!thanks} onOpenChange={(v) => !v && closeThanks()}>
      <DialogContent className="text-center">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-honey-100 text-4xl">💐</div>
        <DialogTitle className="mt-4 font-display text-[28px] font-semibold leading-tight">
          Спасибо{thanks?.name ? `, ${thanks.name}` : ''}!
        </DialogTitle>
        <DialogDescription className="mt-2 text-[15px] leading-relaxed text-ink-soft">
          Мастер {SITE.masterName} уже смотрит вашу заявку и напишет в течение 10 минут.
        </DialogDescription>
        <Button variant="wa" size="lg" className="mt-6 w-full" asChild>
          <a href={waLink(WA.thanks)} target="_blank" rel="noopener" onClick={() => goal('wa_click', { from: 'thanks' })}>
            <WhatsAppIcon className="h-5 w-5" /> Не хотите ждать? Напишите нам сами
          </a>
        </Button>
        <p className="mt-5 text-[13px] text-muted">Пока ждёте — посмотрите свежие букеты</p>
        <div className="mt-2 flex justify-center gap-3">
          <a href={SITE.instagram} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-4 py-2 text-sm font-bold">
            <InstagramIcon className="h-4 w-4" /> Instagram
          </a>
          <a href={SITE.vk} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-4 py-2 text-sm font-bold">
            <VkIcon className="h-5 w-5" /> ВКонтакте
          </a>
        </div>
      </DialogContent>
    </Dialog>
  )
}
