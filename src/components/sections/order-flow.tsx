import { useEffect, useState } from 'react'
import { ImageIcon } from 'lucide-react'
import { Sheet } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { MaxIcon, TelegramIcon } from '@/components/shared/icons'
import { SITE, maxLink, tgLink } from '@/lib/config'
import { goal } from '@/lib/analytics'
import { useUI } from '@/lib/ui-store'
import { rub } from '@/lib/utils'
import { copyNow } from '@/lib/copy'

/** Окно заказа: без формы — клиент сразу пишет в MAX или Telegram, текст заказа копируется сам. */
export function OrderSheet() {
  const { order, closeOrder } = useUI()
  const [copied, setCopied] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  // Фото букета заранее загружаем в память: на телефоне «Поделиться» должно открыться сразу по нажатию
  useEffect(() => {
    setCopied(false)
    setFile(null)
    if (!order || typeof navigator.canShare !== 'function') return
    let alive = true
    fetch(`${SITE.photoBase}${order.id}.jpg`)
      .then((r) => (r.ok ? r.blob() : Promise.reject()))
      .then((b) => {
        const f = new File([b], `${order.name}.jpg`, { type: 'image/jpeg' })
        if (alive && navigator.canShare({ files: [f] })) setFile(f)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [order])

  if (!order) return <Sheet open={false} onOpenChange={() => {}} title="Заказ">{null}</Sheet>
  const item = order
  const photo = `${SITE.photoBase}${item.id}.jpg`
  // ссылка на фото — отдельной строкой: Telegram покажет под сообщением саму картинку
  const text = `Здравствуйте! Хочу заказать букет «${item.name}» (${item.title.toLowerCase()})\n${photo}`

  const plain = `Здравствуйте! Хочу заказать букет «${item.name}» (${item.title.toLowerCase()})`
  const copyAnd = (to: 'max' | 'tg') => () => {
    goal(to === 'max' ? 'max_click' : 'tg_click', { from: 'order', product: item.id })
    copyNow(text)
    setCopied(true)
  }
  const share = () => {
    if (!file) return
    goal('share_click', { from: 'order', product: item.id })
    navigator.share({ files: [file], text: plain }).catch(() => {})
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
          <a href={maxLink(text)} target="_blank" rel="noopener" onClick={copyAnd('max')}>
            <MaxIcon className="h-5 w-5" /> Написать в MAX
          </a>
        </Button>
        <Button variant="tg" size="lg" asChild>
          <a href={tgLink()} target="_blank" rel="noopener" onClick={copyAnd('tg')}>
            <TelegramIcon className="h-5 w-5" /> Написать в Telegram
          </a>
        </Button>
        {file && (
          <Button variant="outline" size="lg" onClick={share}>
            <ImageIcon className="h-5 w-5 text-honey-600" /> Отправить фото и текст
          </Button>
        )}
      </div>

      <div className="mt-4 rounded-2xl border border-dashed border-line bg-surface/60 p-3.5">
        <div className="flex items-start gap-3">
          <img src={item.thumb} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
          <p className="text-[14px] leading-snug text-ink">
            Здравствуйте! Хочу заказать букет «{item.name}» ({item.title.toLowerCase()})
          </p>
        </div>
        <ul className="mt-2.5 flex flex-col gap-1 text-[12.5px] leading-snug text-muted">
          <li>
            {copied
              ? '✓ Текст со ссылкой на фото скопирован — вставьте его в чат, фото появится под сообщением.'
              : 'При нажатии на MAX или Telegram текст со ссылкой на фото скопируется — вставьте его в чат.'}
          </li>
          {file && (
            <li>
              «Отправить фото и текст» — выберите Telegram или MAX и наш чат ({SITE.phoneDisplay}): уйдёт само фото с подписью.
            </li>
          )}
        </ul>
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
