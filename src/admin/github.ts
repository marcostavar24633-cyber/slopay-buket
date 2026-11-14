/**
 * «Бэкенд» админки — API GitHub. Данные сайта лежат в репозитории (content/*.json),
 * админка читает и сохраняет их от имени владельца по его токену. После сохранения
 * GitHub Actions сам пересобирает сайт (.github/workflows/pages.yml), ~1–2 минуты.
 *
 * Чтобы подключить другой бэкенд (свой сервер, CMS, базу), замените функции этого файла:
 * readFile / writeFile / uploadImage / getUser / getDeploys — остальная админка их только вызывает.
 */

export const REPO = { owner: 'marcostavar24633-cyber', name: 'slopay-buket', branch: 'main' }
const API = 'https://api.github.com'
const TOKEN_KEY = 'slopay-admin-token'

/** Токен хранится только в этом браузере. «Выйти» — удаляет его. */
export const auth = {
  get: (): string | null => {
    try {
      return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY)
    } catch {
      return null
    }
  },
  set(token: string, remember: boolean) {
    // Не оставляем старую копию токена в другом хранилище при смене режима.
    try {
      localStorage.removeItem(TOKEN_KEY)
    } catch {
      /* localStorage недоступен */
    }
    try {
      sessionStorage.removeItem(TOKEN_KEY)
    } catch {
      /* sessionStorage недоступен */
    }
    try {
      ;(remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, token)
    } catch {
      /* хранилище недоступно */
    }
  },
  clear() {
    try {
      localStorage.removeItem(TOKEN_KEY)
      sessionStorage.removeItem(TOKEN_KEY)
    } catch {
      /* ignore */
    }
  },
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
  }
}

async function gh<T>(token: string, path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(API + path, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    const msg =
      res.status === 401
        ? 'Токен недействителен или истёк. Войдите заново.'
        : (res.status === 403 || res.status === 404) && path.includes('/actions/')
          ? 'Не удалось получить статус сборки. Проверьте право Actions: Read-only и наличие workflow pages.yml.'
          : res.status === 403 || res.status === 404
            ? 'У токена нет доступа к репозиторию сайта (нужно право Contents: Read and write).'
          : res.status === 409
            ? 'Файл изменился, пока вы редактировали. Обновите страницу и повторите.'
            : `Ошибка GitHub ${res.status}: ${text.slice(0, 200)}`
    throw new ApiError(res.status, msg)
  }
  return res.status === 204 ? (undefined as T) : res.json()
}

/** base64 ↔ UTF-8 (в JSON есть кириллица) */
const toB64 = (s: string) => {
  const bytes = new TextEncoder().encode(s)
  let bin = ''
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  return btoa(bin)
}
const fromB64 = (b: string) => new TextDecoder().decode(Uint8Array.from(atob(b.replace(/\n/g, '')), (c) => c.charCodeAt(0)))

export type User = { login: string; name: string | null; avatar_url: string }
export const getUser = (token: string) => gh<User>(token, '/user')

/** Проверка, что токен видит репозиторий сайта и может в него писать. */
export async function checkRepo(token: string) {
  const r = await gh<{ permissions?: { push?: boolean } }>(token, `/repos/${REPO.owner}/${REPO.name}`)
  if (!r.permissions?.push) throw new ApiError(403, 'Токен видит репозиторий, но не может сохранять. Дайте ему право Contents: Read and write.')
}

/** Прочитать JSON-файл из репозитория. sha нужен, чтобы потом сохранить без конфликтов. */
export async function readFile<T>(token: string, path: string): Promise<{ data: T; sha: string }> {
  const r = await gh<{ content: string; sha: string; encoding: string; download_url: string }>(
    token,
    `/repos/${REPO.owner}/${REPO.name}/contents/${path}?ref=${REPO.branch}`,
  )
  // файлы больше 1 МБ API отдаёт без содержимого — тогда берём по download_url
  const text = r.content ? fromB64(r.content) : await (await fetch(r.download_url, { headers: { Authorization: `Bearer ${token}` } })).text()
  return { data: JSON.parse(text) as T, sha: r.sha }
}

/** Сохранить JSON-файл = коммит в ветку main. Возвращает новый sha. */
export async function writeFile(token: string, path: string, data: unknown, sha: string | undefined, message: string) {
  const r = await gh<{ content: { sha: string } }>(token, `/repos/${REPO.owner}/${REPO.name}/contents/${path}`, {
    method: 'PUT',
    body: JSON.stringify({ message, content: toB64(JSON.stringify(data, null, 2) + '\n'), sha, branch: REPO.branch }),
  })
  return r.content.sha
}

/**
 * Загрузить фото: сжимаем в браузере до 1600 px (WebP, ~150–300 КБ) и кладём в public/img/uploads/.
 * Возвращает путь для сайта: /img/uploads/…webp (появится на сайте после пересборки).
 */
export async function uploadImage(token: string, file: File): Promise<string> {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Поддерживаются только JPG, PNG, WebP и GIF. SVG и другие форматы не принимаются.')
  }
  if (file.size <= 0 || file.size > 15 * 1024 * 1024) {
    throw new Error('Размер исходного фото должен быть от 1 байта до 15 МБ.')
  }
  const blob = await compress(file)
  if (blob.size > 8 * 1024 * 1024) {
    throw new Error('Сжатое изображение превышает 8 МБ. Выберите фото меньшего размера.')
  }
  const slug = file.name.replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9а-яё]+/gi, '-').replace(/^-|-$/g, '').slice(0, 40) || 'photo'
  const name = `${Date.now().toString(36)}-${translit(slug)}.webp`
  const buf = new Uint8Array(await blob.arrayBuffer())
  let bin = ''
  for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode(...buf.subarray(i, i + 0x8000))
  await gh(token, `/repos/${REPO.owner}/${REPO.name}/contents/public/img/uploads/${name}`, {
    method: 'PUT',
    body: JSON.stringify({ message: `Админка: фото ${name}`, content: btoa(bin), branch: REPO.branch }),
  })
  return `/img/uploads/${name}`
}

async function compress(file: File, max = 1600): Promise<Blob> {
  let bmp: ImageBitmap
  try {
    bmp = await createImageBitmap(file)
  } catch {
    throw new Error('Не удалось открыть изображение. Проверьте формат и целостность файла.')
  }
  try {
    const pixels = bmp.width * bmp.height
    if (!bmp.width || !bmp.height || bmp.width > 12000 || bmp.height > 12000 || pixels > 40_000_000) {
      throw new Error('Слишком большое разрешение фото. Максимум — 40 мегапикселей и 12 000 px по стороне.')
    }
    const k = Math.min(1, max / Math.max(bmp.width, bmp.height))
    const c = document.createElement('canvas')
    c.width = Math.max(1, Math.round(bmp.width * k))
    c.height = Math.max(1, Math.round(bmp.height * k))
    const ctx = c.getContext('2d')
    if (!ctx) throw new Error('Браузер не смог подготовить изображение для сжатия.')
    ctx.drawImage(bmp, 0, 0, c.width, c.height)
    const blob = await new Promise<Blob>((ok, fail) =>
      c.toBlob((b) => (b ? ok(b) : fail(new Error('Не удалось сжать фото'))), 'image/webp', 0.85),
    )
    if (blob.type !== 'image/webp') throw new Error('Браузер не поддерживает сохранение фото в WebP.')
    return blob
  } finally {
    bmp.close()
  }
}

const TR: Record<string, string> = { а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya' }
const translit = (s: string) => s.replace(/[а-яё]/g, (c) => TR[c] ?? '')

/** Последние пересборки сайта (нужно право Actions: Read; без него вернётся пустой список). */
export type Deploy = { id: number; status: string; conclusion: string | null; created_at: string; title: string; url: string }
export async function getDeploys(token: string): Promise<Deploy[]> {
  const r = await gh<{ workflow_runs: { id: number; status: string; conclusion: string | null; created_at: string; display_title: string; html_url: string }[] }>(
    token,
    `/repos/${REPO.owner}/${REPO.name}/actions/workflows/pages.yml/runs?per_page=6`,
  )
  return r.workflow_runs.map((w) => ({ id: w.id, status: w.status, conclusion: w.conclusion, created_at: w.created_at, title: w.display_title, url: w.html_url }))
}

/** Ссылка на создание токена с уже выбранными правами (GitHub подставит их в форму). */
export const TOKEN_URL =
  'https://github.com/settings/personal-access-tokens/new?' +
  new URLSearchParams({
    name: 'Админка слопайбукет.рф',
    description: 'Редактирование сайта через /admin/',
    target_name: REPO.owner,
    expires_in: '366',
    contents: 'write',
    actions: 'read',
  }).toString()

/**
 * Адрес сайта относительно админки: /admin/ → /, а в копии для галереи (admin.html рядом с index.html) → ./index.html.
 * Нужен для «Открыть сайт» и для фрейма визуального редактора.
 */
export function siteUrl(query = '') {
  const path = location.pathname
  if (/admin\.html$/.test(path)) return path.replace(/admin\.html$/, 'index.html') + query
  return path.replace(/admin\/(index\.html)?$/, '') + query
}
/** Цель для postMessage: в песочнице с «пустым» адресом (origin = 'null') — '*', проверяем источник сообщения. */
export const msgTarget = () => (location.origin === 'null' ? '*' : location.origin)
