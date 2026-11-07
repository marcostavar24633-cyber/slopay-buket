import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Checkbox({
  checked,
  onChange,
  children,
  dark,
  className,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  children: React.ReactNode
  dark?: boolean
  className?: string
}) {
  return (
    <label className={cn('flex cursor-pointer items-start gap-3 text-sm leading-snug', dark ? 'text-white/70' : 'text-ink-soft', className)}>
      <input type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span
        aria-hidden
        className={cn(
          'mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 transition peer-focus-visible:ring-4 peer-focus-visible:ring-honey/30',
          checked ? 'border-honey bg-honey text-onaccent' : dark ? 'border-white/30' : 'border-ink/25 bg-surface',
        )}
      >
        {checked && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
      </span>
      <span>{children}</span>
    </label>
  )
}
