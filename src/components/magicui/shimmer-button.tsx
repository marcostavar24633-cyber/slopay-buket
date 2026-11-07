// По мотивам Magic UI — ShimmerButton (адаптирован под бренд-акцент)
import * as React from 'react'
import { cn } from '@/lib/utils'

export const ShimmerButton = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, children, ...props }, ref) => (
    <button
      ref={ref}
      style={{ ['--speed' as string]: '2.6s' }}
      className={cn(
        'group relative z-0 inline-flex h-14 cursor-pointer items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-full bg-gold px-8 text-base font-bold text-onaccent',
        'shadow-[0_10px_36px_-10px_rgb(212_175_55/0.9)] transition-transform duration-200 active:scale-[0.98]',
        'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-honey/40',
        className,
      )}
      {...props}
    >
      <span className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-full [container-type:size]">
        <span className="absolute inset-0 h-[100cqh] animate-shimmer-slide [aspect-ratio:1]">
          <span className="absolute -inset-full w-auto rotate-0 animate-spin-around [background:conic-gradient(from_225deg,transparent_0,rgb(255_255_255/0.75)_90deg,transparent_90deg)]" />
        </span>
      </span>
      <span className="bg-gold pointer-events-none absolute inset-[2px] -z-10 rounded-full" />
      {children}
    </button>
  ),
)
ShimmerButton.displayName = 'ShimmerButton'
