// По мотивам Aceternity UI — Card Spotlight (подсветка за курсором)
import { useRef, useState } from 'react'
import { cn } from '@/lib/utils'

export function CardSpotlight({ children, className, color = 'rgb(242 169 59 / 0.16)' }: { children: React.ReactNode; className?: string; color?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0, o: 0 })
  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        const r = ref.current!.getBoundingClientRect()
        setPos({ x: e.clientX - r.left, y: e.clientY - r.top, o: 1 })
      }}
      onMouseLeave={() => setPos((p) => ({ ...p, o: 0 }))}
      className={cn('relative overflow-hidden', className)}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{ opacity: pos.o, background: `radial-gradient(360px circle at ${pos.x}px ${pos.y}px, ${color}, transparent 70%)` }}
      />
      <div className="relative">{children}</div>
    </div>
  )
}
