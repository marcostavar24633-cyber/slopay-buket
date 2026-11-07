import { UIProvider } from '@/lib/ui-store'
import { FoodBackground } from '@/components/shared/food-background'
import { Header, MobileBar, SeasonBar } from '@/components/sections/header'
import { Hero } from '@/components/sections/hero'
import { Catalog } from '@/components/sections/catalog'
import { Gallery } from '@/components/sections/gallery'
import { OrderSheet, ThanksDialog } from '@/components/sections/order-flow'
import { Why } from '@/components/sections/why'
import { QuizDialog, QuizSection } from '@/components/sections/quiz'
import { Reviews } from '@/components/sections/reviews'
import { Process } from '@/components/sections/process'
import { Delivery, HowToOrder } from '@/components/sections/delivery'
import { Corporate } from '@/components/sections/corporate'
import { Faq, Guarantees } from '@/components/sections/trust'
import { ExitPopup, FinalOffer, Footer } from '@/components/sections/final'

/**
 * Порядок блоков — по ТЗ: товар с ценой не позже второго экрана,
 * ценности и доверие — после каталога, чтобы «дожать» сомневающихся.
 * В ноябре–декабре и феврале–марте <Corporate/> можно поднять сразу после <Catalog/>.
 */
export default function App() {
  return (
    <UIProvider>
      <FoodBackground />
      <SeasonBar />
      <Header />
      <main>
        <Hero />
        <Catalog />
        <Gallery />
        {/* Сезон (ноябрь–декабрь): B2B-блок поднят сразу после каталога. После праздников верните его ниже <Delivery/>. */}
        <Corporate />
        <Why />
        <QuizSection />
        <Reviews />
        <Process />
        <HowToOrder />
        <Delivery />
        <Guarantees />
        <Faq />
        <FinalOffer />
      </main>
      <Footer />
      <MobileBar />
      <OrderSheet />
      <QuizDialog />
      <ThanksDialog />
      <ExitPopup />
    </UIProvider>
  )
}
