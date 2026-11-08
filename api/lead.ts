/**
 * Серверная функция для Vercel: принимает заявку с сайта и пересылает её мастеру в Telegram-бот.
 * Переменные окружения (задаются в настройках Vercel, НЕ в коде): TG_BOT_TOKEN, TG_CHAT_ID.
 * Необязательно: ALLOWED_ORIGIN — адрес сайта, с которого принимать заявки (по умолчанию любой).
 * На сайте при сборке укажите VITE_LEAD_ENDPOINT=https://<проект>.vercel.app/api/lead.
 */
export const config = { runtime: 'edge' }

const LABELS: Record<string, string> = {
  'order-drawer': '🛒 Заказ из каталога',
  quiz: '🧩 Подбор букета (квиз)',
  'delivery-check': '⏱ Вопрос про сроки',
  corporate: '💼 Корпоративный заказ',
  final: '🎯 Заявка внизу страницы',
}

const FIELDS: Record<string, string> = {
  name: 'Имя',
  phone: 'Телефон',
  contact: 'Связь',
  product: 'Букет',
  price: 'Цена',
  date: 'Дата',
  address: 'Адрес',
  comment: 'Комментарий',
  card: 'Открытка',
  company: 'Компания',
  qty: 'Количество',
  budget: 'Бюджет',
  recipient: 'Кому',
  occasion: 'Повод',
  when: 'Когда',
}

const esc = (v: unknown) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export default async function handler(req: Request): Promise<Response> {
  const origin = process.env.ALLOWED_ORIGIN || '*'
  const cors = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: cors })

  let lead: Record<string, unknown>
  try {
    lead = (await req.json()) as Record<string, unknown>
  } catch {
    return new Response('Bad JSON', { status: 400, headers: cors })
  }
  const digits = typeof lead.phone === 'string' ? lead.phone.replace(/\D/g, '') : ''
  if (digits.length !== 11) return new Response('Bad phone', { status: 400, headers: cors })
  const intl = '+7' + digits.slice(1)

  const skip = new Set(['source', 'page', 'ts'])
  const lines = [
    `<b>${esc(LABELS[String(lead.source)] ?? lead.source)}</b>`,
    '',
    ...Object.entries(lead)
      .filter(([k, v]) => !skip.has(k) && v !== '' && v != null && typeof v !== 'object')
      .map(([k, v]) => `<b>${esc(FIELDS[k] ?? k)}:</b> ${esc(v).slice(0, 500)}`),
    '',
    `📞 ${intl} · ✈️ <a href="https://t.me/${intl}">написать в Telegram</a>`,
  ]

  const r = await fetch(`https://api.telegram.org/bot${process.env.TG_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: process.env.TG_CHAT_ID, text: lines.join('\n'), parse_mode: 'HTML', disable_web_page_preview: true }),
  })
  return new Response(r.ok ? 'ok' : 'tg error', { status: r.ok ? 200 : 502, headers: cors })
}
