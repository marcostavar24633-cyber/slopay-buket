import { lazy, Suspense } from 'react'
import { UIProvider } from '@/lib/ui-store'
import { FoodBackground } from '@/components/shared/food-background'
import { Header, MobileBar } from '@/components/sections/header'
import { SeasonBar } from '@/components/shared/season-bar'
import { Hero } from '@/components/sections/hero'
import { Hits } from '@/components/sections/catalog'
import { OrderSheet } from '@/components/sections/order-flow'
import { TitleOverride } from '@/components/shared/section-title'
import { PAGE_BLOCKS } from '@/lib/content'

const below = () => import('@/below')
const BlockView = lazy(() => below().then((m) => ({ default: m.BlockView })))
const BelowRest = lazy(() => below().then((m) => ({ default: m.BelowRest })))

/**
 * Порядок блоков и их видимость — из админки (content/page.json). Первый экран всегда сверху.
 * «Хит продаж» рисуется сразу (он близко к первому экрану), остальное — из отдельного файла src/below.tsx.
 */
const BLOCKS = PAGE_BLOCKS.map((b, i) => ({ b, i })).filter(({ b }) => b.show !== false)

export default function App() {
  return (
    <UIProvider>
      <FoodBackground />
      <Header />
      <SeasonBar />
      <main>
        <Hero />
        {BLOCKS.map(({ b, i }) =>
          b.type === 'builtin' && b.section === 'hits' ? (
            <TitleOverride.Provider key={i} value={b.eyebrow || b.title || b.sub ? { eyebrow: b.eyebrow, title: b.title, sub: b.sub } : null}>
              <Hits />
            </TitleOverride.Provider>
          ) : (
            <Suspense key={i} fallback={<div className="min-h-[60vh]" />}>
              <BlockView b={b} i={i} />
            </Suspense>
          ),
        )}
      </main>
      <Suspense fallback={null}>
        <BelowRest />
      </Suspense>
      <MobileBar />
      <OrderSheet />
    </UIProvider>
  )
}
