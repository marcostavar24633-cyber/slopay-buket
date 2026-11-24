const owner = 'marcostavar24633-cyber';
const statuses = new Set(['new', 'confirmed', 'making', 'ready', 'done', 'cancelled']);
const channels = new Set(['telegram', 'max', 'phone', 'other']);
const fields = 'id, channel, status, fulfillment, due_date, amount, updated_at, version';

const json = (data, status = 200) => Response.json(data, {
  status,
  headers: { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' },
});

async function isOwner(request) {
  const auth = request.headers.get('Authorization');
  if (!auth || !/^Bearer [A-Za-z0-9_]{20,300}$/.test(auth)) return false;
  const headers = { Authorization: auth, Accept: 'application/vnd.github+json', 'User-Agent': 'slopay-buket-orders' };
  const account = await fetch('https://api.github.com/user', { headers, redirect: 'error' });
  if (!account.ok || (await account.json()).login?.toLowerCase() !== owner) return false;
  const repository = await fetch(`https://api.github.com/repos/${owner}/slopay-buket`, { headers, redirect: 'error' });
  return repository.ok && (await repository.json()).permissions?.push === true;
}

function parse(input) {
  if (!input || typeof input !== 'object') return null;
  const { channel, status, fulfillment, due_date, amount } = input;
  if (!statuses.has(status) || !channels.has(channel) || !['pickup', 'delivery'].includes(fulfillment)) return null;
  if (typeof due_date !== 'string' || (due_date && (!/^\d{4}-\d{2}-\d{2}$/.test(due_date) || new Date(due_date).toJSON()?.slice(0, 10) !== due_date))) return null;
  if (!Number.isSafeInteger(amount) || amount < 0 || amount > 10_000_000) return null;
  return [channel, status, fulfillment, due_date, amount];
}

export async function orders(request, database) {
  const url = new URL(request.url);
  const match = url.pathname.match(/^\/api\/admin\/orders(?:\/([a-f0-9-]{36}))?$/);
  if (!match) return json({ error: 'Адрес не найден.' }, 404);
  const id = match[1];
  const method = request.method;
  if ((!id && !['GET', 'POST'].includes(method)) || (id && method !== 'PATCH')) return json({ error: 'Метод недоступен.' }, 405);
  if (method !== 'GET' && request.headers.get('Origin') !== url.origin) return json({ error: 'Запрос с другого сайта отклонён.' }, 403);
  try {
    if (!await isOwner(request)) return json({ error: 'Журнал доступен владельцу магазина.' }, 401);
    if (!database) return json({ error: 'Хранилище заказов пока не подключено.' }, 503);
    if (method === 'GET') {
      const offset = Number(url.searchParams.get('offset') || 0);
      if (!Number.isSafeInteger(offset) || offset < 0 || offset > 100_000) return json({ error: 'Некорректная страница.' }, 400);
      const { results } = await database.prepare(`SELECT ${fields} FROM orders ORDER BY updated_at DESC, id DESC LIMIT 51 OFFSET ?`).bind(offset).all();
      return json({ items: results.slice(0, 50), more: results.length > 50 });
    }
    if (request.headers.get('Content-Type')?.split(';')[0] !== 'application/json') return json({ error: 'Ожидается JSON.' }, 415);
    const reader = request.body?.getReader();
    if (!reader) return json({ error: 'Нет данных.' }, 400);
    let size = 0;
    let raw = '';
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 16_384) {
        await reader.cancel();
        return json({ error: 'Данные заказа слишком большие.' }, 413);
      }
      raw += decoder.decode(value, { stream: true });
    }
    let input;
    try { input = JSON.parse(raw + decoder.decode()); } catch { return json({ error: 'Некорректный JSON.' }, 400); }
    const values = parse(input);
    if (!values) return json({ error: 'Проверьте поля заказа.' }, 400);
    const now = new Date().toISOString();
    if (method === 'POST') {
      const key = crypto.randomUUID();
      await database.prepare(`INSERT INTO orders (${fields}) VALUES (?, ?, ?, ?, ?, ?, ?, 1)`).bind(key, ...values, now).run();
      return json({ id: key }, 201);
    }
    if (!Number.isSafeInteger(input.version) || input.version < 1) return json({ error: 'Отсутствует версия записи.' }, 400);
    const result = await database.prepare('UPDATE orders SET channel=?, status=?, fulfillment=?, due_date=?, amount=?, updated_at=?, version=version+1 WHERE id=? AND version=?').bind(...values, now, id, input.version).run();
    return result.meta.changes === 1 ? json({ id }) : json({ error: 'Запись изменилась. Обновите список заказов.' }, 409);
  } catch {
    return json({ error: 'Журнал временно недоступен.' }, 503);
  }
}
