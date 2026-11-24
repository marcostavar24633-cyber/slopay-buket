/** Товары: таблица с поиском и фильтрами, добавление / редактирование в окне, удаление. */
import { useEffect, useMemo, useState } from 'react'
import { Eye, EyeOff, Pencil, Plus, Trash2 } from 'lucide-react'
import { GALLERY_CATS } from '@/lib/gallery'
import type { Product } from '@/lib/content'
import { rub } from '@/lib/utils'
import { productProblem } from '../catalog-validation'
import { previewSrc, useStore } from '../store'
import { Badge, Btn, Confirm, Empty, FilterSelect, IconBtn, ImageField, Modal, PageHead, Pager, SearchInput, Select, TextArea, TextInput, Toggle } from '../ui'

const CATS = GALLERY_CATS.filter((c) => c.key !== 'all').map((c) => ({ value: c.key as string, label: c.label }))
const catLabel = (k: string) => CATS.find((c) => c.value === k)?.label ?? k
const PER_PAGE = 20

type Status = 'all' | 'shown' | 'hidden' | 'hit'
type Sort = 'default' | 'price-asc' | 'price-desc' | 'name'

export function Products({ params }: { params: URLSearchParams }) {
  const { data, mode, set, toast } = useStore()
  const items = data.products.items
  const [q, setQ] = useState(params.get('q') ?? '')
  const [cat, setCat] = useState('all')
  const [status, setStatus] = useState<Status>('all')
  const [sort, setSort] = useState<Sort>('default')
  const [page, setPage] = useState(0)
  const [edit, setEdit] = useState<{ index: number; item: Product } | null>(null)
  const [del, setDel] = useState<number | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkCategory, setBulkCategory] = useState('')
  const [bulkPrice, setBulkPrice] = useState('')

  // переход из поиска в шапке (?q=) и «Добавить товар» с дашборда (?new=1)
  useEffect(() => {
    if (params.get('q')) setQ(params.get('q')!)
    if (params.get('new')) openNew()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.toString()])

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    const matches = items
      .map((p, index) => ({ p, index }))
      .filter(({ p }) => (cat === 'all' || p.cat === cat) && (!s || [p.name, p.desc, p.id].some((t) => t.toLowerCase().includes(s))))
      .filter(({ p }) => (status === 'all' ? true : status === 'shown' ? p.show !== false : status === 'hidden' ? p.show === false : p.hit))
    if (sort === 'name') matches.sort((a, b) => a.p.name.localeCompare(b.p.name, 'ru'))
    if (sort === 'price-asc') matches.sort((a, b) => a.p.price - b.p.price)
    if (sort === 'price-desc') matches.sort((a, b) => b.p.price - a.p.price)
    return matches
  }, [items, q, cat, status, sort])
  useEffect(() => setPage(0), [q, cat, status, sort])
  const pages = Math.ceil(filtered.length / PER_PAGE)
  const currentPage = Math.min(page, Math.max(0, pages - 1))
  const view = filtered.slice(currentPage * PER_PAGE, (currentPage + 1) * PER_PAGE)
  const targets = items.filter((item) => selected.has(item.id))

  const selectItems = (ids: string[], checked: boolean) => setSelected((previous) => {
    const next = new Set(previous)
    ids.forEach((id) => checked ? next.add(id) : next.delete(id))
    return next
  })

  const applyBulk = (patch: Partial<Product>) => {
    const blocked = targets.find((item) => productProblem({ ...item, ...patch }, mode === 'demo'))
    if (blocked) return toast(`«${blocked.name}»: ${productProblem({ ...blocked, ...patch }, mode === 'demo')}`, 'error')
    set('products', (draft) => draft.items.forEach((item) => { if (selected.has(item.id)) Object.assign(item, patch) }))
    setSelected(new Set())
    setBulkCategory('')
    setBulkPrice('')
    toast(`Изменено товаров: ${targets.length}`)
  }

  const checkbox = (item: Product) => (
    <input type="checkbox" aria-label={`Выбрать товар: ${item.name}`} checked={selected.has(item.id)} onChange={(event) => selectItems([item.id], event.target.checked)} className="h-4 w-4 shrink-0 accent-honey" />
  )

  function openNew() {
    setEdit({ index: -1, item: { id: `p-${Date.now().toString(36)}`, cat: 'berry', name: '', desc: '', price: 3000, image: '', show: true, hit: false, hitLabel: false } })
  }
  const save = () => {
    if (!edit || productProblem(edit.item, mode === 'demo')) return
    set('products', (d) => {
      if (edit.index < 0) d.items.unshift(edit.item)
      else d.items[edit.index] = edit.item
    })
    setEdit(null)
  }
  const patch = (p: Partial<Product>) => setEdit((e) => (e ? { ...e, item: { ...e.item, ...p } } : e))
  const problem = edit ? productProblem(edit.item, mode === 'demo') : null
  const toggleVisibility = (item: Product, index: number) => {
    const show = item.show === false
    if (show && productProblem({ ...item, show }, mode === 'demo')) {
      setEdit({ index, item: { ...item, show } })
      return
    }
    set('products', (draft) => void (draft.items[index].show = show))
  }

  return (
    <>
      <PageHead
        title="Товары"
        sub={`${items.filter((p) => p.show !== false).length} на сайте из ${items.length}. Цены — «от», итог называете в переписке.`}
        actions={
          <Btn variant="primary" icon={<Plus />} onClick={openNew}>
            Добавить товар
          </Btn>
        }
      />

      <div className="overflow-hidden rounded-2xl border border-line bg-surface">
        <div className="flex flex-wrap gap-2 border-b border-line p-3">
          <SearchInput value={q} onChange={setQ} placeholder="Название, состав или код" />
          <FilterSelect label="Категория" value={cat} onChange={setCat} options={[{ value: 'all', label: 'Все категории' }, ...CATS]} />
          <FilterSelect<Status>
            label="Статус"
            value={status}
            onChange={setStatus}
            options={[
              { value: 'all', label: 'Любой статус' },
              { value: 'shown', label: 'На сайте' },
              { value: 'hidden', label: 'Скрытые' },
              { value: 'hit', label: 'Хиты' },
            ]}
          />
          <FilterSelect<Sort> label="Сортировка товаров" value={sort} onChange={setSort} options={[
            { value: 'default', label: 'Исходный порядок' }, { value: 'price-asc', label: 'Сначала дешевле' },
            { value: 'price-desc', label: 'Сначала дороже' }, { value: 'name', label: 'По названию' },
          ]} />
        </div>
        <div className="flex flex-wrap items-center gap-2 border-b border-line p-3">
          <label className="flex min-h-9 items-center gap-2 text-sm text-ink-soft">
            <input type="checkbox" checked={view.length > 0 && view.every(({ p }) => selected.has(p.id))} disabled={!view.length} onChange={(event) => selectItems(view.map(({ p }) => p.id), event.target.checked)} className="h-4 w-4 accent-honey" />
            Выбрать страницу
          </label>
          {targets.length > 0 && <>
            <span role="status" className="text-sm font-semibold">Выбрано: {targets.length}</span>
            <Btn size="sm" onClick={() => applyBulk({ show: false })}>Скрыть</Btn>
            <Btn size="sm" onClick={() => applyBulk({ show: true })}>Показать</Btn>
            <FilterSelect label="Новая категория" value={bulkCategory} onChange={setBulkCategory} options={[{ value: '', label: 'Перенести в категорию' }, ...CATS]} />
            <Btn size="sm" disabled={!bulkCategory} onClick={() => applyBulk({ cat: bulkCategory })}>Перенести</Btn>
            <input aria-label="Новая цена в рублях" placeholder="Новая цена, ₽" type="number" min="1" step="1" value={bulkPrice} onChange={(event) => setBulkPrice(event.target.value)} className="h-9 w-36 rounded-xl border border-line bg-cream px-2 text-sm" />
            <Btn size="sm" disabled={!Number.isSafeInteger(Number(bulkPrice)) || Number(bulkPrice) <= 0} onClick={() => applyBulk({ price: Number(bulkPrice) })}>Задать цену</Btn>
            <Btn size="sm" variant="ghost" onClick={() => setSelected(new Set())}>Снять выбор</Btn>
          </>}
        </div>

        {/* Таблица (компьютер) */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left text-[14px]">
            <thead className="text-[12px] uppercase tracking-wide text-muted">
              <tr className="border-b border-line">
                <th className="px-4 py-3 font-bold">Товар</th>
                <th className="px-4 py-3 font-bold">Категория</th>
                <th className="px-4 py-3 text-right font-bold">Цена от</th>
                <th className="px-4 py-3 font-bold">Статус</th>
                <th className="px-4 py-3 text-right font-bold">Действия</th>
              </tr>
            </thead>
            <tbody>
              {view.map(({ p, index }) => (
                <tr key={p.id} className="border-b border-line last:border-0 hover:bg-ink/[0.03]">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      {checkbox(p)}
                      <img src={previewSrc(p.image)} alt="" loading="lazy" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
                      <span className="min-w-0">
                        <span className="block font-bold">{p.name}</span>
                        <span className="block max-w-[340px] truncate text-[12.5px] text-muted">{p.desc}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-ink-soft">{catLabel(p.cat)}</td>
                  <td className="px-4 py-2.5 text-right font-bold tabular-nums">{rub(Number(p.price))}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {p.show !== false ? <Badge tone="ok">На сайте</Badge> : <Badge>Скрыт</Badge>}
                      {p.hit && <Badge tone="gold">Хит</Badge>}
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex justify-end gap-1">
                      <IconBtn label={p.show !== false ? 'Скрыть с сайта' : 'Показать на сайте'} onClick={() => toggleVisibility(p, index)}>
                        {p.show !== false ? <EyeOff /> : <Eye />}
                      </IconBtn>
                      <IconBtn label="Редактировать" onClick={() => setEdit({ index, item: { ...p } })}>
                        <Pencil />
                      </IconBtn>
                      <IconBtn label="Удалить" onClick={() => setDel(index)} className="hover:bg-berry/10 hover:text-berry">
                        <Trash2 />
                      </IconBtn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Карточки (телефон) */}
        <ul className="md:hidden">
          {view.map(({ p, index }) => (
            <li key={p.id} className="flex gap-3 border-b border-line p-3 last:border-0">
              {checkbox(p)}
              <img src={previewSrc(p.image)} alt="" loading="lazy" className="h-16 w-16 shrink-0 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <p className="font-bold leading-tight">{p.name}</p>
                <p className="mt-0.5 text-[12.5px] text-muted">
                  {catLabel(p.cat)} · <b className="text-ink">{rub(Number(p.price))}</b>
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {p.show !== false ? <Badge tone="ok">На сайте</Badge> : <Badge>Скрыт</Badge>}
                  {p.hit && <Badge tone="gold">Хит</Badge>}
                </div>
              </div>
              <div className="flex flex-col">
                <IconBtn label={p.show !== false ? 'Скрыть с сайта' : 'Показать на сайте'} onClick={() => toggleVisibility(p, index)}>
                  {p.show !== false ? <EyeOff /> : <Eye />}
                </IconBtn>
                <IconBtn label="Редактировать" onClick={() => setEdit({ index, item: { ...p } })}>
                  <Pencil />
                </IconBtn>
                <IconBtn label="Удалить" onClick={() => setDel(index)}>
                  <Trash2 />
                </IconBtn>
              </div>
            </li>
          ))}
        </ul>
        {!view.length && <Empty>Ничего не найдено. Измените поиск или фильтры.</Empty>}
        <Pager page={currentPage} pages={pages} onPage={setPage} />
      </div>

      {/* Окно добавления / редактирования */}
      <Modal
        open={!!edit}
        onClose={() => setEdit(null)}
        title={edit?.index === -1 ? 'Новый товар' : 'Редактировать товар'}
        wide
        footer={
          <>
            <Btn onClick={() => setEdit(null)}>Отмена</Btn>
            <Btn variant="primary" onClick={save} disabled={!edit || !!problem}>
              {edit?.index === -1 ? 'Добавить' : 'Сохранить'}
            </Btn>
          </>
        }
      >
        {edit && (
          <div className="grid gap-4 md:grid-cols-2">
            {problem && <p className="text-sm text-muted md:col-span-2">{problem}</p>}
            <div className="md:col-span-2">
              <ImageField label="Фото *" folder="unsorted" hint="Для публикации загрузите фото или укажите путь к файлу из unsorted." value={edit.item.image} onChange={(image) => patch({ image })} />
            </div>
            <TextInput label="Название *" value={edit.item.name} onChange={(name) => patch({ name })} placeholder="Например: Клубничное сердце" />
            <TextInput label="Цена от, ₽ *" type="number" inputMode="numeric" min={0} step={100} value={edit.item.price} onChange={(v) => patch({ price: Number(v) })} />
            <TextArea className="md:col-span-2" label="Состав / описание" rows={3} value={edit.item.desc} onChange={(desc) => patch({ desc })} hint="Видно на карточке и в окне заказа. Коротко: что внутри." />
            <Select label="Категория" value={edit.item.cat} onChange={(cat) => patch({ cat })} options={CATS} />
            <TextInput label="Порядок в «Хитах»" type="number" min={1} value={edit.item.hitOrder ?? ''} onChange={(v) => patch({ hitOrder: v ? Number(v) : undefined })} hint="1 — первый. Только для хитов." />
            <div className="grid gap-3 md:col-span-2">
              <Toggle checked={edit.item.show !== false} onChange={(show) => patch({ show })} label="Показывать на сайте" hint="Выключите, чтобы временно скрыть, не удаляя." />
              <Toggle checked={!!edit.item.hit} onChange={(hit) => patch({ hit })} label="В блоке «Хит продаж»" />
              <Toggle checked={!!edit.item.hitLabel} onChange={(hitLabel) => patch({ hitLabel })} label="Метка «Хит» на карточке" hint="Лучше не больше трёх, иначе метка теряет смысл." />
            </div>
          </div>
        )}
      </Modal>

      <Confirm
        text={del !== null ? `Товар «${items[del]?.name}» будет удалён из каталога. Можно вместо этого просто скрыть его.` : null}
        onYes={() => del !== null && set('products', (d) => void d.items.splice(del, 1))}
        onClose={() => setDel(null)}
      />
    </>
  )
}
