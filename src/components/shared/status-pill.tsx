import { SITE } from '@/lib/config'
import { cn } from '@/lib/utils'

export function StatusPill({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2 text-[13px] font-semibold text-ink-soft', className)}>
      <span className="h-2 w-2 shrink-0 animate-pulse-dot rounded-full bg-green-500" />
      {compact ? 'Принимаем заказы' : `Принимаем заказы · ${SITE.hours.toLowerCase()}`}
    </span>
  )
}
