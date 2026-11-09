import { createContext, useContext } from 'react'
import { cn } from '@/lib/utils'
import { EditIndex, editableProps } from '@/components/edit/edit-frame'

/** Заголовок блока, заданный в админке (Блоки страницы): непустые поля заменяют заголовок из кода. */
export const TitleOverride = createContext<{ eyebrow?: string; title?: string; sub?: string } | null>(null)
import { BlurFade } from '@/components/magicui/blur-fade'

export function SectionTitle({
  eyebrow,
  title,
  sub,
  center,
  dark,
  className,
}: {
  eyebrow?: string
  title: React.ReactNode
  sub?: React.ReactNode
  center?: boolean
  dark?: boolean
  className?: string
}) {
  const o = useContext(TitleOverride)
  const ei = useContext(EditIndex)
  if (o?.eyebrow) eyebrow = o.eyebrow
  if (o?.title) title = o.title
  if (o?.sub) sub = o.sub
  return (
    <BlurFade className={cn('mb-8 max-w-3xl md:mb-12', center && 'mx-auto text-center', className)}>
      {eyebrow && (
        <p key={String(eyebrow)} className={cn('eyebrow mb-3', dark && 'text-honey')} {...editableProps(ei, 'eyebrow')}>
          {eyebrow}
        </p>
      )}
      <h2 key={typeof title === 'string' ? title : 'jsx'} className={cn('h-display text-[30px] md:text-5xl', dark ? 'text-white' : 'text-ink')} {...editableProps(ei, 'title')}>
        {title}
      </h2>
      {sub && (
        <p key={typeof sub === 'string' ? sub : 'jsx'} className={cn('mt-4 text-base md:text-lg', dark ? 'text-white/65' : 'text-ink-soft')} {...editableProps(ei, 'sub')}>
          {sub}
        </p>
      )}
    </BlurFade>
  )
}
