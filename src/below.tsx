/**
 * Всё, что ниже каталога, — отдельный файл сборки: грузится сразу после первого экрана,
 * но не мешает ему отрисоваться быстрее.
 */
import { Corporate } from '@/components/sections/corporate'
import { Occasions } from '@/components/sections/occasions'
import { Why } from '@/components/sections/why'
import { Reviews } from '@/components/sections/reviews'
import { Process } from '@/components/sections/process'
import { Delivery, HowToOrder } from '@/components/sections/delivery'
import { Faq } from '@/components/sections/trust'
import { Footer } from '@/components/sections/final'
import { CookieNotice } from '@/components/shared/cookie-notice'

export function BelowMain() {
  return (
    <>
      {/* Сезон (ноябрь–декабрь): B2B-блок поднят сразу после каталога. После праздников верните его ниже <Delivery/>. */}
      <Occasions />
      <Corporate />
      <Why />
      <Reviews />
      <Process />
      <HowToOrder />
      <Delivery />
      <Faq />
    </>
  )
}

export function BelowRest() {
  return (
    <>
      <Footer />
      <CookieNotice />
    </>
  )
}
