/**
 * Всё, что ниже каталога, — отдельный файл сборки: грузится сразу после первого экрана,
 * но не мешает ему отрисоваться быстрее.
 */
import { Corporate } from '@/components/sections/corporate'
import { Why } from '@/components/sections/why'
import { QuizDialog, QuizSection } from '@/components/sections/quiz'
import { Reviews } from '@/components/sections/reviews'
import { Process } from '@/components/sections/process'
import { Delivery, HowToOrder } from '@/components/sections/delivery'
import { Faq, Guarantees } from '@/components/sections/trust'
import { FinalOffer, Footer } from '@/components/sections/final'
import { CookieNotice } from '@/components/shared/cookie-notice'

export function BelowMain() {
  return (
    <>
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
    </>
  )
}

export function BelowRest() {
  return (
    <>
      <Footer />
      <QuizDialog />
      <CookieNotice />
    </>
  )
}
