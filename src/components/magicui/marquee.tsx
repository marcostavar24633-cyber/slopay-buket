// По мотивам Magic UI — Marquee
import { cn } from '@/lib/utils'

export function Marquee({
  className,
  reverse,
  pauseOnHover = true,
  children,
  repeat = 3,
  duration = '40s',
}: {
  className?: string
  reverse?: boolean
  pauseOnHover?: boolean
  children: React.ReactNode
  repeat?: number
  duration?: string
}) {
  return (
    <div
      style={{ ['--duration' as string]: duration, ['--gap' as string]: '1rem' }}
      className={cn('group flex overflow-hidden [gap:var(--gap)]', className)}
    >
      {Array.from({ length: repeat }).map((_, i) => (
        <div
          key={i}
          aria-hidden={i > 0}
          className={cn(
            'flex shrink-0 justify-around [gap:var(--gap)] animate-marquee',
            reverse && '[animation-direction:reverse]',
            pauseOnHover && 'group-hover:[animation-play-state:paused]',
          )}
        >
          {children}
        </div>
      ))}
    </div>
  )
}
