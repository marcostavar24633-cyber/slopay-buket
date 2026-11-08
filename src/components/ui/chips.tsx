import { cn } from '@/lib/utils'

export function Chips<T extends string>({
  options,
  value,
  onChange,
  dark,
  className,
  ariaLabel,
}: {
  options: readonly { key: T; label: string }[]
  value: T | null
  onChange: (v: T) => void
  dark?: boolean
  className?: string
  ariaLabel?: string
}) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className={cn('flex flex-wrap gap-2', className)}>
      {options.map((o) => {
        const active = o.key === value
        return (
          <button
            key={o.key}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.key)}
            className={cn(
              'run-border h-11 rounded-full border px-4 text-sm font-semibold transition cursor-pointer',
              dark
                ? active
                  ? 'border-honey bg-honey text-onaccent'
                  : 'border-white/15 bg-white/5 text-white/85 hover:border-white/40'
                : active
                  ? 'border-honey bg-honey text-onaccent'
                  : 'border-line bg-surface text-ink hover:border-ink/40',
            )}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
