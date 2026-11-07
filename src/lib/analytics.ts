/** Цели Яндекс Метрики. Укажите ID счётчика — и цели начнут отправляться. */
export const YM_ID = 0

declare global {
  interface Window {
    ym?: (id: number, action: string, goal: string, params?: Record<string, unknown>) => void
  }
}

export function goal(name: string, params?: Record<string, unknown>) {
  try {
    if (YM_ID && window.ym) window.ym(YM_ID, 'reachGoal', name, params)
    if (import.meta.env.DEV) console.debug('[goal]', name, params ?? '')
  } catch {
    /* аналитика не должна ломать сайт */
  }
}
