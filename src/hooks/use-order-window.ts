import { useEffect, useState } from 'react'
import { orderWindow, type OrderWindow } from '@/lib/time'

export function useOrderWindow(tickMs = 30_000): OrderWindow {
  const [w, setW] = useState(() => orderWindow())
  useEffect(() => {
    const id = setInterval(() => setW(orderWindow()), tickMs)
    return () => clearInterval(id)
  }, [tickMs])
  return w
}
