import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Sheet } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Chips } from '@/components/ui/chips'
import { Checkbox } from '@/components/ui/checkbox'
import { Input, Label, PhoneInput } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Consent } from '@/components/shared/consent'
import { VkIcon, MaxIcon } from '@/components/shared/icons'
import { SITE, MSG, maxLink } from '@/lib/config'
import { isPhoneValid } from '@/lib/phone'
import { submitLead } from '@/lib/leads'
import { goal } from '@/lib/analytics'
import { useUI } from '@/lib/ui-store'
import { rub } from '@/lib/utils'

const DATES = [
  { key: 'today', label: 'Сегодня' },
  { key: 'tomorrow', label: 'Завтра' },
  { key: 'other', label: 'Другая дата' },
] as const
export const CONTACTS = [
  { key: 'max', label: 'MAX' },
  { key: 'tg', label: 'Telegram' },
  { key: 'call', label: 'Позвоните' },
] as const

export function OrderSheet() {
  const { order, closeOrder, showThanks } = useUI()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [date, setDate] = useState<(typeof DATES)[number]['key']>('tomorrow')
  const [otherDate, setOtherDate] = useState('')
  const [contact, setContact] = useState<(typeof CONTACTS)[number]['key']>('max')
  const [card, setCard] = useState(false)
  const [cardText, setCardText] = useState('')
  const [consent, setConsent] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (order) {
      setError('')
      setDate('tomorrow')
    }
  }, [order])

  if (!order) return <Sheet open={false} onOpenChange={() => {}} title="Заказ">{null}</Sheet>
  const item = order

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
      product: `«${item.name}», ${item.title} (${item.id})`,
      photo: location.origin + item.src,
      price: item.price,
      date: date === 'other' ? otherDate || 'другая' : date,
      card: card ? cardText || 'да' : 'нет',
    })
    setLoading(false)
    if (!ok) return setError('Не получилось отправить. Напишите нам в MAX — ответим за 5 минут.')
    closeOrder()
    showThanks(name)
  }

  return (
    <Sheet open={!!order} onOpenChange={(v) => !v && closeOrder()} title={`Заказ: «${item.name}»`}>
      <div className="flex items-center gap-3.5 rounded-2xl border border-line bg-surface p-3 md:mt-6">
        <img src={item.thumb} alt="" className="h-16 w-16 rounded-xl object-cover" />
        <div className="min-w-0">
          <p className="truncate font-display text-lg font-semibold leading-tight">{item.name}</p>
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-honey-600">{item.title}</p>
          <p className="line-clamp-2 text-[13px] leading-snug text-muted">{item.desc}</p>
        </div>
        <p className="ml-auto shrink-0 text-right text-lg font-extrabold leading-tight"><span className="block text-[11px] font-semibold text-muted">примерно</span>от {rub(item.price)}</p>
      </div>

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
            {date === 'today' && <p className="mt-2 text-[12.5px] font-semibold text-ink-soft">День в день — по возможности: уточним и сразу ответим.</p>}
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
            Перезвоним, уточним адрес и время. Оплата — после согласования.
          </p>
      </form>
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
        <Button variant="max" size="lg" className="mt-6 w-full" asChild>
          <a href={maxLink(MSG.thanks)} target="_blank" rel="noopener" onClick={() => goal('max_click', { from: 'thanks' })}>
            <MaxIcon className="h-5 w-5" /> Не хотите ждать? Напишите нам сами
          </a>
        </Button>
        {SITE.vk && (
          <>
            <p className="mt-5 text-[13px] text-muted">Пока ждёте — посмотрите свежие букеты</p>
            <div className="mt-2 flex justify-center gap-3">
              <a href={SITE.vk} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-4 py-2 text-sm font-bold">
                <VkIcon className="h-5 w-5" /> ВКонтакте
              </a>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
