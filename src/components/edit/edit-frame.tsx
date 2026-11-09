/**
 * Рамка блока в визуальном редакторе (сайт во фрейме админки, ?edit=1):
 * подсветка при наведении, выбор кликом, перетаскивание за ярлык, отступы — за верхний и нижний край.
 * На обычном сайте — просто обёртка <div data-bi="N"> для стилей блока.
 */
import { createContext, useRef, type ReactNode } from 'react'
import { GripVertical, EyeOff } from 'lucide-react'
import { EDIT_MODE, type Block } from '@/lib/content'
import { toAdmin, useLive } from '@/lib/live'
import { cn } from '@/lib/utils'

/** Номер блока для вложенных заголовков (правка текста прямо на странице). */
export const EditIndex = createContext<number | 'hero' | null>(null)

const NAMES: Record<string, string> = {
  hits: 'Хит продаж',
  reviews: 'Отзывы',
  howto: '4 шага и 3 гарантии',
  catalog: 'Каталог',
  why: 'Почему съедобные',
  occasions: 'По поводам',
  delivery: 'Доставка',
  process: 'Мастер',
  faq: 'Вопросы',
  corporate: 'Компаниям',
  text: 'Текст',
  imageText: 'Фото + текст',
  banner: 'Баннер',
  gallery: 'Галерея',
  cards: 'Карточки',
}
export const blockName = (b: Block) => (b.type === 'builtin' ? NAMES[b.section] : (b.title ? `${NAMES[b.type]}: ${b.title}` : NAMES[b.type]))

export function BlockFrame({ index, block, children }: { index: number; block: Block; children: ReactNode }) {
  if (!EDIT_MODE) return <div data-bi={index}>{children}</div>
  return <EditFrame index={index} block={block}>{children}</EditFrame>
}

function EditFrame({ index, block, children }: { index: number; block: Block; children: ReactNode }) {
  const { selected, interactive } = useLive()
  const ref = useRef<HTMLDivElement>(null)
  const hidden = block.show === false
  const isSel = selected === index

  // перетаскивание блока за ярлык: линия-подсказка показывает, куда он встанет
  const startDrag = (e: React.PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toAdmin({ type: 'slopay:select', index })
    const line = document.createElement('div')
    line.className = 'slopay-drop-line'
    document.body.appendChild(line)
    document.body.classList.add('slopay-dragging')
    let to = index
    let raf = 0
    let lastY = e.clientY
    const frames = () => [...document.querySelectorAll<HTMLElement>('[data-bi]')]
    const update = () => {
      const els = frames()
      to = els.length ? Number(els[els.length - 1].dataset.bi) + 1 : index
      for (const el of els) {
        const r = el.getBoundingClientRect()
        if (lastY < r.top + r.height / 2) {
          to = Number(el.dataset.bi)
          break
        }
      }
      const target = els.find((el) => Number(el.dataset.bi) === to)
      const r = (target ?? els[els.length - 1]).getBoundingClientRect()
      line.style.top = `${(target ? r.top : r.bottom) - 2}px`
      // автопрокрутка у краёв
      if (lastY < 80) scrollBy(0, -18)
      else if (lastY > innerHeight - 80) scrollBy(0, 18)
      raf = requestAnimationFrame(update)
    }
    const move = (ev: PointerEvent) => void (lastY = ev.clientY)
    const up = () => {
      cancelAnimationFrame(raf)
      removeEventListener('pointermove', move)
      removeEventListener('pointerup', up)
      line.remove()
      document.body.classList.remove('slopay-dragging')
      if (to !== index && to !== index + 1) toAdmin({ type: 'slopay:move', from: index, to })
    }
    addEventListener('pointermove', move)
    addEventListener('pointerup', up)
    raf = requestAnimationFrame(update)
  }

  // отступ сверху/снизу — тянуть за край
  const startResize = (edge: 'top' | 'bottom') => (e: React.PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toAdmin({ type: 'slopay:select', index })
    const section = ref.current?.querySelector<HTMLElement>(':scope > section')
    if (!section) return
    const start = parseFloat(getComputedStyle(section)[edge === 'top' ? 'paddingTop' : 'paddingBottom']) || 0
    const y0 = e.clientY
    document.body.classList.add('slopay-resizing')
    let raf = 0
    const move = (ev: PointerEvent) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const v = Math.max(0, Math.min(400, Math.round((start + ev.clientY - y0) / 4) * 4))
        toAdmin({ type: 'slopay:style', index, patch: edge === 'top' ? { padTop: v } : { padBottom: v } })
      })
    }
    const up = () => {
      removeEventListener('pointermove', move)
      removeEventListener('pointerup', up)
      document.body.classList.remove('slopay-resizing')
    }
    addEventListener('pointermove', move)
    addEventListener('pointerup', up)
  }

  return (
    <div
      ref={ref}
      data-bi={index}
      className={cn('slopay-edit relative', isSel && 'is-selected')}
      onClickCapture={(e) => {
        if (interactive || (e.target as HTMLElement).closest('[contenteditable="true"], .slopay-ui')) return
        e.preventDefault()
        e.stopPropagation()
        toAdmin({ type: 'slopay:select', index })
      }}
    >
      <EditIndex.Provider value={index}>
        {hidden ? (
          <div className="container-x py-5">
            <p className="flex items-center gap-2 rounded-2xl border border-dashed border-line px-4 py-3 text-[14px] text-muted">
              <EyeOff className="h-4 w-4" /> Скрытый блок «{blockName(block)}» — посетители его не видят
            </p>
          </div>
        ) : (
          children
        )}
      </EditIndex.Provider>
      <div aria-hidden className="slopay-ov pointer-events-none absolute inset-0 z-[35]" />
      {/* ярлык «прилипает» под шапкой сайта, пока блок на экране — его всегда можно схватить */}
      <div className="slopay-ui pointer-events-none absolute inset-0 z-[36]">
        <div className="pointer-events-auto sticky top-[84px] ml-3 mt-3 inline-flex">
        <button
          onPointerDown={startDrag}
          title="Перетащите, чтобы переставить блок"
          className="flex h-8 cursor-grab touch-none items-center gap-1 rounded-full bg-[#d4af37] pl-1.5 pr-3 text-[12.5px] font-bold text-black shadow-lg active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" /> {blockName(block)}
        </button>
        </div>
      </div>
      {!hidden && (
        <>
          <span onPointerDown={startResize('top')} title="Тяните — отступ сверху" className="slopay-ui slopay-handle top-0" />
          <span onPointerDown={startResize('bottom')} title="Тяните — отступ снизу" className="slopay-ui slopay-handle bottom-0" />
        </>
      )}
    </div>
  )
}

/** Рамка первого экрана: только выбор и правка текста (он всегда сверху). */
export function HeroFrame({ children }: { children: ReactNode }) {
  const { selected, interactive } = useLive()
  if (!EDIT_MODE) return <>{children}</>
  return (
    <div
      className={cn('slopay-edit relative', selected === 'hero' && 'is-selected')}
      onClickCapture={(e) => {
        if (interactive || (e.target as HTMLElement).closest('[contenteditable="true"], .slopay-ui')) return
        e.preventDefault()
        e.stopPropagation()
        toAdmin({ type: 'slopay:select', index: 'hero' })
      }}
    >
      <EditIndex.Provider value="hero">{children}</EditIndex.Provider>
      <div aria-hidden className="slopay-ov pointer-events-none absolute inset-0 z-[35]" />
      <span className="slopay-ui absolute left-3 top-3 z-[36] rounded-full bg-[#d4af37] px-3 py-1.5 text-[12.5px] font-bold text-black shadow-lg">Первый экран</span>
    </div>
  )
}

/** Стили редактора внутри фрейма. */
export function EditStyles() {
  if (!EDIT_MODE) return null
  return (
    <style>{`
      .slopay-edit:hover > .slopay-ov { outline: 2px dashed rgb(212 175 55 / .7); outline-offset: -2px }
      .slopay-edit.is-selected > .slopay-ov { outline: 3px solid #d4af37; outline-offset: -3px; background: rgb(212 175 55 / .04) }
      .slopay-edit > .slopay-ui { opacity: 0; transition: opacity .15s }
      .slopay-edit:hover > .slopay-ui, .slopay-edit.is-selected > .slopay-ui { opacity: 1 }
      .slopay-handle { position: absolute; left: 50%; z-index: 36; width: 72px; height: 12px; margin-left: -36px; border-radius: 99px;
        background: #d4af37; box-shadow: 0 2px 8px rgb(0 0 0 / .4); cursor: ns-resize; touch-action: none }
      .slopay-handle.top-0 { transform: translateY(-2px) } .slopay-handle.bottom-0 { transform: translateY(2px) }
      .slopay-drop-line { position: fixed; left: 8px; right: 8px; height: 4px; border-radius: 4px; background: #d4af37; z-index: 99; pointer-events: none; box-shadow: 0 0 0 4px rgb(212 175 55 / .25) }
      body.slopay-dragging, body.slopay-dragging * { cursor: grabbing !important; user-select: none }
      body.slopay-resizing, body.slopay-resizing * { cursor: ns-resize !important; user-select: none }
      [data-edit-text] { border-radius: 6px; transition: box-shadow .15s }
      [data-edit-text]:hover { box-shadow: 0 0 0 2px rgb(212 175 55 / .55); cursor: text }
      [data-edit-text]:focus { outline: none; box-shadow: 0 0 0 2px #d4af37; background: rgb(212 175 55 / .08) }
    `}</style>
  )
}

/** Текст, который можно править прямо на странице (только в редакторе). */
export function editableProps(index: number | 'hero' | null, field: string) {
  if (!EDIT_MODE || index === null) return {}
  return {
    contentEditable: true,
    suppressContentEditableWarning: true,
    spellCheck: false,
    'data-edit-text': field,
    onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        e.currentTarget.blur()
      }
      if (e.key === 'Escape') e.currentTarget.blur()
    },
    onBlur: (e: React.FocusEvent<HTMLElement>) => toAdmin({ type: 'slopay:text', index, field, value: e.currentTarget.innerText.replace(/\s+/g, ' ').trim() }),
  }
}
