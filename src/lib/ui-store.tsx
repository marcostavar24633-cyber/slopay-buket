import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { Item } from './products'
import { goal } from './analytics'

interface UIState {
  order: Item | null
  openOrder: (item: Item) => void
  closeOrder: () => void
}

const Ctx = createContext<UIState | null>(null)

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [order, setOrder] = useState<Item | null>(null)

  const openOrder = useCallback((item: Item) => {
    goal('order_open', { item: item.id })
    setOrder(item)
  }, [])
  const closeOrder = useCallback(() => setOrder(null), [])

  const value = useMemo(
    () => ({ order, openOrder, closeOrder }),
    [order, openOrder, closeOrder],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useUI() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useUI outside UIProvider')
  return v
}

export const scrollToId = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
