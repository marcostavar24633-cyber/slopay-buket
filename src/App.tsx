import { lazy, Suspense } from 'react'
import { UIProvider } from '@/lib/ui-store'
import { FoodBackground } from '@/components/shared/food-background'
import { Header, MobileBar } from '@/components/sections/header'
import { SeasonBar } from '@/components/shared/season-bar'
import { Hero } from '@/components/sections/hero'
import { Hits } from '@/components/sections/catalog'
import { OrderSheet } from '@/components/sections/order-flow'
import { TitleOverride } from '@/components/shared/section-title'
import { EDIT_MODE } from '@/lib/content'
import { blockCss, themeCss, useLive } from '@/lib/live'
import { BlockFrame, EditStyles } from '@/components/edit/edit-frame'

const below = () => import('@/below')
const BlockView = lazy(() => below().then((m) => ({ default: m.BlockView })))
const BelowRest = lazy(() => below().then((m) => ({ default: m.BelowRest })))

/**
 * Порядок блоков, видимость и оформление — из админки (content/page.json); в визуальном редакторе — живой черновик.
 * Первый экран всегда сверху. «Хит продаж» рисуется сразу, остальное — из отдельного файла src/below.tsx.
 */
function Blocks() {
  const { page, theme } = useLive()
  // в редакторе скрытые блоки видны как плашки — чтобы их можно было выбрать и вернуть
  const blocks = page.map((b, i) => ({ b, i })).filter(({ b }) => EDIT_MODE || b.show !== false)
  const css = themeCss(theme) + blocks.map(({ b, i }) => blockCss(i, b.style)).join('')
  return (
    <>
      {css && <style data-slopay-styles>{css}</style>}
      {blocks.map(({ b, i }) => (
        <BlockFrame key={i + ':' + (b.type === 'builtin' ? b.section : b.type)} index={i} block={b}>
          {b.type === 'builtin' && b.section === 'hits' ? (
            <TitleOverride.Provider value={b.eyebrow || b.title || b.sub ? { eyebrow: b.eyebrow, title: b.title, sub: b.sub } : null}>
              <Hits />
            </TitleOverride.Provider>
          ) : (
            <Suspense fallback={<div className="min-h-[60vh]" />}>
              <BlockView b={b} i={i} />
            </Suspense>
          )}
        </BlockFrame>
      ))}
    </>
  )
}

export default function App() {
  return (
    <UIProvider>
      <EditStyles />
      <FoodBackground />
      <Header />
      <SeasonBar />
      <main>
        <Hero />
        <Blocks />
      </main>
      <Suspense fallback={null}>
        <BelowRest />
      </Suspense>
      <MobileBar />
      <OrderSheet />
    </UIProvider>
  )
}
