// По мотивам Magic UI — NumberTicker
import { useEffect, useRef } from 'react'
import { useInView, useMotionValue, useSpring } from 'motion/react'

export function NumberTicker({ value, decimals = 0, className }: { value: number; decimals?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const mv = useMotionValue(0)
  const spring = useSpring(mv, { damping: 40, stiffness: 120 })
  const inView = useInView(ref, { once: true, margin: '-40px' })

  useEffect(() => {
    if (inView) mv.set(value)
  }, [inView, mv, value])

  useEffect(
    () =>
      spring.on('change', (v) => {
        if (ref.current)
          ref.current.textContent = Intl.NumberFormat('ru-RU', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          }).format(Number(v.toFixed(decimals)))
      }),
    [spring, decimals],
  )

  return (
    <span ref={ref} className={className}>
      {Intl.NumberFormat('ru-RU', { minimumFractionDigits: decimals }).format(0)}
    </span>
  )
}
