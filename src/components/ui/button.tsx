import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold tracking-[0.01em] transition-all duration-200 outline-none focus-visible:ring-4 focus-visible:ring-honey/40 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:shrink-0 cursor-pointer select-none',
  {
    variants: {
      variant: {
        primary: 'bg-gold text-onaccent font-bold shadow-[0_8px_28px_-10px_rgb(212_175_55/0.75)] hover:shadow-[0_12px_36px_-8px_rgb(212_175_55/0.9)]',
        outline: 'border border-honey/45 bg-scrim/40 text-ink backdrop-blur hover:border-honey hover:bg-honey/10',
        dark: 'bg-scrim text-honey-600 border border-honey/40 hover:border-honey',
        wa: 'bg-wa text-white hover:bg-wa-600 shadow-[0_8px_24px_-10px_rgb(26_158_82/0.7)]',
        tg: 'bg-tg text-white hover:brightness-95',
        tgOutline: 'border-2 border-tg/40 text-[#1477a8] bg-surface hover:border-tg hover:bg-tg/5',
        ghost: 'text-ink hover:bg-ink/5',
        link: 'text-ink underline decoration-honey decoration-2 underline-offset-4 hover:decoration-ink rounded-none px-0',
        light: 'bg-surface text-ink hover:bg-surface-2',
      },
      size: {
        sm: 'h-10 px-4 text-sm',
        md: 'h-12 px-6 text-[15px]',
        lg: 'h-14 px-8 text-base',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  },
)
Button.displayName = 'Button'

export { buttonVariants }
