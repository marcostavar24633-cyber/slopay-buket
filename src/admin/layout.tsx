/** Каркас админки: вход, боковое меню, шапка (поиск, уведомления, профиль, тема), панель публикации, всплывающие сообщения. */
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  Bell,
  CheckCircle2,
  ExternalLink,
  HelpCircle,
  Home,
  KeyRound,
  LayoutDashboard,
  LayoutList,
  Loader2,
  LogOut,
  Menu,
  MousePointerClick,
  MessageSquareQuote,
  Moon,
  Package,
  Search,
  Settings,
  Sun,
  X,
  XCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { auth, checkRepo, getUser, REPO, TOKEN_URL } from './github'
import { FILES, useStore } from './store'
import { Btn } from './ui'

export type Route = 'dashboard' | 'editor' | 'products' | 'reviews' | 'blocks' | 'faq' | 'settings'
export const NAV: { key: Route; label: string; icon: typeof Home }[] = [
  { key: 'dashboard', label: 'Дашборд', icon: LayoutDashboard },
  { key: 'editor', label: 'Визуальный редактор', icon: MousePointerClick },
  { key: 'products', label: 'Товары', icon: Package },
  { key: 'reviews', label: 'Отзывы', icon: MessageSquareQuote },
  { key: 'blocks', label: 'Блоки страницы', icon: LayoutList },
  { key: 'faq', label: 'Вопросы', icon: HelpCircle },
  { key: 'settings', label: 'Настройки', icon: Settings },
]

/** Маршрут в адресе: #/products?q=клубника */
export function useRoute(): [Route, URLSearchParams, (r: Route, q?: Record<string, string>) => void] {
  const parse = () => {
    const [p, qs] = location.hash.replace(/^#\/?/, '').split('?')
    const r = (NAV.find((n) => n.key === p)?.key ?? 'dashboard') as Route
    return [r, new URLSearchParams(qs)] as const
  }
  const [state, setState] = useState(parse)
  useEffect(() => {
    const h = () => setState(parse())
    addEventListener('hashchange', h)
    return () => removeEventListener('hashchange', h)
  }, [])
  const go = (r: Route, q?: Record<string, string>) => {
    location.hash = `/${r}${q ? '?' + new URLSearchParams(q) : ''}`
    scrollTo(0, 0)
  }
  return [state[0], state[1], go]
}

/* ───────── Тема ───────── */
export function useTheme() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme ?? 'dark')
  const toggle = () => {
    const t = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = t
    try {
      localStorage.setItem('slopay-theme', t)
    } catch {
      /* ignore */
    }
    setTheme(t)
  }
  return { theme, toggle }
}

/* ───────── Вход ───────── */
export function Login({ onLogin, onDemo }: { onLogin: (token: string) => void; onDemo: () => void }) {
  const [token, setToken] = useState('')
  const [remember, setRemember] = useState(true)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setErr('')
    try {
      const t = token.trim()
      await getUser(t)
      await checkRepo(t)
      auth.set(t, remember)
      onLogin(t)
    } catch (e) {
      setErr((e as Error).message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <main className="grid min-h-dvh place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center gap-3">
          <img src="/logo-256.webp" alt="" width={48} height={48} className="h-12 w-12 rounded-full ring-1 ring-honey/30" />
          <div>
            <h1 className="font-display text-[24px] font-bold italic leading-none">Слопай букет</h1>
            <p className="mt-1 text-[13px] text-muted">Панель управления сайтом</p>
          </div>
        </div>
        <form onSubmit={submit} className="rounded-3xl border border-line bg-surface p-5 md:p-6">
          <label htmlFor="token" className="mb-1.5 flex items-center gap-2 text-[13px] font-bold text-ink-soft">
            <KeyRound className="h-4 w-4" /> Ключ доступа GitHub
          </label>
          <input
            id="token"
            type="password"
            autoComplete="current-password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="github_pat_…"
            className="h-12 w-full rounded-xl border border-line bg-cream px-3.5 text-[15px] outline-none focus:border-honey focus:ring-4 focus:ring-honey/15"
          />
          <label className="mt-3 flex cursor-pointer items-center gap-2 text-[13.5px] text-ink-soft">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 accent-[var(--color-honey)]" /> Запомнить на этом устройстве
          </label>
          {err && <p className="mt-3 rounded-xl bg-berry/10 px-3 py-2 text-[13.5px] text-berry">{err}</p>}
          <Btn type="submit" variant="primary" className="mt-4 h-12 w-full" disabled={!token.trim() || busy} icon={busy ? <Loader2 className="animate-spin" /> : undefined}>
            Войти
          </Btn>
          <details className="mt-4 text-[13.5px] text-ink-soft">
            <summary className="cursor-pointer font-semibold text-honey-600">Где взять ключ? (один раз, 2 минуты)</summary>
            <ol className="mt-2 list-decimal space-y-1.5 pl-5">
              <li>
                Откройте{' '}
                <a href={TOKEN_URL} target="_blank" rel="noopener" className="font-semibold text-honey-600 underline">
                  создание ключа на GitHub
                </a>{' '}
                (войдите в аккаунт {REPO.owner}).
              </li>
              <li>
                «Repository access» → <b>Only select repositories</b> → <b>{REPO.name}</b>.
              </li>
              <li>
                «Permissions» → <b>Contents: Read and write</b>, <b>Actions: Read-only</b> (для статуса обновления сайта).
              </li>
              <li>«Generate token» → скопируйте ключ и вставьте сюда.</li>
            </ol>
            <p className="mt-2 text-muted">Ключ хранится только в этом браузере и даёт доступ только к репозиторию сайта.</p>
          </details>
        </form>
        <button onClick={onDemo} className="mt-4 w-full cursor-pointer text-center text-[13.5px] font-semibold text-muted underline-offset-4 hover:text-ink hover:underline">
          Посмотреть без входа (демо, без сохранения)
        </button>
      </div>
    </main>
  )
}

/* ───────── Боковое меню ───────── */
function Sidebar({ route, go, open, onClose }: { route: Route; go: (r: Route) => void; open: boolean; onClose: () => void }) {
  const { logout, dirty } = useStore()
  const dirtyRoutes = new Set(
    dirty.map((k) => ({ site: 'settings', hero: 'settings', seasons: 'settings', messages: 'settings', occasions: 'settings', products: 'products', reviews: 'reviews', faq: 'faq', page: 'blocks' } as Record<string, string>)[k]),
  )
  return (
    <>
      <div onClick={onClose} className={cn('fixed inset-0 z-40 bg-black/50 transition lg:hidden', open ? 'opacity-100' : 'pointer-events-none opacity-0')} />
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-line bg-surface transition-transform lg:sticky lg:top-0 lg:h-dvh lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center gap-2.5 border-b border-line px-4">
          <img src="/logo-256.webp" alt="" width={36} height={36} className="h-9 w-9 rounded-full ring-1 ring-honey/30" />
          <span className="leading-none">
            <span className="block font-display text-[17px] font-bold italic">Слопай букет</span>
            <span className="mt-0.5 block text-[11px] font-semibold text-muted">Админ-панель</span>
          </span>
          <button onClick={onClose} aria-label="Закрыть меню" className="ml-auto grid h-9 w-9 cursor-pointer place-items-center rounded-lg text-ink-soft lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-3" aria-label="Разделы">
          <ul className="space-y-1">
            {NAV.map((n) => (
              <li key={n.key}>
                <button
                  onClick={() => {
                    go(n.key)
                    onClose()
                  }}
                  aria-current={route === n.key ? 'page' : undefined}
                  className={cn(
                    'flex h-11 w-full cursor-pointer items-center gap-3 rounded-xl px-3 text-[14.5px] font-semibold transition',
                    route === n.key ? 'bg-honey/15 text-honey-600' : 'text-ink-soft hover:bg-ink/5 hover:text-ink',
                  )}
                >
                  <n.icon className="h-[18px] w-[18px] shrink-0" />
                  {n.label}
                  {dirtyRoutes.has(n.key) && <span className="ml-auto h-2 w-2 rounded-full bg-honey" title="Есть неопубликованные правки" />}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="space-y-1 border-t border-line p-3">
          <a href="/" target="_blank" rel="noopener" className="flex h-11 items-center gap-3 rounded-xl px-3 text-[14.5px] font-semibold text-ink-soft hover:bg-ink/5 hover:text-ink">
            <ExternalLink className="h-[18px] w-[18px]" /> Открыть сайт
          </a>
          <button onClick={logout} className="flex h-11 w-full cursor-pointer items-center gap-3 rounded-xl px-3 text-[14.5px] font-semibold text-ink-soft hover:bg-berry/10 hover:text-berry">
            <LogOut className="h-[18px] w-[18px]" /> Выйти
          </button>
        </div>
      </aside>
    </>
  )
}

/* ───────── Глобальный поиск ───────── */
function GlobalSearch({ go }: { go: (r: Route, q?: Record<string, string>) => void }) {
  const { data } = useStore()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const h = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setOpen(false)
    addEventListener('mousedown', h)
    return () => removeEventListener('mousedown', h)
  }, [])
  const results = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (s.length < 2) return []
    const has = (...t: (string | undefined)[]) => t.some((x) => x?.toLowerCase().includes(s))
    return [
      ...data.products.items.filter((p) => has(p.name, p.desc, p.id)).slice(0, 5).map((p) => ({ r: 'products' as Route, label: p.name, sub: `Товар · ${p.price} ₽`, q: p.id })),
      ...data.reviews.reviews.filter((r) => has(r.name, r.text, r.item)).slice(0, 3).map((r) => ({ r: 'reviews' as Route, label: r.name, sub: 'Отзыв · ' + r.text.slice(0, 50), q: r.name })),
      ...data.faq.items.filter((f) => has(f.q, f.a)).slice(0, 3).map((f) => ({ r: 'faq' as Route, label: f.q, sub: 'Вопрос', q: f.q })),
    ]
  }, [q, data])
  return (
    <div ref={box} className="relative min-w-0 flex-1 md:max-w-md">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <input
        type="search"
        value={q}
        onChange={(e) => {
          setQ(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        placeholder="Поиск товаров, отзывов, вопросов"
        aria-label="Поиск по админке"
        className="h-10 w-full rounded-xl border border-line bg-cream pl-9 pr-3 text-[14px] outline-none focus:border-honey"
      />
      {open && q.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-12 z-40 overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl">
          {results.length ? (
            <ul>
              {results.map((x, i) => (
                <li key={i}>
                  <button
                    onClick={() => {
                      go(x.r, { q: x.q })
                      setOpen(false)
                      setQ('')
                    }}
                    className="block w-full cursor-pointer px-4 py-2.5 text-left hover:bg-ink/5"
                  >
                    <span className="block truncate text-[14px] font-semibold">{x.label}</span>
                    <span className="block truncate text-[12px] text-muted">{x.sub}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-3 text-[13px] text-muted">Ничего не найдено</p>
          )}
        </div>
      )}
    </div>
  )
}

/* ───────── Уведомления ───────── */
type Note = { tone: 'ok' | 'warn' | 'info' | 'error'; text: string; to?: Route; href?: string }
function useNotes(): Note[] {
  const { data, dirty, deploys, mode } = useStore()
  const notes: Note[] = []
  if (mode === 'demo') notes.push({ tone: 'info', text: 'Демо-режим: правки не сохраняются. Войдите, чтобы публиковать.' })
  if (dirty.length) notes.push({ tone: 'warn', text: `Не опубликовано: ${dirty.map((k) => FILES[k].label).join(', ')}` })
  const d = deploys[0]
  if (d && d.status !== 'completed') notes.push({ tone: 'info', text: 'Сайт обновляется — обычно 1–2 минуты', href: d.url })
  else if (d && d.conclusion === 'failure') notes.push({ tone: 'error', text: 'Последнее обновление сайта не прошло. Откройте подробности.', href: d.url })
  const s = data.site
  const miss = [!s.ownerName && 'ФИО/ИП', !s.inn && 'ИНН', !s.email && 'e-mail'].filter(Boolean)
  if (miss.length) notes.push({ tone: 'warn', text: `Не заполнены данные продавца: ${miss.join(', ')} — нужны для оферты и доверия`, to: 'settings' })
  const hidden = data.page.blocks.filter((b) => b.show === false).length
  if (hidden) notes.push({ tone: 'info', text: `Скрыто блоков на странице: ${hidden}`, to: 'blocks' })
  return notes
}

function Notifications({ go }: { go: (r: Route) => void }) {
  const notes = useNotes()
  const [open, setOpen] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const h = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setOpen(false)
    addEventListener('mousedown', h)
    return () => removeEventListener('mousedown', h)
  }, [])
  const urgent = notes.filter((n) => n.tone === 'warn' || n.tone === 'error').length
  return (
    <div ref={box} className="relative">
      <button onClick={() => setOpen((v) => !v)} aria-label={`Уведомления: ${notes.length}`} className="relative grid h-10 w-10 cursor-pointer place-items-center rounded-xl text-ink-soft hover:bg-ink/5 hover:text-ink">
        <Bell className="h-5 w-5" />
        {notes.length > 0 && (
          <span className={cn('absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full px-1 text-[10px] font-extrabold', urgent ? 'bg-berry text-white' : 'bg-honey text-onaccent')}>{notes.length}</span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-40 w-[min(360px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl">
          <p className="border-b border-line px-4 py-3 text-[14px] font-extrabold">Уведомления</p>
          {notes.length ? (
            <ul className="max-h-80 overflow-y-auto">
              {notes.map((n, i) => {
                const Icon = n.tone === 'error' ? XCircle : n.tone === 'warn' ? Bell : n.tone === 'ok' ? CheckCircle2 : Loader2
                const body = (
                  <span className="flex gap-3 px-4 py-3 text-left text-[13.5px] leading-snug hover:bg-ink/5">
                    <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', n.tone === 'error' ? 'text-berry' : n.tone === 'warn' ? 'text-honey' : 'text-muted')} />
                    {n.text}
                  </span>
                )
                return (
                  <li key={i} className="border-b border-line last:border-0">
                    {n.href ? (
                      <a href={n.href} target="_blank" rel="noopener" className="block">
                        {body}
                      </a>
                    ) : (
                      <button
                        className="block w-full cursor-pointer"
                        onClick={() => {
                          if (n.to) go(n.to)
                          setOpen(false)
                        }}
                      >
                        {body}
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="px-4 py-6 text-center text-[13.5px] text-muted">Всё в порядке</p>
          )}
        </div>
      )}
    </div>
  )
}

/* ───────── Шапка ───────── */
function Header({ onMenu, go }: { onMenu: () => void; go: (r: Route, q?: Record<string, string>) => void }) {
  const { user, mode, logout } = useStore()
  const { theme, toggle } = useTheme()
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-line bg-cream/90 px-3 backdrop-blur md:gap-3 md:px-6">
      <button onClick={onMenu} aria-label="Меню" className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-xl text-ink-soft hover:bg-ink/5 lg:hidden">
        <Menu className="h-5 w-5" />
      </button>
      <GlobalSearch go={go} />
      <div className="ml-auto flex shrink-0 items-center gap-1">
        <button onClick={toggle} aria-label={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'} className="grid h-10 w-10 cursor-pointer place-items-center rounded-xl text-ink-soft hover:bg-ink/5 hover:text-ink">
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        <Notifications go={go} />
        <div className="relative">
          <button onClick={() => setOpen((v) => !v)} aria-label="Профиль" className="flex h-10 cursor-pointer items-center gap-2 rounded-xl pl-1 pr-1 hover:bg-ink/5 md:pr-3">
            {user ? (
              <img src={user.avatar_url} alt="" className="h-8 w-8 rounded-full" />
            ) : (
              <span className="grid h-8 w-8 place-items-center rounded-full bg-honey text-[14px] font-extrabold text-onaccent">А</span>
            )}
            <span className="hidden text-[13.5px] font-semibold md:block">{user ? user.name || user.login : 'Демо'}</span>
          </button>
          {open && (
            <div className="absolute right-0 top-12 z-40 w-60 overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl">
              <div className="border-b border-line px-4 py-3">
                <p className="text-[14px] font-bold">{user ? user.name || user.login : 'Демо-режим'}</p>
                <p className="text-[12px] text-muted">{mode === 'github' ? `GitHub: ${user?.login ?? '…'}` : 'Без сохранения'}</p>
              </div>
              <button onClick={logout} className="flex w-full cursor-pointer items-center gap-2 px-4 py-3 text-[14px] font-semibold text-berry hover:bg-berry/10">
                <LogOut className="h-4 w-4" /> Выйти
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

/* ───────── Панель «Опубликовать» ───────── */
function PublishBar() {
  const { dirty, publish, publishing, discard, mode } = useStore()
  if (!dirty.length) return null
  return (
    <div className="sticky bottom-0 z-30 border-t border-honey/40 bg-surface/95 px-3 py-3 backdrop-blur md:px-6">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
        <p className="text-[13.5px] text-ink-soft">
          <b className="text-ink">Есть неопубликованные правки:</b> {dirty.map((k) => FILES[k].label).join(', ')}
        </p>
        <div className="flex gap-2">
          <Btn size="sm" variant="ghost" onClick={discard} disabled={publishing}>
            Отменить правки
          </Btn>
          <Btn size="sm" variant="primary" onClick={publish} disabled={publishing} icon={publishing ? <Loader2 className="animate-spin" /> : undefined}>
            {mode === 'demo' ? 'Опубликовать (демо)' : 'Опубликовать на сайте'}
          </Btn>
        </div>
      </div>
    </div>
  )
}

function Toasts() {
  const { toasts } = useStore()
  return (
    <div aria-live="polite" className="pointer-events-none fixed bottom-20 right-3 z-[60] flex w-[min(380px,calc(100vw-24px))] flex-col gap-2 md:right-6">
      {toasts.map((t) => (
        <p
          key={t.id}
          className={cn(
            'pointer-events-auto rounded-2xl border px-4 py-3 text-[14px] font-semibold shadow-2xl',
            t.kind === 'error' ? 'border-berry/40 bg-surface text-berry' : t.kind === 'info' ? 'border-line bg-surface text-ink' : 'border-leaf/40 bg-surface text-leaf',
          )}
        >
          {t.text}
        </p>
      ))}
    </div>
  )
}

export function Shell({ route, go, children }: { route: Route; go: (r: Route, q?: Record<string, string>) => void; children: ReactNode }) {
  const [menu, setMenu] = useState(false)
  const { loading, error, logout } = useStore()
  return (
    <div className="flex min-h-dvh">
      <Sidebar route={route} go={go} open={menu} onClose={() => setMenu(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header onMenu={() => setMenu(true)} go={go} />
        <main className={route === 'editor' ? 'min-w-0 flex-1' : 'mx-auto w-full max-w-6xl flex-1 px-3 py-5 md:px-6 md:py-8'}>
          {loading ? (
            <p className="flex items-center gap-2 text-ink-soft">
              <Loader2 className="h-5 w-5 animate-spin text-honey" /> Загружаем данные сайта…
            </p>
          ) : error ? (
            <div className="rounded-2xl border border-berry/40 bg-berry/10 p-5">
              <p className="font-bold text-berry">{error}</p>
              <Btn className="mt-3" onClick={logout}>
                Войти заново
              </Btn>
            </div>
          ) : (
            children
          )}
        </main>
        <PublishBar />
      </div>
      <Toasts />
    </div>
  )
}
