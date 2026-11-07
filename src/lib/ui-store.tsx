import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { Product, Size } from './products'
import { goal } from './analytics'

interface OrderTarget {
  product: Product
  size: Size
}

interface UIState {
  order: OrderTarget | null
  openOrder: (product: Product, size: Size) => void
  closeOrder: () => void
  quizOpen: boolean
  setQuizOpen: (v: boolean) => void
  thanks: { name?: string } | null
  showThanks: (name?: string) => void
  closeThanks: () => void
  /** любая форма уже отправлена — exit-popup больше не показываем */
  converted: boolean
}

const Ctx = createContext<UIState | null>(null)

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [order, setOrder] = useState<OrderTarget | null>(null)
  const [quizOpen, setQuizOpenRaw] = useState(false)
  const [thanks, setThanks] = useState<{ name?: string } | null>(null)
  const [converted, setConverted] = useState(false)

  const openOrder = useCallback((product: Product, size: Size) => {
    goal('order_open', { product: product.name, size: size.key })
    setOrder({ product, size })
  }, [])
  const closeOrder = useCallback(() => setOrder(null), [])
  const setQuizOpen = useCallback((v: boolean) => {
    if (v) goal('quiz_popup_open')
    setQuizOpenRaw(v)
  }, [])
  const showThanks = useCallback((name?: string) => {
    setConverted(true)
    goal('thanks_screen')
    setThanks({ name })
  }, [])
  const closeThanks = useCallback(() => setThanks(null), [])

  const value = useMemo(
    () => ({ order, openOrder, closeOrder, quizOpen, setQuizOpen, thanks, showThanks, closeThanks, converted }),
    [order, openOrder, closeOrder, quizOpen, setQuizOpen, thanks, showThanks, closeThanks, converted],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useUI() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useUI outside UIProvider')
  return v
}

export const scrollToId = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
