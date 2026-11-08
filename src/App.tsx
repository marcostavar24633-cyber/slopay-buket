import { lazy, Suspense } from 'react'
import { UIProvider } from '@/lib/ui-store'
import { FoodBackground } from '@/components/shared/food-background'
import { Header, MobileBar } from '@/components/sections/header'
import { SeasonBar } from '@/components/shared/season-bar'
import { Hero } from '@/components/sections/hero'
import { Hits } from '@/components/sections/catalog'
import { OrderSheet } from '@/components/sections/order-flow'

const below = () => import('@/below')
const BelowMain = lazy(() => below().then((m) => ({ default: m.BelowMain })))
const BelowRest = lazy(() => below().then((m) => ({ default: m.BelowRest })))

/**
 * Порядок блоков — по ТЗ: товар с ценой не позже второго экрана,
 * ценности и доверие — после каталога, чтобы «дожать» сомневающихся.
 * Блоки ниже каталога — в src/below.tsx (подгружаются отдельным файлом).
 */
export default function App() {
  return (
    <UIProvider>
      <FoodBackground />
      <Header />
      <SeasonBar />
      <main>
        <Hero />
        <Hits />
        <Suspense fallback={<div className="min-h-[100vh]" />}>
          <BelowMain />
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <BelowRest />
      </Suspense>
      <MobileBar />
      <OrderSheet />
    </UIProvider>
  )
}
