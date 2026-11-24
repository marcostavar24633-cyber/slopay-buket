/**
 * Визуальный редактор: актуальная витрина открыта во фрейме и меняется вживую.
 * На странице: клик — выбрать блок, ярлык — перетащить, двойной клик по заголовку — правка текста.
 * Справа: содержимое и оформление выбранного блока (цвета, отступы, ширина, размер заголовка) и цвета всего сайта.
 * Всё попадает в черновик админки; на сайт — после «Опубликовать».
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowUp, Eye, EyeOff, Monitor, MousePointerClick, Palette, Plus, Redo2, RotateCcw, Smartphone, Trash2, Undo2, X } from 'lucide-react'
import type { Block, BlockStyle, Theme } from '@/lib/content'
import type { ToAdmin, ToSite } from '@/lib/live'
import { cn } from '@/lib/utils'
import { previewSrc, useStore, type Content } from '../store'
import { msgTarget, siteUrl } from '../github'
import { Btn, IconBtn, Modal, Select } from '../ui'
import { BlockForm, blank, nameOf, TYPES, type CustomType } from './blocks'
import { HeroSettings } from './settings'

type Sel = number | 'hero' | null
type EditSnapshot = { blocks: Block[]; hero: Content['hero']; theme: Theme }
const emptyTheme: Theme = {}
export function Editor() {
  const { data, set } = useStore()
  const frame = useRef<HTMLIFrameElement>(null)
  const [device, setDevice] = useState<'desktop' | 'phone'>('desktop')
  const [interactive, setInteractive] = useState(false)
  const [sel, setSel] = useState<Sel>(null)
  const [tab, setTab] = useState<'content' | 'style'>('style')
  const [panel, setPanel] = useState<'block' | 'theme'>('block')
  const [adding, setAdding] = useState(false)
  const scrollY = useRef(0)
  const dataRef = useRef(data)
  dataRef.current = data
  const theme = (data.site as { theme?: Theme }).theme ?? emptyTheme
  const snapshot: EditSnapshot = { blocks: data.page.blocks, hero: data.hero, theme }
  const stateKey = JSON.stringify(snapshot)
  const history = useRef<{ before: EditSnapshot[]; after: EditSnapshot[]; current: EditSnapshot }>({ before: [], after: [], current: snapshot })
  const restoring = useRef(false)
  const [, renderHistory] = useState(0)
  useEffect(() => {
    const log = history.current
    if (stateKey === JSON.stringify(log.current)) return
    if (restoring.current) restoring.current = false
    else {
      log.before = [...log.before.slice(-39), log.current]
      log.after = []
    }
    log.current = JSON.parse(stateKey) as EditSnapshot
    renderHistory((n) => n + 1)
  }, [stateKey])
  const restore = (direction: 'before' | 'after') => {
    const log = history.current
    const next = log[direction].pop()
    if (!next) return
    log[direction === 'before' ? 'after' : 'before'].push(log.current)
    restoring.current = true
    set('page', (page) => { page.blocks = next.blocks })
    set('hero', (hero) => { Object.assign(hero, next.hero) })
    set('site', (site) => { (site as { theme?: Theme }).theme = Object.keys(next.theme).length ? next.theme : undefined })
    setSel(null)
  }

  const post = useCallback((m: ToSite) => frame.current?.contentWindow?.postMessage(m, msgTarget()), [])
  const sendLive = useCallback(() => {
    const d = dataRef.current
    const page = d.page.blocks.map((block) => {
      if (block.type === 'imageText' || block.type === 'banner') return { ...block, image: previewSrc(block.image || '') }
      if (block.type === 'gallery') return { ...block, images: block.images?.map((item) => ({ ...item, image: previewSrc(item.image) })) }
      return block
    })
    const product = d.products.items.find((item) => item.id === d.hero.photoProduct && item.show !== false)
    post({ type: 'slopay:live', page, hero: { ...d.hero, photoUrl: product && previewSrc(product.image) }, theme: ((d.site as { theme?: Theme }).theme ?? {}) as Theme, selected: sel, interactive })
  }, [post, sel, interactive])

  const src = siteUrl('editor-preview.html?edit=1')
  useEffect(sendLive, [data.page, data.hero, data.products, theme, sendLive])

  // сообщения со страницы
  useEffect(() => {
    const h = (e: MessageEvent<ToAdmin>) => {
      if (e.source !== frame.current?.contentWindow || e.origin !== location.origin) return
      const m = e.data
      if (typeof m?.type !== 'string' || !m.type.startsWith('slopay:')) return
      if (m.type === 'slopay:ready') {
        sendLive()
        if (scrollY.current) post({ type: 'slopay:scroll', y: scrollY.current })
      } else if (m.type === 'slopay:scrollpos' && Number.isFinite(m.y)) scrollY.current = m.y
      else if (m.type === 'slopay:select') {
        setSel(m.index)
        setPanel('block')
      } else if (m.type === 'slopay:move')
        set('page', (p) => {
          if (!Number.isInteger(m.from) || !Number.isInteger(m.to) || m.from < 0 || m.from >= p.blocks.length || m.to < 0 || m.to > p.blocks.length) return
          const [it] = p.blocks.splice(m.from, 1)
          p.blocks.splice(m.to > m.from ? m.to - 1 : m.to, 0, it)
          setSel(m.to > m.from ? m.to - 1 : m.to)
        })
      else if (m.type === 'slopay:text') {
        if (typeof m.value !== 'string') return
        if (m.index === 'hero' && m.field === 'subtitle') set('hero', (h) => { h.subtitle = m.value })
        if (typeof m.index === 'number' && m.field === 'title') set('page', (p) => {
          const block = p.blocks[m.index as number]
          if (block) block.title = m.value
        })
      }
    }
    addEventListener('message', h)
    return () => removeEventListener('message', h)
  }, [post, sendLive, set])

  const block = typeof sel === 'number' ? data.page.blocks[sel] : null
  const setBlock = (b: Block) => typeof sel === 'number' && set('page', (p) => void (p.blocks[sel] = b))
  const setStyle = (patch: Partial<BlockStyle>) =>
    typeof sel === 'number' &&
    set('page', (p) => {
      const st = { ...p.blocks[sel].style, ...patch } as Record<string, unknown>
      for (const k of Object.keys(st)) if (st[k] === undefined || st[k] === '') delete st[k]
      p.blocks[sel].style = Object.keys(st).length ? (st as BlockStyle) : undefined
    })
  const move = (d: -1 | 1) => {
    if (typeof sel !== 'number') return
    const to = sel + d
    if (to < 0 || to >= data.page.blocks.length) return
    set('page', (p) => {
      const [it] = p.blocks.splice(sel, 1)
      p.blocks.splice(to, 0, it)
    })
    setSel(to)
  }

  return (
    <div className="flex h-[calc(100dvh-64px)] flex-col lg:flex-row">
      {/* Фрейм с сайтом */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-center gap-2 border-b border-line bg-surface px-3 py-2">
          <div className="inline-flex rounded-xl border border-line p-0.5" role="group" aria-label="Размер экрана">
            {(
              [
                ['desktop', Monitor, 'Компьютер'],
                ['phone', Smartphone, 'Телефон'],
              ] as const
            ).map(([k, I, l]) => (
              <button key={k} onClick={() => setDevice(k)} aria-pressed={device === k} className={cn('flex h-8 cursor-pointer items-center gap-1.5 rounded-lg px-2.5 text-[13px] font-semibold', device === k ? 'bg-honey/15 text-honey-600' : 'text-ink-soft')}>
                <I className="h-4 w-4" /> <span className="hidden sm:inline">{l}</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => setInteractive((v) => !v)}
            aria-pressed={interactive}
            className={cn('flex h-9 cursor-pointer items-center gap-1.5 rounded-xl border px-3 text-[13px] font-semibold', interactive ? 'border-honey bg-honey/15 text-honey-600' : 'border-line text-ink-soft')}
            title="Включите, чтобы кнопки и ссылки на странице работали как у посетителя"
          >
            <MousePointerClick className="h-4 w-4" /> {interactive ? 'Режим посетителя' : 'Режим правки'}
          </button>
          <div className="ml-auto flex gap-2">
            <IconBtn label="Отменить шаг" disabled={!history.current.before.length} onClick={() => restore('before')}><Undo2 /></IconBtn>
            <IconBtn label="Повторить шаг" disabled={!history.current.after.length} onClick={() => restore('after')}><Redo2 /></IconBtn>
            <Btn size="sm" icon={<Palette />} onClick={() => setPanel('theme')}>
              Цвета сайта
            </Btn>
            <Btn size="sm" variant="primary" icon={<Plus />} onClick={() => setAdding(true)}>
              Блок
            </Btn>
          </div>
        </div>
        <div className="relative min-h-0 flex-1 overflow-hidden bg-[repeating-conic-gradient(rgb(128_128_128/0.06)_0_25%,transparent_0_50%)] bg-[length:24px_24px]">
          <iframe
            ref={frame}
            src={src}
            title="Сайт в режиме редактирования"
            className={cn('absolute inset-y-0 left-1/2 h-full -translate-x-1/2 border-0 bg-cream transition-[width]', device === 'phone' ? 'my-3 h-[calc(100%-24px)] w-[min(390px,calc(100%_-_16px))] rounded-[28px] shadow-2xl ring-1 ring-line' : 'w-full')}
          />
        </div>
        <div className="border-t border-line bg-surface px-3 py-2">
          <Select label="Раздел страницы" value={sel === null ? '' : String(sel)} options={[
            { value: '', label: 'Выбрать раздел' }, { value: 'hero', label: 'Первый экран' },
            ...data.page.blocks.map((block, index) => ({ value: String(index), label: `${nameOf(block)}${block.show === false ? ' (скрыт)' : ''}` })),
          ]} onChange={(value) => { setSel(value === '' ? null : value === 'hero' ? 'hero' : Number(value)); setPanel('block') }} />
        </div>
        <p className="hidden border-t border-line bg-surface px-3 py-1.5 text-[12px] text-muted md:block">
          Клик — выбрать блок · золотой ярлык — перетащить · двойной клик по тексту — редактировать
        </p>
      </div>

      {/* Панель свойств */}
      <aside className="inspector max-h-[40dvh] w-full shrink-0 overflow-y-auto overflow-x-hidden border-t border-line bg-surface lg:max-h-none lg:w-[380px] lg:border-l lg:border-t-0">
        {panel === 'theme' ? (
          <ThemePanel theme={theme} onChange={(t) => set('site', (s) => void ((s as { theme?: Theme }).theme = Object.keys(t).length ? t : undefined))} onClose={() => setPanel('block')} />
        ) : sel === 'hero' ? (
          <div className="p-4">
            <PanelHead title="Первый экран" onClose={() => setSel(null)} />
            <p className="mb-3 text-[13px] text-muted">Заголовок и фото редактируются здесь. Подзаголовок можно изменить двойным кликом в предпросмотре.</p>
            <HeroSettings />
          </div>
        ) : block ? (
          <div className="p-4">
            <PanelHead title={nameOf(block)} onClose={() => setSel(null)} />
            <div className="mb-4 flex flex-wrap gap-1">
              <IconBtn label="Выше" disabled={sel === 0} onClick={() => move(-1)}>
                <ArrowUp />
              </IconBtn>
              <IconBtn label="Ниже" disabled={sel === data.page.blocks.length - 1} onClick={() => move(1)}>
                <ArrowDown />
              </IconBtn>
              <IconBtn label={block.show === false ? 'Показать' : 'Скрыть'} onClick={() => setBlock({ ...block, show: block.show === false })}>
                {block.show === false ? <Eye /> : <EyeOff />}
              </IconBtn>
              {block.type !== 'builtin' && (
                <IconBtn
                  label="Удалить блок"
                  className="hover:bg-berry/10 hover:text-berry"
                  onClick={() => {
                    if (confirm(`Удалить блок «${nameOf(block)}»?`)) {
                      set('page', (p) => void p.blocks.splice(sel as number, 1))
                      setSel(null)
                    }
                  }}
                >
                  <Trash2 />
                </IconBtn>
              )}
            </div>
            <div role="tablist" className="mb-4 grid grid-cols-2 rounded-xl border border-line p-1">
              {(
                [
                  ['style', 'Оформление'],
                  ['content', 'Содержимое'],
                ] as const
              ).map(([k, l]) => (
                <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('h-9 cursor-pointer rounded-lg text-[13.5px] font-semibold', tab === k ? 'bg-honey/15 text-honey-600' : 'text-ink-soft')}>
                  {l}
                </button>
              ))}
            </div>
            {tab === 'style' ? <StylePanel s={block.style ?? {}} onChange={setStyle} /> : <BlockForm b={block} onChange={setBlock} />}
          </div>
        ) : (
          <div className="p-5 text-[14px] text-ink-soft">
            <p className="text-[16px] font-extrabold text-ink">Выберите блок на странице</p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5">
              <li>Кликните по блоку — здесь появятся его настройки.</li>
              <li>Тяните за золотой ярлык с названием, чтобы переставить блок.</li>
              <li>Отступы меняются во вкладке «Оформление».</li>
              <li>Дважды кликните по заголовку блока, чтобы изменить текст. Enter — готово.</li>
              <li>«Цвета сайта» — акцент, фон, карточки и текст для всей страницы.</li>
            </ul>
            <p className="mt-4 text-[13px] text-muted">Правки видны только вам. На сайт они попадут после «Опубликовать» внизу.</p>
          </div>
        )}
      </aside>

      <Modal open={adding} onClose={() => setAdding(false)} title="Добавить блок">
        <div className="grid gap-2 sm:grid-cols-2">
          {(Object.keys(TYPES) as CustomType[]).map((t) => {
            const T = TYPES[t]
            return (
              <button
                key={t}
                onClick={() => {
                  setAdding(false)
                  const at = typeof sel === 'number' ? sel + 1 : data.page.blocks.length
                  const b = blank(t)
                  if (b.type !== 'gallery' && b.type !== 'cards') (b as { title?: string }).title = 'Новый блок — кликните, чтобы изменить'
                  set('page', (p) => void p.blocks.splice(at, 0, b))
                  setSel(at)
                  setTab('content')
                  setPanel('block')
                }}
                className="flex cursor-pointer gap-3 rounded-2xl border border-line bg-cream p-4 text-left transition hover:border-honey"
              >
                <T.icon className="mt-0.5 h-5 w-5 shrink-0 text-honey" />
                <span>
                  <b className="block text-[15px]">{T.label}</b>
                  <span className="block text-[13px] text-muted">{T.desc}</span>
                </span>
              </button>
            )
          })}
        </div>
        <p className="mt-4 text-[13px] text-muted">{typeof sel === 'number' ? 'Блок встанет сразу после выбранного.' : 'Блок встанет в конец страницы.'}</p>
      </Modal>
    </div>
  )
}

function PanelHead({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2">
      <h2 className="truncate text-[17px] font-extrabold">{title}</h2>
      <IconBtn label="Закрыть" onClick={onClose}>
        <X />
      </IconBtn>
    </div>
  )
}

/* ───────── Цвета и размеры ───────── */

const SWATCHES = ['#d4af37', '#ebcb6e', '#e2566c', '#b8262c', '#9cc08f', '#229ed9', '#0a0908', '#12100c', '#1d1913', '#f4ecdc', '#fff1e6', '#ffffff']

function ColorField({ label, value, onChange, hint }: { label: string; value?: string; onChange: (v: string | undefined) => void; hint?: string }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[13px] font-bold text-ink-soft">{label}</span>
        {value && (
          <button onClick={() => onChange(undefined)} className="flex cursor-pointer items-center gap-1 text-[12px] font-semibold text-muted hover:text-ink">
            <RotateCcw className="h-3 w-3" /> как было
          </button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <label className="relative h-10 w-12 shrink-0 cursor-pointer overflow-hidden rounded-xl border border-line" style={{ background: value || 'repeating-linear-gradient(45deg,transparent 0 6px,rgb(128 128 128/.25) 6px 8px)' }}>
          <input type="color" value={value || '#d4af37'} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0" aria-label={label} />
        </label>
        <div className="flex flex-wrap gap-1">
          {SWATCHES.map((c) => (
            <button key={c} onClick={() => onChange(c)} aria-label={c} title={c} className={cn('h-6 w-6 cursor-pointer rounded-md ring-1 ring-line', value === c && 'ring-2 ring-honey')} style={{ background: c }} />
          ))}
        </div>
      </div>
      {hint && <p className="mt-1 text-[12px] text-muted">{hint}</p>}
    </div>
  )
}

function Range({ label, value, min, max, step = 4, onChange, unit = 'px' }: { label: string; value?: number; min: number; max: number; step?: number; onChange: (v: number | undefined) => void; unit?: string }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[13px] font-bold text-ink-soft">{label}</span>
        <span className="flex items-center gap-2 text-[12.5px] font-semibold">
          {value === undefined ? <span className="text-muted">авто</span> : `${value} ${unit}`}
          {value !== undefined && (
            <button onClick={() => onChange(undefined)} className="cursor-pointer text-muted hover:text-ink" aria-label={`${label}: как было`}>
              <RotateCcw className="h-3 w-3" />
            </button>
          )}
        </span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value ?? Math.round((min + max) / 2 / step) * step} onChange={(e) => onChange(Number(e.target.value))} className={cn('w-full cursor-pointer accent-[var(--color-honey)]', value === undefined && 'opacity-50')} aria-label={label} />
    </div>
  )
}

function StylePanel({ s, onChange }: { s: BlockStyle; onChange: (p: Partial<BlockStyle>) => void }) {
  return (
    <div className="grid gap-5">
      <ColorField label="Фон блока" value={s.bg} onChange={(bg) => onChange({ bg })} />
      <ColorField label="Цвет текста" value={s.text} onChange={(text) => onChange({ text })} />
      <ColorField label="Акцент (кнопки, выделения)" value={s.accent} onChange={(accent) => onChange({ accent })} />
      <Range label="Отступ сверху" value={s.padTop} min={0} max={240} onChange={(padTop) => onChange({ padTop })} />
      <Range label="Отступ снизу" value={s.padBottom} min={0} max={240} onChange={(padBottom) => onChange({ padBottom })} />
      <Range label="Размер заголовка" value={s.titleSize} min={24} max={80} step={2} onChange={(titleSize) => onChange({ titleSize })} />
      <Select
        label="Ширина содержимого"
        value={s.width ?? 'normal'}
        onChange={(width) => onChange({ width: width === 'normal' ? undefined : width })}
        options={[
          { value: 'narrow', label: 'Узкая (960 px)' },
          { value: 'normal', label: 'Обычная (1240 px)' },
          { value: 'wide', label: 'Широкая (1480 px)' },
        ]}
      />
      <Btn size="sm" variant="ghost" icon={<RotateCcw />} onClick={() => onChange({ bg: undefined, text: undefined, accent: undefined, padTop: undefined, padBottom: undefined, titleSize: undefined, width: undefined })}>
        Сбросить оформление блока
      </Btn>
    </div>
  )
}

function ThemePanel({ theme, onChange, onClose }: { theme: Theme; onChange: (t: Theme) => void; onClose: () => void }) {
  const p = (patch: Partial<Theme>) => {
    const t = { ...theme, ...patch } as Record<string, string | undefined>
    for (const k of Object.keys(t)) if (!t[k]) delete t[k]
    onChange(t as Theme)
  }
  return (
    <div className="grid gap-5 p-4">
      <PanelHead title="Цвета сайта" onClose={onClose} />
      <ColorField label="Акцент" value={theme.accent} onChange={(accent) => p({ accent })} hint="Кнопки, золотые надписи, значки — во всех темах" />
      <ColorField label="Фон страницы" value={theme.bg} onChange={(bg) => p({ bg })} hint="Для тёмной темы (она основная)" />
      <ColorField label="Карточки и плашки" value={theme.surface} onChange={(surface) => p({ surface })} />
      <ColorField label="Текст" value={theme.text} onChange={(text) => p({ text })} />
      <Btn size="sm" variant="ghost" icon={<RotateCcw />} onClick={() => onChange({})}>
        Вернуть цвета дизайна
      </Btn>
    </div>
  )
}
