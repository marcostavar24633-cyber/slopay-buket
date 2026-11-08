import { goal } from './analytics'

export type LeadSource =
  | 'order-drawer'
  | 'quiz'
  | 'delivery-check'
  | 'corporate'
  | 'final'
  | 'exit-popup'

export interface Lead {
  source: LeadSource
  name?: string
  phone: string
  contact?: string
  [key: string]: unknown
}

/** Серверная функция на Vercel, которая пересылает заявки в Telegram-бот (api/lead.ts). */
const LEAD_ENDPOINT = 'https://slopay-buket-jdmt.vercel.app/api/lead'

/**
 * Отправляет заявку. В проде VITE_LEAD_ENDPOINT указывает на серверную функцию
 * (пример — api/lead.ts), которая пересылает её в Telegram-бот мастеру.
 * Токен бота на фронте не хранится.
 */
export async function submitLead(lead: Lead): Promise<boolean> {
  const payload = { ...lead, page: location.href, ts: new Date().toISOString() }
  goal(`lead_${lead.source}`, { product: lead.product })
  const endpoint = (import.meta.env.VITE_LEAD_ENDPOINT as string | undefined) || (import.meta.env.DEV ? '' : LEAD_ENDPOINT)
  if (!endpoint) {
    if (import.meta.env.DEV) console.info('[lead]', payload)
    await new Promise((r) => setTimeout(r, 450))
    return true
  }
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    return res.ok
  } catch {
    return false
  }
}
