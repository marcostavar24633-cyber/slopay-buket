/** Корень админки: вход → каркас → страница по адресу #/раздел. */
import { useState } from 'react'
import { auth } from './github'
import { Login, Shell, useRoute } from './layout'
import { StoreProvider } from './store'
import { Dashboard } from './pages/dashboard'
import { Products } from './pages/products'
import { Reviews } from './pages/reviews'
import { Blocks } from './pages/blocks'
import { Faq } from './pages/faq'
import { Settings } from './pages/settings'

export default function AdminApp() {
  const [token, setToken] = useState<string | null>(auth.get)
  const [demo, setDemo] = useState(false)
  const [route, params, go] = useRoute()

  if (!token && !demo) return <Login onLogin={setToken} onDemo={() => setDemo(true)} />

  return (
    <StoreProvider
      key={token ?? 'demo'}
      token={token}
      onLogout={() => {
        setToken(null)
        setDemo(false)
      }}
    >
      <Shell route={route} go={go}>
        {route === 'dashboard' && <Dashboard go={go} />}
        {route === 'products' && <Products params={params} />}
        {route === 'reviews' && <Reviews params={params} />}
        {route === 'blocks' && <Blocks params={params} go={go} />}
        {route === 'faq' && <Faq params={params} />}
        {route === 'settings' && <Settings />}
      </Shell>
    </StoreProvider>
  )
}
