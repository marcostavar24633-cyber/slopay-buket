/**
 * Serverless-функция (Vercel / Netlify / Yandex Cloud Functions): принимает заявку с сайта
 * и пересылает её мастеру в Telegram. Переменные окружения: TG_BOT_TOKEN, TG_CHAT_ID.
 * На фронте укажите VITE_LEAD_ENDPOINT=/api/lead.
 */
const LABELS: Record<string, string> = {
  'order-drawer': '🛒 Заказ из карточки',
  quiz: '🧩 Квиз-подбор',
  'delivery-check': '⏱ «Успеете сегодня?»',
  corporate: '💼 Корпоративный',
  final: '🎯 Финальная форма',
  'exit-popup': '🚪 Exit-popup',
  upsell: '➕ Допродажа',
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })
  const lead = (await req.json()) as Record<string, unknown>
  if (typeof lead.phone !== 'string' || lead.phone.replace(/\D/g, '').length !== 11) return new Response('Bad phone', { status: 400 })

  const skip = new Set(['source', 'page', 'ts'])
  const lines = [
    `<b>${LABELS[String(lead.source)] ?? String(lead.source)}</b>`,
    ...Object.entries(lead)
      .filter(([k, v]) => !skip.has(k) && v !== '' && v != null)
      .map(([k, v]) => `${k}: ${String(v).replace(/[<>&]/g, '')}`),
    `<a href="https://wa.me/${String(lead.phone).replace(/\D/g, '')}">Написать в WhatsApp</a>`,
  ]
  const r = await fetch(`https://api.telegram.org/bot${process.env.TG_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: process.env.TG_CHAT_ID, text: lines.join('\n'), parse_mode: 'HTML' }),
  })
  return new Response(r.ok ? 'ok' : 'tg error', { status: r.ok ? 200 : 502 })
}
