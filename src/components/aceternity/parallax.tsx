// Параллакс по мотивам Aceternity UI (Parallax Scroll): элемент смещается медленнее/быстрее страницы.
import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { cn } from '@/lib/utils'

/** Обёртка: сдвигает содержимое по Y при прокрутке. speed > 0 — отстаёт, < 0 — обгоняет. */
export function Parallax({ children, speed = 0.15, className }: { children: React.ReactNode; speed?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [`${speed * -100}px`, `${speed * 100}px`])
  return (
    <motion.div ref={ref} style={reduce ? undefined : { y }} className={className}>
      {children}
    </motion.div>
  )
}

/** Фото внутри рамки «плывёт» медленнее рамки — классический параллакс-кадр. */
export function ParallaxImage({
  src,
  alt,
  className,
  imgClassName,
  strength = 0.12,
  eager,
}: {
  src: string
  alt: string
  className?: string
  imgClassName?: string
  strength?: number
  eager?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [`${-strength * 100}%`, `${strength * 100}%`])
  return (
    <div ref={ref} className={cn('relative overflow-hidden', className)}>
      <motion.img
        src={src}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        style={reduce ? undefined : { y, scale: 1 + strength * 2.2 }}
        className={cn('h-full w-full object-cover will-change-transform', imgClassName)}
      />
    </div>
  )
}
