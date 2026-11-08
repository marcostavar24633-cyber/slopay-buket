/**
 * Telegram-бот для покупателей «Слопай букет» (серверная функция Vercel, webhook).
 *
 * Что умеет:
 *  - каталог по категориям и «Хиты продаж»: фото, название, состав, цена «от», листание ◀ ▶;
 *  - «Заказать»: мастер сразу получает заявку с букетом и ссылкой на клиента, клиента просим оставить номер;
 *  - доставка и оплата, контакты, кнопка «Открыть сайт»;
 *  - любое сообщение клиента пересылается мастеру; мастер отвечает ОТВЕТОМ (reply) на это сообщение —
 *    и бот передаёт ответ клиенту.
 *
 * Переменные окружения в Vercel: TG_BOT_TOKEN, TG_CHAT_ID (куда приходят заявки — чат мастера).
 * Необязательно: SITE_PUBLIC_URL — адрес сайта для кнопки «Открыть сайт».
 * Подключение: один раз откройте https://<проект>.vercel.app/api/bot?setup=1
 * Каталог (api/_catalog.json и фото public/tg/) обновляется командой npm run bot-catalog.
 */
import CATALOG from './_catalog.json'

export const config = { runtime: 'edge' }

type Item = { cat: string; name: string; desc: string; price: number }
type Cat = { key: string; label: string; items: string[] }
const C = CATALOG as { cats: Cat[]; items: Record<string, Item>; hits: string[]; site: Record<string, string | number> }
const S = C.site

const TOKEN = () => process.env.TG_BOT_TOKEN || ''
const OWNER = () => String(process.env.TG_CHAT_ID || '')
const SITE_URL = () => process.env.SITE_PUBLIC_URL || 'https://marcostavar24633-cyber.github.io/slopay-buket/'

const rub = (n: number) => n.toLocaleString('ru-RU').replace(/\s/g, ' ') + ' ₽'
const esc = (v: unknown) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

async function tg(method: string, body: Record<string, unknown>) {
  const r = await fetch(`https://api.telegram.org/bot${TOKEN()}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return (await r.json().catch(() => ({ ok: false }))) as { ok: boolean; result?: any; description?: string }
}

async function secretOf(token: string) {
  const h = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('slopay-webhook:' + token))
  return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 48)
}

// ---------- Списки: индекс категории или 'h' — хиты ----------
const listOf = (k: string) => (k === 'h' ? { label: '🔥 Хиты продаж', items: C.hits } : C.cats[Number(k)])
const minPrice = (ids: string[]) => Math.min(...ids.map((id) => C.items[id].price))

function menu() {
  const rows = [
    [{ text: '🔥 Хиты продаж', callback_data: 'c:h:0' }],
    ...C.cats.map((c, i) => [{ text: `${c.label} · от ${rub(minPrice(c.items))}`, callback_data: `c:${i}:0` }]),
    [
      { text: '🚚 Доставка и оплата', callback_data: 'info' },
      { text: '📞 Контакты', callback_data: 'contacts' },
    ],
    [{ text: '✍️ Собрать свой букет', callback_data: 'custom' }],
    [{ text: '🌐 Открыть сайт', url: SITE_URL() }],
  ]
  return {
    text:
      '<b>Слопай букет</b> — съедобные букеты в Ульяновске 🍓🥩🦞\n\n' +
      'Собираем из свежих продуктов в день доставки. Выберите категорию — покажем реальные работы с составом и ценой.',
    reply_markup: { inline_keyboard: rows },
    parse_mode: 'HTML',
  }
}

function card(k: string, i: number, origin: string) {
  const list = listOf(k)
  if (!list) return null
  const n = list.items.length
  const idx = ((i % n) + n) % n
  const id = list.items[idx]
  const it = C.items[id]
  const caption =
    `<b>${esc(it.name)}</b>\n${esc(it.desc)}\n\n💰 <b>от ${rub(it.price)}</b>\n\n` +
    `<i>${esc(list.label)} · ${idx + 1} из ${n}</i>\n<i>Состав можно поменять под вас.</i>`
  return {
    media: `${origin}/tg/${id}.jpg`,
    caption,
    reply_markup: {
      inline_keyboard: [
        [
          { text: '◀', callback_data: `c:${k}:${idx - 1}` },
          { text: `${idx + 1} / ${n}`, callback_data: 'noop' },
          { text: '▶', callback_data: `c:${k}:${idx + 1}` },
        ],
        [{ text: '🛒 Заказать этот букет', callback_data: `o:${id}` }],
        [{ text: '☰ Все категории', callback_data: 'menu' }],
      ],
    },
  }
}

const INFO_TEXT = () =>
  '<b>🚚 Доставка и оплата</b>\n\n' +
  `• Доставляем по всему Ульяновску, стоимость зависит от района.\n` +
  `• Бесплатно по Новому городу при заказе от ${rub(Number(S.freeDeliveryFrom))}.\n` +
  `• Самовывоз бесплатно: ${esc(S.address)}.\n\n` +
  '• Заказ лучше оформить за 1–2 дня, в отдельных случаях соберём день в день.\n' +
  '• Предоплата 50%, оплата по СБП или картой.\n' +
  '• Перед отправкой пришлём фото готового букета.\n\n' +
  '<b>Гарантия свежести.</b> Если продукт окажется несвежим — пришлите фото в течение 2 часов после получения, и мы сделаем скидку.'

const CONTACTS_TEXT = () =>
  '<b>📞 Контакты</b>\n\n' +
  `Телефон: ${esc(S.phone)}\n` +
  `Адрес: ${esc(S.address)}\n` +
  `Время работы: ${esc(S.hours)}\n\n` +
  'Можно просто написать сюда — сообщение сразу получит мастер.'

const BACK = { inline_keyboard: [[{ text: '☰ Все категории', callback_data: 'menu' }]] }
const ASK_PHONE = {
  keyboard: [[{ text: '📱 Отправить мой номер', request_contact: true }]],
  resize_keyboard: true,
  one_time_keyboard: true,
}

function who(u: any) {
  const name = esc([u?.first_name, u?.last_name].filter(Boolean).join(' ') || 'Клиент')
  const link = u?.username ? ` (@${esc(u.username)})` : ''
  return `<a href="tg://user?id=${u?.id}">${name}</a>${link}`
}
/** Строка с ID в уведомлении мастеру — по ней бот понимает, кому передать ответ. */
const tag = (u: any) => `\n\n<i>Ответьте на это сообщение (reply), чтобы написать клиенту · ID ${u?.id}</i>`

async function notifyOwner(text: string) {
  if (!OWNER()) return
  await tg('sendMessage', { chat_id: OWNER(), text, parse_mode: 'HTML', disable_web_page_preview: true })
}

/** Заказ букета: клиенту — фото с описанием и просьба оставить контакты, мастеру — фото с заявкой. */
async function order(chat: number | string, from: any, id: string, origin: string, fromSite: boolean) {
  const it = C.items[id]
  if (!it) return tg('sendMessage', { chat_id: chat, ...menu() })
  const photo = `${origin}/tg/${id}.jpg`
  if (fromSite) {
    await tg('sendPhoto', {
      chat_id: chat,
      photo,
      parse_mode: 'HTML',
      caption: `Здравствуйте! Хочу заказать букет <b>«${esc(it.name)}»</b> (${esc(listLabel(it.cat))})\n\n${esc(it.desc)}\n💰 от ${rub(it.price)}`,
    })
  }
  if (OWNER()) {
    await tg('sendPhoto', {
      chat_id: OWNER(),
      photo,
      parse_mode: 'HTML',
      caption:
        `<b>🛒 Заказ ${fromSite ? 'с сайта (Telegram)' : 'из бота'}</b>\n\n<b>Букет:</b> «${esc(it.name)}» — от ${rub(it.price)}\n${esc(it.desc)}\n\n` +
        `<b>Клиент:</b> ${who(from)}` +
        tag(from),
    })
  }
  await tg('sendMessage', {
    chat_id: chat,
    parse_mode: 'HTML',
    text:
      (fromSite ? 'Мастер уже получил ваш заказ 🎉\n\n' : `Отлично, вы выбрали <b>«${esc(it.name)}»</b> — от ${rub(it.price)} 🎉\n\nМастер уже получил заявку. `) +
      'Напишите сюда <b>дату, время и адрес доставки</b> и пожелания к составу — или нажмите кнопку ниже, чтобы отправить номер телефона, и мы перезвоним.',
    reply_markup: ASK_PHONE,
  })
}

const listLabel = (cat: string) => C.cats.find((c) => c.key === cat)?.label.toLowerCase() ?? ''

async function onCallback(q: any, origin: string) {
  const data: string = q.data || ''
  const chat = q.message?.chat?.id
  const mid = q.message?.message_id
  const isPhoto = !!q.message?.photo
  await tg('answerCallbackQuery', { callback_query_id: q.id })
  if (!chat) return

  if (data === 'menu') {
    if (isPhoto) {
      await tg('deleteMessage', { chat_id: chat, message_id: mid })
      await tg('sendMessage', { chat_id: chat, ...menu() })
    } else await tg('editMessageText', { chat_id: chat, message_id: mid, ...menu() })
    return
  }

  if (data.startsWith('c:')) {
    const [, k, i] = data.split(':')
    const c = card(k, Number(i) || 0, origin)
    if (!c) return
    if (isPhoto) {
      await tg('editMessageMedia', {
        chat_id: chat,
        message_id: mid,
        media: { type: 'photo', media: c.media, caption: c.caption, parse_mode: 'HTML' },
        reply_markup: c.reply_markup,
      })
    } else {
      await tg('deleteMessage', { chat_id: chat, message_id: mid })
      await tg('sendPhoto', { chat_id: chat, photo: c.media, caption: c.caption, parse_mode: 'HTML', reply_markup: c.reply_markup })
    }
    return
  }

  if (data.startsWith('o:')) {
    await order(chat, q.from, data.slice(2), origin, false)
    return
  }

  const texts: Record<string, () => string> = {
    info: INFO_TEXT,
    contacts: CONTACTS_TEXT,
    custom: () =>
      '<b>✍️ Свой букет</b>\n\nНапишите сюда, что хотите: повод, кому, бюджет, что добавить или убрать. ' +
      'Можно прислать фото-пример — соберём похожий.',
  }
  if (texts[data]) {
    const payload = { chat_id: chat, text: texts[data](), parse_mode: 'HTML', reply_markup: BACK }
    if (isPhoto) await tg('sendMessage', payload)
    else await tg('editMessageText', { ...payload, message_id: mid })
  }
}

async function onMessage(m: any, origin: string) {
  const chat = String(m.chat?.id)
  const text: string = m.text || ''

  // Мастер отвечает клиенту: reply на уведомление с «ID 123»
  if (chat === OWNER()) {
    const src = m.reply_to_message?.text || m.reply_to_message?.caption || ''
    const id = src.match(/ID (\d+)\s*$/)?.[1]
    if (!id) {
      if (text.startsWith('/start'))
        await tg('sendMessage', { chat_id: chat, text: 'Сюда будут приходить заявки и сообщения клиентов. Чтобы ответить клиенту — ответьте (reply) на его сообщение.' })
      return
    }
    const r = await tg('copyMessage', { chat_id: id, from_chat_id: chat, message_id: m.message_id })
    await tg('sendMessage', { chat_id: chat, text: r.ok ? '✅ Отправлено клиенту' : `⚠️ Не доставлено: ${r.description ?? ''}`, reply_to_message_id: m.message_id })
    return
  }

  // Переход с сайта: t.me/<бот>?start=o_<id букета>
  const start = text.match(/^\/start o_([A-Za-z0-9-]+)$/)
  if (start) return order(chat, m.from, start[1], origin, true)
  if (text.startsWith('/start') || text === '/catalog') return tg('sendMessage', { chat_id: chat, ...menu() })
  if (text === '/hits') return tg('sendMessage', { chat_id: chat, text: 'Открываю хиты 🔥', reply_markup: { inline_keyboard: [[{ text: '🔥 Смотреть хиты', callback_data: 'c:h:0' }]] } })
  if (text === '/delivery') return tg('sendMessage', { chat_id: chat, text: INFO_TEXT(), parse_mode: 'HTML', reply_markup: BACK })
  if (text === '/contacts') return tg('sendMessage', { chat_id: chat, text: CONTACTS_TEXT(), parse_mode: 'HTML', reply_markup: BACK })

  if (m.contact) {
    await notifyOwner(`<b>📱 Номер от клиента</b>\n\n${who(m.from)}: <b>${esc(m.contact.phone_number)}</b>` + tag(m.from))
    return tg('sendMessage', {
      chat_id: chat,
      text: `Спасибо! Мастер свяжется с вами в ближайшее время (${S.hours}). Пока можете написать сюда детали заказа.`,
      reply_markup: { remove_keyboard: true },
    })
  }

  // Любое другое сообщение — мастеру
  await notifyOwner(`<b>💬 Сообщение от клиента</b>\n\n${who(m.from)}${text ? `:\n${esc(text).slice(0, 3500)}` : ' прислал(а) вложение ⬇️'}` + tag(m.from))
  if (!text) await tg('copyMessage', { chat_id: OWNER(), from_chat_id: chat, message_id: m.message_id })
  await tg('sendMessage', {
    chat_id: chat,
    text: 'Передали мастеру ✅ Ответим здесь же в ближайшее время.',
    reply_markup: { inline_keyboard: [[{ text: '☰ Каталог', callback_data: 'menu' }]] },
  })
}

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url)
  const origin = url.origin
  if (!TOKEN()) return new Response('TG_BOT_TOKEN не задан в настройках Vercel', { status: 500 })

  // Подключение бота: открыть /api/bot?setup=1 один раз после деплоя
  if (req.method === 'GET') {
    if (url.searchParams.has('me')) {
      const me = await tg('getMe', {})
      return new Response(JSON.stringify({ username: me.result?.username ?? null }), { headers: { 'Content-Type': 'application/json' } })
    }
    if (!url.searchParams.has('setup')) return new Response('Слопай букет: бот работает. Подключение — /api/bot?setup=1')
    const results = {
      webhook: await tg('setWebhook', {
        url: `${origin}/api/bot`,
        secret_token: await secretOf(TOKEN()),
        allowed_updates: ['message', 'callback_query'],
        drop_pending_updates: true,
      }),
      commands: await tg('setMyCommands', {
        commands: [
          { command: 'start', description: 'Главное меню' },
          { command: 'catalog', description: 'Каталог букетов' },
          { command: 'hits', description: 'Хиты продаж' },
          { command: 'delivery', description: 'Доставка и оплата' },
          { command: 'contacts', description: 'Контакты' },
        ],
      }),
      description: await tg('setMyDescription', {
        description: 'Съедобные букеты в Ульяновске: ягодные, мясные, из раков, сухофруктов и сладостей. Каталог с ценами и заказ прямо здесь.',
      }),
      short: await tg('setMyShortDescription', { short_description: 'Съедобные букеты в Ульяновске — подарок, который не завянет 🍓' }),
      owner: OWNER() ? 'TG_CHAT_ID задан' : '⚠️ TG_CHAT_ID не задан — заявки некуда отправлять',
    }
    return new Response(JSON.stringify(results, null, 2), { headers: { 'Content-Type': 'application/json; charset=utf-8' } })
  }

  if (req.headers.get('x-telegram-bot-api-secret-token') !== (await secretOf(TOKEN()))) return new Response('forbidden', { status: 403 })
  const upd = (await req.json().catch(() => ({}))) as any
  try {
    if (upd.callback_query) await onCallback(upd.callback_query, origin)
    else if (upd.message) await onMessage(upd.message, origin)
  } catch (e) {
    console.error(e)
  }
  return new Response('ok')
}
