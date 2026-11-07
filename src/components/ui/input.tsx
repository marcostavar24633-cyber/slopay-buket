import * as React from 'react'
import { cn } from '@/lib/utils'
import { formatPhone } from '@/lib/phone'

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { dark?: boolean }>(
  ({ className, dark, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-12 w-full rounded-2xl border px-4 text-base outline-none transition placeholder:text-muted/70 focus:ring-4',
        dark
          ? 'border-white/15 bg-white/5 text-white placeholder:text-white/40 focus:border-honey focus:ring-honey/20'
          : 'border-line bg-surface text-ink focus:border-honey-600 focus:ring-honey/25',
        className,
      )}
      {...props}
    />
  ),
)
Input.displayName = 'Input'

export function PhoneInput({
  value,
  onChange,
  ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> & {
  value: string
  onChange: (v: string) => void
  dark?: boolean
}) {
  return (
    <Input
      type="tel"
      inputMode="tel"
      autoComplete="tel"
      placeholder="+7 (___) ___-__-__"
      value={value}
      onFocus={() => !value && onChange('+7 (')}
      onChange={(e) => onChange(e.target.value.length < 3 ? '' : formatPhone(e.target.value))}
      {...props}
    />
  )
}

export function Label({ children, className, ...p }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={cn('mb-1.5 block text-sm font-semibold text-ink-soft', className)} {...p}>
      {children}
    </label>
  )
}
