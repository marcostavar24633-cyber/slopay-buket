import { StrictMode, startTransition } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/manrope/index.css'
import '@fontsource-variable/playfair-display/index.css'
import '@fontsource-variable/playfair-display/wght-italic.css'
import './index.css'
import App from './App'

// Отрисовка «в фоне» (transition): React делит работу на короткие порции и не блокирует касания.
// Пока она идёт, посетитель уже видит готовую разметку из пререндера.
const root = createRoot(document.getElementById('root')!)
startTransition(() => {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
