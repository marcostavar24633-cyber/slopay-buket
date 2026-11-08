import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { Item } from './products'
import { goal } from './analytics'

interface UIState {
  order: Item | null
  openOrder: (item: Item) => void
  closeOrder: () => void
  quizOpen: boolean
  setQuizOpen: (v: boolean) => void
}

const Ctx = createContext<UIState | null>(null)

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [order, setOrder] = useState<Item | null>(null)

  const openOrder = useCallback((item: Item) => {
    goal('order_open', { item: item.id })
    setOrder(item)
  }, [])
  const closeOrder = useCallback(() => setOrder(null), [])
  const [quizOpen, setQuizOpenRaw] = useState(false)
  const setQuizOpen = useCallback((v: boolean) => {
    if (v) goal('quiz_open')
    setQuizOpenRaw(v)
  }, [])

  const value = useMemo(
    () => ({ order, openOrder, closeOrder, quizOpen, setQuizOpen }),
    [order, openOrder, closeOrder, quizOpen, setQuizOpen],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useUI() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useUI outside UIProvider')
  return v
}

export const scrollToId = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
