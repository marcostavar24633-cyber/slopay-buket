import { useEffect, useState } from 'react'
import { Sheet } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { VkIcon, MaxIcon, TelegramIcon } from '@/components/shared/icons'
import { SITE, MSG, maxLink, tgLink } from '@/lib/config'
import { goal } from '@/lib/analytics'
import { useUI } from '@/lib/ui-store'
import { rub } from '@/lib/utils'

export const CONTACTS = [
  { key: 'max', label: 'MAX' },
  { key: 'tg', label: 'Telegram' },
  { key: 'call', label: 'Позвоните' },
] as const

/** Окно заказа: без формы — клиент сразу пишет в MAX или Telegram, текст заказа копируется сам. */
export function OrderSheet() {
  const { order, closeOrder } = useUI()
  const [copied, setCopied] = useState<'' | 'max' | 'tg'>('')

  useEffect(() => {
    if (order) setCopied('')
  }, [order])

  if (!order) return <Sheet open={false} onOpenChange={() => {}} title="Заказ">{null}</Sheet>
  const item = order
  const text = `Здравствуйте! Хочу заказать букет «${item.name}» (${item.title.toLowerCase()}, от ${rub(item.price)}). На какую дату свободно?`

  const go = (to: 'max' | 'tg') => {
    goal(to === 'max' ? 'max_click' : 'tg_click', { from: 'order', product: item.id })
    navigator.clipboard?.writeText(text).catch(() => {})
    setCopied(to)
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

      <p className="mt-5 text-[15px] leading-relaxed text-ink-soft">
        Напишите нам в удобный мессенджер — уточним состав, дату и доставку, пришлём фото готового букета перед отправкой.
      </p>

      <div className="mt-5 flex flex-col gap-3">
        <Button variant="max" size="lg" asChild>
          <a href={maxLink(text)} target="_blank" rel="noopener" onClick={() => go('max')}>
            <MaxIcon className="h-5 w-5" /> Написать в MAX
          </a>
        </Button>
        <Button variant="tg" size="lg" asChild>
          <a href={tgLink(text)} target="_blank" rel="noopener" onClick={() => go('tg')}>
            <TelegramIcon className="h-5 w-5" /> Написать в Telegram
          </a>
        </Button>
      </div>

      <div className="mt-4 rounded-2xl border border-dashed border-line bg-surface/60 p-3.5">
        <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-muted">
          {copied ? '✓ Текст скопирован — вставьте его в чат' : 'Текст сообщения скопируется сам'}
        </p>
        <p className="mt-1.5 text-[14px] leading-snug text-ink">{text}</p>
      </div>

      <p className="mt-4 text-center text-[13px] text-muted">
        Или позвоните:{' '}
        <a href={SITE.phoneHref} className="font-bold text-ink underline underline-offset-4" onClick={() => goal('phone_click', { from: 'order' })}>
          {SITE.phoneDisplay}
        </a>
      </p>
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
