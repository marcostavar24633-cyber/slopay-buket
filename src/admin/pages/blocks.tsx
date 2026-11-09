/**
 * Блоки страницы: порядок, показ/скрытие, свои блоки (текст, фото + текст, баннер, галерея, карточки).
 * Готовые блоки сайта удалить нельзя — только скрыть (их вёрстка в коде, она тонко настроена).
 */
import { useEffect, useState } from 'react'
import { ArrowDown, ArrowUp, Eye, EyeOff, GalleryHorizontal, Image, LayoutGrid, Lock, Megaphone, Pencil, Plus, Trash2, Type } from 'lucide-react'
import type { Block, BuiltinKey, Cta } from '@/lib/content'
import { cn } from '@/lib/utils'
import type { Route } from '../layout'
import { useStore } from '../store'
import { Badge, Btn, Confirm, IconBtn, ImageField, Modal, PageHead, Select, TextArea, TextInput, Toggle } from '../ui'

export const BUILTIN_NAMES: Record<BuiltinKey, string> = {
  hits: 'Хит продаж',
  reviews: 'Отзывы',
  howto: '4 шага и 3 гарантии',
  catalog: 'Каталог с ценами',
  why: 'Почему съедобные',
  occasions: 'По поводам',
  delivery: 'Доставка',
  process: 'Мастер (Мария)',
  faq: 'Вопросы и ответы',
  corporate: 'Компаниям (тизер)',
}
/** У этих готовых блоков заголовок свёрстан особым образом — меняется только в коде. */
const FIXED_TITLE = new Set<BuiltinKey>(['process', 'corporate'])

const TYPES = {
  text: { label: 'Текст', desc: 'Заголовок и абзацы текста, можно кнопку', icon: Type },
  imageText: { label: 'Фото + текст', desc: 'Фото слева или справа, рядом текст', icon: Image },
  banner: { label: 'Баннер с кнопкой', desc: 'Яркая плашка: акция, сезон, призыв', icon: Megaphone },
  gallery: { label: 'Галерея фото', desc: 'Сетка фото с подписями', icon: GalleryHorizontal },
  cards: { label: 'Карточки', desc: 'Преимущества, условия, шаги — 3–6 карточек', icon: LayoutGrid },
} as const
type CustomType = keyof typeof TYPES

const CTA_OPTIONS: { value: Cta; label: string }[] = [
  { value: 'none', label: 'Без кнопки' },
  { value: 'messengers', label: 'Кнопки MAX и Telegram' },
  { value: 'quiz', label: 'Подобрать букет (квиз)' },
  { value: 'catalog', label: 'Смотреть каталог' },
]

const blank = (t: CustomType): Block =>
  t === 'gallery'
    ? { type: 'gallery', show: true, title: 'Наши работы', images: [] }
    : t === 'cards'
      ? { type: 'cards', show: true, title: 'Почему выбирают нас', cards: [{ icon: '🍓', title: '', text: '' }] }
      : t === 'banner'
        ? { type: 'banner', show: true, title: '', body: '', cta: 'messengers' }
        : t === 'imageText'
          ? { type: 'imageText', show: true, title: '', body: '', image: '', cta: 'none' }
          : { type: 'text', show: true, title: '', body: '', cta: 'none' }

const nameOf = (b: Block) => (b.type === 'builtin' ? BUILTIN_NAMES[b.section] : b.title || '(без заголовка)')

export function Blocks({ params, go }: { params: URLSearchParams; go: (r: Route) => void }) {
  const { data, set } = useStore()
  const blocks = data.page.blocks
  const [adding, setAdding] = useState(false)
  const [edit, setEdit] = useState<{ index: number; b: Block } | null>(null)
  const [del, setDel] = useState<number | null>(null)
  useEffect(() => void (params.get('new') && setAdding(true)), [params])

  const move = (i: number, d: -1 | 1) =>
    set('page', (p) => {
      const [it] = p.blocks.splice(i, 1)
      p.blocks.splice(i + d, 0, it)
    })
  const save = () => {
    if (!edit) return
    set('page', (p) => {
      if (edit.index < 0) p.blocks.push(edit.b)
      else p.blocks[edit.index] = edit.b
    })
    setEdit(null)
  }

  return (
    <>
      <PageHead
        title="Блоки страницы"
        sub="Порядок сверху вниз — как на сайте. Скрытый блок не виден посетителям, но не удаляется."
        actions={
          <Btn variant="primary" icon={<Plus />} onClick={() => setAdding(true)}>
            Добавить блок
          </Btn>
        }
      />

      <ol className="space-y-2">
        <li className="flex items-center gap-3 rounded-2xl border border-dashed border-line px-4 py-3 text-[14px] text-muted">
          <Lock className="h-4 w-4 shrink-0" />
          <span className="flex-1">
            <b className="text-ink-soft">Шапка и первый экран</b> — всегда сверху
          </span>
          <Btn size="sm" variant="ghost" onClick={() => go('settings')}>
            Изменить тексты
          </Btn>
        </li>
        {blocks.map((b, i) => {
          const Icon = b.type === 'builtin' ? LayoutGrid : TYPES[b.type].icon
          const hidden = b.show === false
          return (
            <li key={i} className={cn('flex items-center gap-3 rounded-2xl border border-line bg-surface px-3 py-2.5 md:px-4', hidden && 'border-dashed')}>
              <span className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-honey/12 text-honey-600', hidden && 'opacity-50')}>
                <Icon className="h-4 w-4" />
              </span>
              <div className={cn('min-w-0 flex-1', hidden && '[&>p]:text-muted')}>
                <p className="truncate font-bold">{nameOf(b)}</p>
                <div className="mt-0.5 flex flex-wrap gap-1">
                  <Badge tone={b.type === 'builtin' ? 'muted' : 'gold'}>{b.type === 'builtin' ? 'Готовый блок' : TYPES[b.type].label}</Badge>
                  {hidden && <Badge tone="danger">Скрыт</Badge>}
                </div>
              </div>
              <div className="flex shrink-0 flex-wrap justify-end gap-0.5">
                <IconBtn label="Выше" disabled={i === 0} onClick={() => move(i, -1)}>
                  <ArrowUp />
                </IconBtn>
                <IconBtn label="Ниже" disabled={i === blocks.length - 1} onClick={() => move(i, 1)}>
                  <ArrowDown />
                </IconBtn>
                <IconBtn label={hidden ? 'Показать' : 'Скрыть'} onClick={() => set('page', (p) => void (p.blocks[i].show = hidden))}>
                  {hidden ? <Eye /> : <EyeOff />}
                </IconBtn>
                <IconBtn label="Редактировать" onClick={() => setEdit({ index: i, b: JSON.parse(JSON.stringify(b)) })}>
                  <Pencil />
                </IconBtn>
                {b.type !== 'builtin' && (
                  <IconBtn label="Удалить" onClick={() => setDel(i)} className="hover:bg-berry/10 hover:text-berry">
                    <Trash2 />
                  </IconBtn>
                )}
              </div>
            </li>
          )
        })}
        <li className="flex items-center gap-3 rounded-2xl border border-dashed border-line px-4 py-3 text-[14px] text-muted">
          <Lock className="h-4 w-4 shrink-0" /> <b className="text-ink-soft">Подвал</b> — всегда внизу (контакты и реквизиты — в Настройках)
        </li>
      </ol>

      {/* Выбор типа нового блока */}
      <Modal open={adding} onClose={() => setAdding(false)} title="Какой блок добавить?">
        <div className="grid gap-2 sm:grid-cols-2">
          {(Object.keys(TYPES) as CustomType[]).map((t) => {
            const T = TYPES[t]
            return (
              <button
                key={t}
                onClick={() => {
                  setAdding(false)
                  setEdit({ index: -1, b: blank(t) })
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
        <p className="mt-4 text-[13px] text-muted">Новый блок появится в конце страницы — потом передвиньте его стрелками.</p>
      </Modal>

      <Modal
        open={!!edit}
        onClose={() => setEdit(null)}
        wide
        title={edit ? (edit.index < 0 ? 'Новый блок: ' : '') + (edit.b.type === 'builtin' ? BUILTIN_NAMES[edit.b.section] : TYPES[edit.b.type].label) : ''}
        footer={
          <>
            <Btn onClick={() => setEdit(null)}>Отмена</Btn>
            <Btn variant="primary" onClick={save}>
              {edit?.index === -1 ? 'Добавить на страницу' : 'Сохранить'}
            </Btn>
          </>
        }
      >
        {edit && <BlockForm b={edit.b} onChange={(b) => setEdit({ ...edit, b })} />}
      </Modal>

      <Confirm text={del !== null ? `Блок «${nameOf(blocks[del])}» будет удалён со страницы.` : null} onYes={() => del !== null && set('page', (p) => void p.blocks.splice(del, 1))} onClose={() => setDel(null)} />
    </>
  )
}

const MD_HINT = 'Пустая строка — новый абзац, «- » в начале строки — список, **жирный**, [текст ссылки](https://…)'

function BlockForm({ b, onChange }: { b: Block; onChange: (b: Block) => void }) {
  const p = (patch: Partial<Block>) => onChange({ ...b, ...patch } as Block)
  const show = <Toggle checked={b.show !== false} onChange={(v) => p({ show: v })} label="Показывать на сайте" />

  if (b.type === 'builtin')
    return (
      <div className="grid gap-4">
        {FIXED_TITLE.has(b.section) ? (
          <p className="rounded-xl bg-cream p-3 text-[13.5px] text-ink-soft">У этого блока особая вёрстка — его можно только передвинуть или скрыть.</p>
        ) : (
          <>
            <p className="rounded-xl bg-cream p-3 text-[13.5px] text-ink-soft">
              Содержимое блока берётся из разделов «Товары», «Отзывы», «Вопросы» и Настроек. Здесь можно заменить заголовок — пустое поле оставляет заголовок по умолчанию.
            </p>
            <TextInput label="Надпись над заголовком" value={b.eyebrow} onChange={(eyebrow) => p({ eyebrow })} placeholder="по умолчанию" />
            <TextInput label="Заголовок" value={b.title} onChange={(title) => p({ title })} placeholder="по умолчанию" />
            <TextInput label="Подзаголовок" value={b.sub} onChange={(sub) => p({ sub })} placeholder="по умолчанию" />
          </>
        )}
        {show}
      </div>
    )

  const head = (
    <>
      {b.type !== 'banner' && <TextInput label="Надпись над заголовком" value={b.eyebrow} onChange={(eyebrow) => p({ eyebrow })} placeholder="Например: Акция" />}
      <TextInput label="Заголовок" value={b.title} onChange={(title) => p({ title })} />
    </>
  )

  if (b.type === 'gallery')
    return (
      <div className="grid gap-4">
        {head}
        <TextInput label="Подзаголовок" value={b.body} onChange={(body) => p({ body })} />
        <div className="grid gap-3">
          {(b.images ?? []).map((im, k) => (
            <div key={k} className="grid gap-2 rounded-2xl border border-line p-3">
              <ImageField label={`Фото ${k + 1}`} value={im.image} onChange={(image) => p({ images: (b.images ?? []).map((x, j) => (j === k ? { ...x, image } : x)) })} />
              <div className="flex items-end gap-2">
                <TextInput className="flex-1" label="Подпись" value={im.caption} onChange={(caption) => p({ images: (b.images ?? []).map((x, j) => (j === k ? { ...x, caption } : x)) })} />
                <IconBtn label="Убрать фото" className="mb-1" onClick={() => p({ images: (b.images ?? []).filter((_, j) => j !== k) })}>
                  <Trash2 />
                </IconBtn>
              </div>
            </div>
          ))}
          <Btn icon={<Plus />} onClick={() => p({ images: [...(b.images ?? []), { image: '', caption: '' }] })}>
            Добавить фото
          </Btn>
        </div>
        {show}
      </div>
    )

  if (b.type === 'cards')
    return (
      <div className="grid gap-4">
        {head}
        <TextInput label="Подзаголовок" value={b.body} onChange={(body) => p({ body })} />
        {(b.cards ?? []).map((c, k) => (
          <div key={k} className="grid gap-2 rounded-2xl border border-line p-3 sm:grid-cols-[90px_1fr_auto] sm:items-end">
            <TextInput label="Значок" value={c.icon} onChange={(icon) => p({ cards: (b.cards ?? []).map((x, j) => (j === k ? { ...x, icon } : x)) })} placeholder="🍓" />
            <TextInput label={`Карточка ${k + 1}: заголовок`} value={c.title} onChange={(title) => p({ cards: (b.cards ?? []).map((x, j) => (j === k ? { ...x, title } : x)) })} />
            <IconBtn label="Убрать карточку" className="mb-1" onClick={() => p({ cards: (b.cards ?? []).filter((_, j) => j !== k) })}>
              <Trash2 />
            </IconBtn>
            <TextArea className="sm:col-span-3" rows={2} label="Текст" value={c.text} onChange={(text) => p({ cards: (b.cards ?? []).map((x, j) => (j === k ? { ...x, text } : x)) })} />
          </div>
        ))}
        <Btn icon={<Plus />} onClick={() => p({ cards: [...(b.cards ?? []), { icon: '', title: '', text: '' }] })}>
          Добавить карточку
        </Btn>
        {show}
      </div>
    )

  return (
    <div className="grid gap-4">
      {head}
      <TextArea label="Текст" rows={6} value={b.body} onChange={(body) => p({ body })} hint={MD_HINT} />
      {(b.type === 'imageText' || b.type === 'banner') && (
        <ImageField label={b.type === 'banner' ? 'Фон баннера (необязательно)' : 'Фото'} value={b.image} onChange={(image) => p({ image })} />
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Select label="Кнопка" value={(b.cta ?? (b.type === 'banner' ? 'messengers' : 'none')) as Cta} onChange={(cta) => p({ cta })} options={CTA_OPTIONS} />
      </div>
      {b.type === 'imageText' && <Toggle checked={!!b.imageRight} onChange={(imageRight) => p({ imageRight })} label="Фото справа" hint="На телефоне фото всегда сверху." />}
      {b.type === 'text' && <Toggle checked={!!b.center} onChange={(center) => p({ center })} label="Выровнять по центру" />}
      {show}
    </div>
  )
}
