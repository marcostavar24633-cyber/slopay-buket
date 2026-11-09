/**
 * Состояние админки: все файлы содержимого, черновики правок и публикация.
 * Режимы: «github» — данные из репозитория, «Опубликовать» делает коммит;
 * «demo» — данные из сборки, сохранение выключено (можно посмотреть, как всё устроено).
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import site from '../../content/site.json'
import hero from '../../content/hero.json'
import products from '../../content/products.json'
import reviews from '../../content/reviews.json'
import faq from '../../content/faq.json'
import occasions from '../../content/occasions.json'
import seasons from '../../content/seasons.json'
import messages from '../../content/messages.json'
import page from '../../content/page.json'
import type { Block, Product } from '@/lib/content'
import { auth, getDeploys, getUser, readFile, uploadImage, writeFile, type Deploy, type User } from './github'

/** Файлы содержимого: ключ → путь в репозитории и подпись для истории изменений. */
export const FILES = {
  site: { path: 'content/site.json', label: 'Основные настройки' },
  hero: { path: 'content/hero.json', label: 'Первый экран' },
  products: { path: 'content/products.json', label: 'Товары' },
  reviews: { path: 'content/reviews.json', label: 'Отзывы' },
  faq: { path: 'content/faq.json', label: 'Вопросы' },
  occasions: { path: 'content/occasions.json', label: 'Поводы' },
  seasons: { path: 'content/seasons.json', label: 'Сезонные баннеры' },
  messages: { path: 'content/messages.json', label: 'Тексты сообщений' },
  page: { path: 'content/page.json', label: 'Блоки страницы' },
} as const
export type FileKey = keyof typeof FILES

export type Review = { name: string; date: string; item: string; tag?: string; text: string }
export type Quote = { name: string; item: string; text: string }
export type Season = { from: string; until: string; text: string; href: string }
export type Occasion = { title: string; text: string; image: string; target: string }

export type Content = {
  site: typeof site
  hero: typeof hero
  products: { items: Product[] }
  reviews: { reviews: Review[]; quotes: Quote[] }
  faq: { items: { q: string; a: string }[] }
  occasions: { items: Occasion[] }
  seasons: { seasons: Season[] }
  messages: Record<string, string>
  page: { blocks: Block[] }
}

const BUNDLED: Content = { site, hero, products, reviews, faq, occasions, seasons, messages, page } as Content
const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v))

export type Toast = { id: number; kind: 'ok' | 'error' | 'info'; text: string }

type Store = {
  mode: 'github' | 'demo'
  user: User | null
  loading: boolean
  error: string | null
  data: Content
  /** изменить файл: set('products', (d) => { d.items.push(...) }) — d — черновик-копия */
  set: <K extends FileKey>(key: K, fn: (draft: Content[K]) => void) => void
  dirty: FileKey[]
  discard: () => void
  publish: () => Promise<void>
  publishing: boolean
  upload: (file: File) => Promise<string>
  deploys: Deploy[]
  refreshDeploys: () => void
  toasts: Toast[]
  toast: (text: string, kind?: Toast['kind']) => void
  logout: () => void
}

const Ctx = createContext<Store | null>(null)
export const useStore = () => {
  const s = useContext(Ctx)
  if (!s) throw new Error('useStore вне StoreProvider')
  return s
}

export function StoreProvider({ token, onLogout, children }: { token: string | null; onLogout: () => void; children: ReactNode }) {
  const mode = token ? 'github' : 'demo'
  const [data, setData] = useState<Content>(() => clone(BUNDLED))
  const saved = useRef<Record<string, string>>(Object.fromEntries(Object.keys(FILES).map((k) => [k, JSON.stringify(BUNDLED[k as FileKey])])))
  const shas = useRef<Partial<Record<FileKey, string>>>({})
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(!!token)
  const [error, setError] = useState<string | null>(null)
  const [publishing, setPublishing] = useState(false)
  const [deploys, setDeploys] = useState<Deploy[]>([])
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((text: string, kind: Toast['kind'] = 'ok') => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, kind, text }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), kind === 'error' ? 8000 : 4000)
  }, [])

  // Загрузка свежих данных из репозитория (их могли поменять с другого устройства)
  useEffect(() => {
    if (!token) return
    let off = false
    ;(async () => {
      try {
        const u = await getUser(token)
        const entries = await Promise.all((Object.keys(FILES) as FileKey[]).map(async (k) => [k, await readFile(token, FILES[k].path)] as const))
        if (off) return
        const next = clone(BUNDLED)
        for (const [k, r] of entries) {
          ;(next as Record<string, unknown>)[k] = r.data
          shas.current[k] = r.sha
          saved.current[k] = JSON.stringify(r.data)
        }
        setUser(u)
        setData(next)
      } catch (e) {
        if (!off) setError((e as Error).message)
      } finally {
        if (!off) setLoading(false)
      }
    })()
    return () => {
      off = true
    }
  }, [token])

  const set = useCallback(<K extends FileKey>(key: K, fn: (d: Content[K]) => void) => {
    setData((prev) => {
      const draft = clone(prev[key])
      fn(draft)
      return { ...prev, [key]: draft }
    })
  }, [])

  const dirty = useMemo(() => (Object.keys(FILES) as FileKey[]).filter((k) => JSON.stringify(data[k]) !== saved.current[k]), [data])

  // не дать закрыть вкладку с неопубликованными правками
  useEffect(() => {
    if (!dirty.length) return
    const h = (e: BeforeUnloadEvent) => e.preventDefault()
    addEventListener('beforeunload', h)
    return () => removeEventListener('beforeunload', h)
  }, [dirty.length])

  const discard = () => setData((prev) => ({ ...prev, ...Object.fromEntries(dirty.map((k) => [k, JSON.parse(saved.current[k])])) }))

  const refreshDeploys = useCallback(() => {
    if (token) getDeploys(token).then(setDeploys)
  }, [token])
  useEffect(refreshDeploys, [refreshDeploys])
  // пока сайт пересобирается — обновляем статус каждые 15 секунд
  useEffect(() => {
    if (!deploys.some((d) => d.status !== 'completed')) return
    const t = setInterval(refreshDeploys, 15000)
    return () => clearInterval(t)
  }, [deploys, refreshDeploys])

  const publish = async () => {
    if (!token) return toast('Демо-режим: чтобы сохранять, войдите через GitHub-токен.', 'info')
    setPublishing(true)
    try {
      for (const k of dirty) {
        shas.current[k] = await writeFile(token, FILES[k].path, data[k], shas.current[k], `Админка: ${FILES[k].label}`)
        saved.current[k] = JSON.stringify(data[k])
      }
      setData((d) => ({ ...d })) // пересчитать dirty
      toast('Сохранено. Сайт обновится через 1–2 минуты.')
      setTimeout(refreshDeploys, 6000)
    } catch (e) {
      toast((e as Error).message, 'error')
    } finally {
      setPublishing(false)
    }
  }

  const upload = async (file: File) => {
    if (!token) {
      toast('Демо-режим: фото показано только у вас и не сохранится.', 'info')
      return URL.createObjectURL(file)
    }
    const path = await uploadImage(token, file)
    toast('Фото загружено')
    return path
  }

  const logout = () => {
    auth.clear()
    onLogout()
  }

  const value: Store = { mode, user, loading, error, data, set, dirty, discard, publish, publishing, upload, deploys, refreshDeploys, toasts, toast, logout }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

/** Адрес картинки для превью в админке: загруженные, но ещё не опубликованные фото берём прямо из GitHub. */
export function previewSrc(src: string) {
  if (!src) return ''
  if (/^(blob:|https?:|data:)/.test(src)) return src
  if (src.startsWith('/img/uploads/')) return `https://raw.githubusercontent.com/marcostavar24633-cyber/slopay-buket/main/public${src}`
  return src
}
