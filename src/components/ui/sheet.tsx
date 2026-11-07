import * as React from 'react'
import { Drawer } from 'vaul'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { useMediaQuery } from '@/hooks/use-media-query'
import { cn } from '@/lib/utils'

/**
 * Адаптивная шторка: на мобильном выезжает снизу (vaul, свайп вниз закрывает),
 * на десктопе — боковая панель справа.
 */
export function Sheet({
  open,
  onOpenChange,
  title,
  children,
  className,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  title: string
  children: React.ReactNode
  className?: string
}) {
  const desktop = useMediaQuery('(min-width: 768px)')
  if (desktop) {
    return (
      <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-[80] bg-black/45 backdrop-blur-sm data-[state=open]:animate-[fade-in_200ms_ease-out]" />
          <DialogPrimitive.Content
            className={cn(
              'fixed inset-y-0 right-0 z-[81] flex w-full max-w-[480px] flex-col overflow-y-auto bg-cream p-8 shadow-lift outline-none data-[state=open]:animate-[slide-in_280ms_cubic-bezier(.2,.8,.2,1)]',
              className,
            )}
          >
            <DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>
            <DialogPrimitive.Description className="sr-only">{title}</DialogPrimitive.Description>
            {children}
            <DialogPrimitive.Close className="absolute right-4 top-4 grid h-10 w-10 cursor-pointer place-items-center rounded-full bg-surface shadow-soft hover:bg-cream-2" aria-label="Закрыть">
              <X className="h-5 w-5" />
            </DialogPrimitive.Close>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    )
  }
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} repositionInputs={false}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[80] bg-black/45" />
        <Drawer.Content
          className={cn(
            'fixed inset-x-0 bottom-0 z-[81] flex max-h-[94dvh] flex-col rounded-t-[28px] bg-cream outline-none',
            className,
          )}
        >
          <div className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-ink/15" />
          <Drawer.Title className="sr-only">{title}</Drawer.Title>
          <Drawer.Description className="sr-only">{title}</Drawer.Description>
          <div className="overflow-y-auto px-4 pb-[calc(20px+env(safe-area-inset-bottom))] pt-3">{children}</div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
