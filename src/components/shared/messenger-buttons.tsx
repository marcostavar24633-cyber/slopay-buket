import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { MaxIcon, TelegramIcon } from '@/components/shared/icons'
import { maxLink, tgLink } from '@/lib/config'
import { copyNow } from '@/lib/copy'
import { goal } from '@/lib/analytics'
import { cn } from '@/lib/utils'

/**
 * Кнопки «MAX» и «Telegram» вместо отправки заявки: открывают личный чат мастера,
 * а готовый текст сообщения в момент нажатия копируется — клиент вставляет его в чат.
 */
export function MessengerButtons({
  text,
  from,
  className,
  size = 'lg',
  row = false,
  onBefore,
}: {
  text: string | (() => string)
  from: string
  className?: string
  size?: 'md' | 'lg'
  row?: boolean
  /** вызывается перед переходом; вернёт false — переход отменяется (например, не выбран вариант) */
  onBefore?: () => boolean | void
}) {
  const [copied, setCopied] = useState(false)
  const go = (to: 'max' | 'tg') => (e: React.MouseEvent) => {
    if (onBefore && onBefore() === false) return e.preventDefault()
    goal(to === 'max' ? 'max_click' : 'tg_click', { from })
    copyNow(typeof text === 'function' ? text() : text)
    setCopied(true)
  }
  return (
    <div className={className}>
      <div className={cn('grid gap-3', row ? 'grid-cols-2' : 'grid-cols-1')}>
        <Button variant="max" size={size} asChild>
          <a href={maxLink()} target="_blank" rel="noopener" onClick={go('max')}>
            <MaxIcon className="h-5 w-5" /> {row ? 'MAX' : 'Написать в MAX'}
          </a>
        </Button>
        <Button variant="tg" size={size} asChild>
          <a href={tgLink()} target="_blank" rel="noopener" onClick={go('tg')}>
            <TelegramIcon className="h-5 w-5" /> {row ? 'Telegram' : 'Написать в Telegram'}
          </a>
        </Button>
      </div>
      <p className="mt-2 text-center text-[12.5px] leading-snug text-muted" aria-live="polite">
        {copied ? '✓ Текст скопирован — вставьте его в чат' : 'Текст сообщения скопируется сам — останется вставить его в чат'}
      </p>
    </div>
  )
}
