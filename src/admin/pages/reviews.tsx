/** Отзывы: лента отзывов в блоке «Отзывы» и короткие цитаты, которые сменяются на первом экране. */
import { useEffect, useMemo, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStore, type Quote, type Review } from '../store'
import { Badge, Btn, Confirm, Empty, IconBtn, Modal, PageHead, SearchInput, TextArea, TextInput } from '../ui'

type Tab = 'reviews' | 'quotes'
const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
const today = () => {
  const d = new Date()
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

export function Reviews({ params }: { params: URLSearchParams }) {
  const { data, set } = useStore()
  const [tab, setTab] = useState<Tab>('reviews')
  const [q, setQ] = useState(params.get('q') ?? '')
  const [edit, setEdit] = useState<{ tab: Tab; index: number; item: Review & Quote } | null>(null)
  const [del, setDel] = useState<{ tab: Tab; index: number } | null>(null)
  useEffect(() => void (params.get('q') && setQ(params.get('q')!)), [params])

  const list = (tab === 'reviews' ? data.reviews.reviews : data.reviews.quotes) as (Review & Quote)[]
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    return list.map((r, index) => ({ r, index })).filter(({ r }) => !s || [r.name, r.text, r.item].some((t) => t?.toLowerCase().includes(s)))
  }, [list, q])

  const save = () => {
    if (!edit) return
    set('reviews', (d) => {
      if (edit.tab === 'reviews') {
        if (edit.index < 0) d.reviews.unshift(edit.item)
        else d.reviews[edit.index] = edit.item
      } else {
        const q: Quote = { name: edit.item.name, item: edit.item.item, text: edit.item.text }
        if (edit.index < 0) d.quotes.unshift(q)
        else d.quotes[edit.index] = q
      }
    })
    setEdit(null)
  }
  const patch = (p: Partial<Review & Quote>) => setEdit((e) => (e ? { ...e, item: { ...e.item, ...p } } : e))

  return (
    <>
      <PageHead
        title="Отзывы"
        sub="На сайте показываются 6 самых свежих отзывов по дате. Цифры «5,0 · 107 отзывов» меняются в Настройках."
        actions={
          <Btn variant="primary" icon={<Plus />} onClick={() => setEdit({ tab, index: -1, item: { name: '', date: today(), item: '', tag: '', text: '' } })}>
            {tab === 'reviews' ? 'Добавить отзыв' : 'Добавить цитату'}
          </Btn>
        }
      />
      <div role="tablist" className="mb-3 inline-flex rounded-xl border border-line bg-surface p-1">
        {(
          [
            ['reviews', `Лента отзывов (${data.reviews.reviews.length})`],
            ['quotes', `Цитаты на первом экране (${data.reviews.quotes.length})`],
          ] as const
        ).map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('h-9 cursor-pointer rounded-lg px-3 text-[13.5px] font-semibold', tab === k ? 'bg-honey/15 text-honey-600' : 'text-ink-soft')}>
            {l}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-surface">
        <div className="border-b border-line p-3">
          <SearchInput value={q} onChange={setQ} placeholder="Имя, текст или товар" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-[14px]">
            <thead className="text-[12px] uppercase tracking-wide text-muted">
              <tr className="border-b border-line">
                <th className="px-4 py-3 font-bold">Имя</th>
                {tab === 'reviews' && <th className="px-4 py-3 font-bold">Дата</th>}
                <th className="px-4 py-3 font-bold">Отзыв</th>
                <th className="px-4 py-3 font-bold">{tab === 'reviews' ? 'Метка' : 'Подпись'}</th>
                <th className="px-4 py-3 text-right font-bold">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(({ r, index }) => (
                <tr key={index} className="border-b border-line last:border-0 hover:bg-ink/[0.03]">
                  <td className="whitespace-nowrap px-4 py-3 font-bold">{r.name}</td>
                  {tab === 'reviews' && <td className="whitespace-nowrap px-4 py-3 text-ink-soft">{r.date}</td>}
                  <td className="px-4 py-3">
                    <p className="line-clamp-2 max-w-md text-ink-soft">{r.text}</p>
                    {tab === 'reviews' && <p className="mt-0.5 text-[12px] text-muted">{r.item}</p>}
                  </td>
                  <td className="px-4 py-3">{tab === 'reviews' ? r.tag && <Badge tone="gold">{r.tag}</Badge> : <span className="text-[13px] text-muted">{r.item}</span>}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <IconBtn label="Редактировать" onClick={() => setEdit({ tab, index, item: { ...r } })}>
                        <Pencil />
                      </IconBtn>
                      <IconBtn label="Удалить" onClick={() => setDel({ tab, index })} className="hover:bg-berry/10 hover:text-berry">
                        <Trash2 />
                      </IconBtn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!filtered.length && <Empty>Ничего не найдено.</Empty>}
      </div>

      <Modal
        open={!!edit}
        onClose={() => setEdit(null)}
        title={edit?.index === -1 ? 'Новый отзыв' : 'Редактировать'}
        footer={
          <>
            <Btn onClick={() => setEdit(null)}>Отмена</Btn>
            <Btn variant="primary" onClick={save} disabled={!edit?.item.name.trim() || !edit?.item.text.trim()}>
              Сохранить
            </Btn>
          </>
        }
      >
        {edit && (
          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput label="Имя *" value={edit.item.name} onChange={(name) => patch({ name })} placeholder="Анна К." />
              {edit.tab === 'reviews' ? (
                <TextInput label="Дата" value={edit.item.date} onChange={(date) => patch({ date })} hint="Формат: 12 марта 2025" />
              ) : (
                <TextInput label="Подпись" value={edit.item.item} onChange={(item) => patch({ item })} hint="Например: букет с клубникой" />
              )}
            </div>
            {edit.tab === 'reviews' && (
              <div className="grid gap-4 sm:grid-cols-2">
                <TextInput label="Что заказывали" value={edit.item.item} onChange={(item) => patch({ item })} placeholder="Мужской букет" />
                <TextInput label="Метка" value={edit.item.tag} onChange={(tag) => patch({ tag })} placeholder="Юбилей, Срочно…" />
              </div>
            )}
            <TextArea label="Текст *" rows={5} value={edit.item.text} onChange={(text) => patch({ text })} hint={edit.tab === 'quotes' ? 'Коротко, 1–2 предложения: цитата сменяется каждые 3 секунды.' : 'Дословно, как на Авито.'} />
          </div>
        )}
      </Modal>

      <Confirm
        text={del ? `Удалить отзыв «${(del.tab === 'reviews' ? data.reviews.reviews : data.reviews.quotes)[del.index]?.name}»?` : null}
        onYes={() => del && set('reviews', (d) => void (del.tab === 'reviews' ? d.reviews : d.quotes).splice(del.index, 1))}
        onClose={() => setDel(null)}
      />
    </>
  )
}
