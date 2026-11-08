/**
 * Бот для покупателей отключён. Этот файл временный: открыть /api/bot?disable=1 —
 * бот перестанет получать сообщения, у него пропадут меню команд и описание.
 */
export const config = { runtime: 'edge' }

async function tg(method: string, body: Record<string, unknown>) {
  const r = await fetch(`https://api.telegram.org/bot${process.env.TG_BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return r.json().catch(() => ({ ok: false }))
}

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url)
  if (req.method === 'GET' && url.searchParams.has('disable')) {
    const res = {
      webhook: await tg('deleteWebhook', { drop_pending_updates: true }),
      commands: await tg('deleteMyCommands', {}),
      description: await tg('setMyDescription', { description: '' }),
      short: await tg('setMyShortDescription', { short_description: '' }),
    }
    return new Response(JSON.stringify(res, null, 2), { headers: { 'Content-Type': 'application/json; charset=utf-8' } })
  }
  return new Response('ok')
}
