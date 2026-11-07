import { useOrderWindow } from '@/hooks/use-order-window'
import { SITE } from '@/lib/config'
import { cn } from '@/lib/utils'

export function StatusPill({ className, compact }: { className?: string; compact?: boolean }) {
  const { acceptingToday } = useOrderWindow()
  return (
    <span className={cn('inline-flex items-center gap-2 text-[13px] font-semibold text-ink-soft', className)}>
      <span className={cn('h-2 w-2 shrink-0 rounded-full', acceptingToday ? 'bg-green-500 animate-pulse-dot' : 'bg-honey')} />
      {acceptingToday
        ? compact
          ? `Заказы на сегодня до ${SITE.sameDayDeadlineHour}:00`
          : `Принимаем заказы на сегодня до ${SITE.sameDayDeadlineHour}:00`
        : compact ? 'Принимаем заказы на завтра' : 'Принимаем заказы на завтра'}
    </span>
  )
}
