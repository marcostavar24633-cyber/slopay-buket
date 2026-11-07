import { useEffect, useMemo } from 'react'
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from 'motion/react'
import { useMediaQuery } from '@/hooks/use-media-query'

/**
 * Динамический фон «золотой фудбукет»: контурные иконки (клубника, сыр, виноград, макарон, бант…),
 * золотая пыль и мягкое сияние. Три слоя глубины с параллаксом по скроллу и курсору.
 * Фиксированный, pointer-events: none, уважает prefers-reduced-motion.
 */

const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

const ICONS: Record<string, React.ReactNode> = {
  strawberry: (
    <g {...S}>
      <path d="M32 18c-9 0-16 5-16 13 0 10 9 21 16 25 7-4 16-15 16-25 0-8-7-13-16-13z" />
      <path d="M24 16c3-1 5 1 8 2 3-1 5-3 8-2-1 3-4 5-8 5s-7-2-8-5zM32 18v-8" />
      <path d="M25 30h.01M32 27h.01M39 30h.01M28 38h.01M36 38h.01M32 45h.01" strokeWidth={2.4} />
    </g>
  ),
  dipped: (
    <g {...S}>
      <path d="M32 14c-8 0-14 5-14 12 0 9 8 20 14 24 6-4 14-15 14-24 0-7-6-12-14-12z" />
      <path d="M19 31c4 3 9 1 13 3s9 1 13-3" />
      <path d="M22 38l20-6M24 43l16-5" />
      <path d="M32 50v12" />
    </g>
  ),
  cheese: (
    <g {...S}>
      <path d="M10 44l34-22 12 10v14H10z" />
      <path d="M10 44l34-22M44 22l12 10" />
      <circle cx="22" cy="40" r="2.5" />
      <circle cx="38" cy="36" r="3.2" />
      <circle cx="47" cy="42" r="1.8" />
    </g>
  ),
  grapes: (
    <g {...S}>
      {[[26, 22], [38, 22], [32, 30], [20, 30], [44, 30], [26, 38], [38, 38], [32, 46]].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="5.5" />
      ))}
      <path d="M32 16c0-4 2-7 6-8M33 12c4-3 9-2 12 1-4 2-8 2-12-1z" />
    </g>
  ),
  macaron: (
    <g {...S}>
      <path d="M12 28c0-8 9-13 20-13s20 5 20 13H12z" />
      <path d="M12 36c0 8 9 13 20 13s20-5 20-13H12z" />
      <path d="M10 32h44" strokeDasharray="2 3" />
    </g>
  ),
  bow: (
    <g {...S}>
      <path d="M32 30c-6-8-18-12-20-6s10 10 20 6zM32 30c6-8 18-12 20-6s-10 10-20 6z" />
      <circle cx="32" cy="30" r="3" />
      <path d="M30 33l-8 18M34 33l8 18" />
    </g>
  ),
  mandarin: (
    <g {...S}>
      <circle cx="32" cy="36" r="16" />
      <path d="M32 20c2-6 8-9 14-8-2 6-8 9-14 8z" />
      <path d="M26 30h.01M36 28h.01M40 38h.01M28 42h.01" strokeWidth={2.2} />
    </g>
  ),
  bouquet: (
    <g {...S}>
      <path d="M18 30l14 30 14-30" />
      <path d="M18 30h28" />
      <circle cx="24" cy="22" r="6" />
      <circle cx="40" cy="22" r="6" />
      <circle cx="32" cy="16" r="6" />
      <path d="M28 44l8 0M26 40c4 2 8 2 12 0" />
    </g>
  ),
  skewer: (
    <g {...S}>
      <path d="M14 54L50 10" />
      <circle cx="40" cy="22" r="6" />
      <rect x="23" y="31" width="10" height="10" rx="2" transform="rotate(-40 28 36)" />
      <circle cx="20" cy="47" r="4" />
    </g>
  ),
  sparkle: (
    <g fill="currentColor">
      <path d="M32 8c1.5 12 4 16.5 16 24-12 7.5-14.5 12-16 24-1.5-12-4-16.5-16-24 12-7.5 14.5-12 16-24z" />
    </g>
  ),
}
const KINDS = Object.keys(ICONS)

function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }
}

interface Item {
  kind: string
  x: number
  y: number
  size: number
  rot: number
  dur: number
  delay: number
  op: number
  mobile: boolean
}

const TILE = 1500 // высота «плитки» узора, повторяется бесконечно

function makeLayer(seed: number, count: number, size: [number, number], op: [number, number]): Item[] {
  const r = rng(seed)
  return Array.from({ length: count }, (_, i) => ({
    kind: i % 5 === 4 ? 'sparkle' : KINDS[Math.floor(r() * (KINDS.length - 1))],
    x: r() * 96,
    y: r() * TILE,
    size: size[0] + r() * (size[1] - size[0]),
    rot: r() * 60 - 30,
    dur: 9 + r() * 10,
    delay: -r() * 12,
    op: op[0] + r() * (op[1] - op[0]),
    mobile: i % 2 === 0,
  }))
}

const LAYERS = [
  { items: makeLayer(7, 16, [26, 40], [0.12, 0.2]), scroll: 0.06, mouse: 8, blur: 1, glow: false },
  { items: makeLayer(42, 12, [40, 62], [0.17, 0.28]), scroll: 0.16, mouse: 18, blur: 0, glow: false },
  { items: makeLayer(1337, 7, [64, 96], [0.22, 0.34]), scroll: 0.32, mouse: 34, blur: 0, glow: true },
]

function Layer({
  layer,
  scrollY,
  mx,
  my,
  mobile,
  still,
}: {
  layer: (typeof LAYERS)[number]
  scrollY: MotionValue<number>
  mx: MotionValue<number>
  my: MotionValue<number>
  mobile: boolean
  still: boolean
}) {
  const y = useTransform([scrollY, my] as MotionValue<number>[], ([s, m]: number[]) => (still ? 0 : -((s * layer.scroll) % TILE) + m * layer.mouse))
  const tx = useTransform(mx, (v) => v * layer.mouse)
  const items = mobile ? layer.items.filter((i) => i.mobile) : layer.items
  return (
    <motion.div className="absolute inset-x-0 top-0" style={{ y, x: tx, filter: layer.blur ? `blur(${layer.blur}px)` : layer.glow ? 'drop-shadow(0 0 6px var(--icon-glow))' : undefined }}>
      {[0, TILE].map((offset) => (
        <div key={offset} className="absolute inset-x-0" style={{ top: offset, height: TILE }}>
          {items.map((it, i) => (
            <span
              key={i}
              className="absolute text-bgicon [animation:bg-float_var(--d)_ease-in-out_infinite_alternate]"
              style={
                {
                  left: `${it.x}%`,
                  top: it.y,
                  width: it.size,
                  height: it.size,
                  opacity: it.op,
                  '--d': `${it.dur}s`,
                  '--r': `${it.rot}deg`,
                  animationDelay: `${it.delay}s`,
                  animationPlayState: still ? 'paused' : undefined,
                } as React.CSSProperties
              }
            >
              <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden>
                {ICONS[it.kind]}
              </svg>
            </span>
          ))}
        </div>
      ))}
    </motion.div>
  )
}

export function FoodBackground() {
  const reduce = useReducedMotion() ?? false
  const mobile = useMediaQuery('(max-width: 767px)')
  const { scrollY } = useScroll()
  const mxRaw = useMotionValue(0)
  const myRaw = useMotionValue(0)
  const mx = useSpring(mxRaw, { stiffness: 40, damping: 18 })
  const my = useSpring(myRaw, { stiffness: 40, damping: 18 })

  useEffect(() => {
    if (reduce || mobile) return
    const on = (e: PointerEvent) => {
      mxRaw.set(e.clientX / window.innerWidth - 0.5)
      myRaw.set(e.clientY / window.innerHeight - 0.5)
    }
    window.addEventListener('pointermove', on, { passive: true })
    return () => window.removeEventListener('pointermove', on)
  }, [reduce, mobile, mxRaw, myRaw])

  const dust = useMemo(() => {
    const r = rng(99)
    return Array.from({ length: mobile ? 22 : 48 }, () => ({ x: r() * 100, y: r() * 100, s: 1 + r() * 2.2, d: 2.5 + r() * 4, delay: -r() * 6 }))
  }, [mobile])

  const glowY = useTransform(scrollY, (v) => (reduce ? 0 : -(v * 0.03) % 400))

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* сияние */}
      <motion.div className="absolute inset-0" style={{ y: glowY }}>
        <div className="absolute -left-[10%] top-[5%] h-[55vmax] w-[55vmax] rounded-full bg-[radial-gradient(circle,var(--aurora-1),transparent_62%)] [animation:aurora_22s_ease-in-out_infinite_alternate]" />
        <div className="absolute -right-[15%] top-[45%] h-[60vmax] w-[60vmax] rounded-full bg-[radial-gradient(circle,var(--aurora-2),transparent_60%)] [animation:aurora_28s_ease-in-out_infinite_alternate-reverse]" />
      </motion.div>

      {LAYERS.map((l, i) => (
        <Layer key={i} layer={l} scrollY={scrollY} mx={mx} my={my} mobile={mobile} still={reduce} />
      ))}

      {/* золотая пыль */}
      {dust.map((d, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-dust [animation:twinkle_var(--d)_ease-in-out_infinite]"
          style={{ left: `${d.x}%`, top: `${d.y}%`, width: d.s, height: d.s, boxShadow: '0 0 6px var(--color-dust)', ['--d' as string]: `${d.d}s`, animationDelay: `${d.delay}s` }}
        />
      ))}

      {/* виньетка: контент читается, фон уходит в темноту по краям */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,var(--vignette)_100%)]" />
    </div>
  )
}
