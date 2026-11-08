/**
 * Всё, что ниже «Хита продаж», — отдельный файл сборки: грузится сразу после первого экрана,
 * но не мешает ему отрисоваться быстрее.
 * Порядок: отзывы → 4 шага и 3 гарантии → каталог → почему съедобные → поводы → доставка → Мария → FAQ → тизер для компаний.
 */
import { Catalog } from '@/components/sections/catalog'
import { Occasions } from '@/components/sections/occasions'
import { Why } from '@/components/sections/why'
import { Reviews } from '@/components/sections/reviews'
import { Process } from '@/components/sections/process'
import { Delivery, HowToOrder } from '@/components/sections/delivery'
import { Faq } from '@/components/sections/trust'
import { CorporateTeaser } from '@/components/sections/corporate-teaser'
import { Footer } from '@/components/sections/final'
import { QuizDialog } from '@/components/sections/quiz'
import { CookieNotice } from '@/components/shared/cookie-notice'

export function BelowMain() {
  return (
    <>
      <Reviews />
      <HowToOrder />
      <Catalog />
      <Why />
      <Occasions />
      <Delivery />
      <Process />
      <Faq />
      <CorporateTeaser />
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
