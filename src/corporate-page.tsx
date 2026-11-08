/** Отдельная страница /corporate/: корпоративные подарки — полный блок, отзыв, PDF-каталог и запрос КП. */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/manrope/index.css'
import '@fontsource-variable/playfair-display/index.css'
import './index.css'
import { Corporate } from '@/components/sections/corporate'
import { Footer } from '@/components/sections/final'
import { MobileBar } from '@/components/sections/header'

function CorporatePage() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-line bg-bar/90 backdrop-blur">
        <div className="container-x flex h-16 items-center justify-between gap-3">
          <a href={import.meta.env.BASE_URL} className="flex min-h-11 items-center gap-2.5 font-display text-[19px] font-bold italic">
            <img src="/logo-256.webp" alt="Логотип «Слопай букет»" width={40} height={40} className="h-10 w-10 rounded-full" /> Слопай букет
          </a>
          <a href={import.meta.env.BASE_URL} className="inline-flex min-h-11 items-center text-[14px] font-bold text-honey-600 underline underline-offset-4">
            ← Букеты для себя
          </a>
        </div>
      </header>
      <main>
        <Corporate />
      </main>
      <Footer />
      <MobileBar />
    </div>
  )
}

const root = document.getElementById('root')!
createRoot(root).render(
  <StrictMode>
    <CorporatePage />
  </StrictMode>,
)
